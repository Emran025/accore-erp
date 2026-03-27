<?php

namespace ApiDocEngine\Core;

class OpenApiBuilder
{
    private FormRequestExtractor $extractor;
    private RulesConverter $converter;

    private array $schemas = [];

    public function __construct(FormRequestExtractor $extractor, RulesConverter $converter)
    {
        $this->extractor = $extractor;
        $this->converter = $converter;
    }

    public function build(string $domain, string $subDomain, array $routes): array
    {
        $this->schemas = $this->baseSchemas();

        $paths = [];
        foreach ($this->groupByPath($routes) as $path => $methods) {
            $pathItem = [];
            foreach ($methods as $httpMethod => $route) {
                $pathItem[$httpMethod] = $this->buildOperation($httpMethod, $route);
            }
            $paths[$path] = $pathItem;
        }

        ksort($paths);

        return [
            'openapi' => '3.0.3',
            'info'    => [
                'title'       => "$domain / $subDomain API",
                'version'     => '2.0.0',
                'description' => "Auto-generated, authoritative API documentation for the $domain $subDomain sub-domain. Generated from the live Laravel router, FormRequest validation rules, and controller signatures.",
            ],
            'servers'    => [['url' => '/api/v2', 'description' => 'Production API v2']],
            'security'   => [['SessionToken' => []]],
            'tags'       => [['name' => $subDomain, 'description' => "Endpoints for the $domain $subDomain sub-domain"]],
            'paths'      => empty($paths) ? new \stdClass() : $paths,
            'components' => [
                'schemas'         => $this->schemas,
                'securitySchemes' => [
                    'SessionToken' => [
                        'type'        => 'apiKey',
                        'in'          => 'header',
                        'name'        => 'X-Session-Token',
                        'description' => 'Session token obtained from the login endpoint',
                    ],
                ],
            ],
        ];
    }

    public function schemaCount(): int
    {
        return count($this->schemas);
    }

    private function groupByPath(array $routes): array
    {
        $groups = [];

        foreach ($routes as $route) {
            $path = $this->normalizePath($route['uri']);
            foreach ($route['methods'] as $method) {
                $method = strtolower($method);
                if ($method === 'head') {
                    continue;
                }
                $groups[$path][$method] = $route;
            }
        }

        return $groups;
    }

    private function normalizePath(string $uri): string
    {
        $path = preg_replace('#^api/v2#', '', $uri);
        $path = $path ?: '/';
        if ($path !== '/' && !str_starts_with($path, '/')) {
            $path = '/' . $path;
        }
        return $path;
    }

    private function buildOperation(string $method, array $route): array
    {
        $summary    = $this->generateSummary($method, $route['name'], $route['action']);
        $docComment = $this->extractor->getMethodDocComment($route['action']);

        $operation = [
            'summary'     => $summary,
            'description' => $docComment ?: $summary,
            'operationId' => $route['name'] ?: $this->makeOperationId($route['action']),
            'tags'        => [$this->extractTag($route['action'])],
            'security'    => $this->buildSecurity($route),
        ];

        $parameters = $this->buildParameters($method, $route);
        if (!empty($parameters)) {
            $operation['parameters'] = $parameters;
        }

        if (in_array($method, ['post', 'put', 'patch'])) {
            $requestBody = $this->buildRequestBody($route['action']);
            if ($requestBody) {
                $operation['requestBody'] = $requestBody;
            }
        }

        $operation['responses'] = $this->buildResponses($method);

        return $operation;
    }

    private function buildParameters(string $method, array $route): array
    {
        $params = [];

        preg_match_all('/\{([^}?]+)\??}/', $route['uri'], $matches);
        foreach ($matches[1] as $param) {
            $required = !str_contains($route['uri'], '{' . $param . '?}');
            $params[] = [
                'name'        => $param,
                'in'          => 'path',
                'required'    => $required,
                'description' => $this->describePathParam($param),
                'schema'      => ['type' => str_ends_with($param, '_id') || $param === 'id' ? 'integer' : 'string'],
            ];
        }

        if ($method === 'get') {
            $requestClass = $this->extractor->detectRequestClass($route['action']);
            if ($requestClass) {
                $rules = $this->extractor->getRules($requestClass);
                foreach ($rules as $field => $ruleSet) {
                    if (str_contains($field, '.')) {
                        continue;
                    }
                    $ruleList = is_string($ruleSet) ? explode('|', $ruleSet) : (array) $ruleSet;
                    $params[] = [
                        'name'     => $field,
                        'in'       => 'query',
                        'required' => in_array('required', $ruleList),
                        'schema'   => $this->queryParamSchema($ruleList),
                    ];
                }
            }
        }

        return $params;
    }

    private function queryParamSchema(array $ruleList): array
    {
        $types = ['integer' => 'integer', 'int' => 'integer', 'numeric' => 'number', 'boolean' => 'boolean', 'bool' => 'boolean', 'array' => 'array'];
        foreach ($ruleList as $rule) {
            [$name, $arg] = array_pad(explode(':', $rule, 2), 2, null);
            $name = strtolower(trim($name));
            if (isset($types[$name])) {
                $schema = ['type' => $types[$name]];
                if ($name === 'array') {
                    $schema['items'] = ['type' => 'string'];
                }
                return $schema;
            }
            if ($name === 'in' && $arg) {
                return ['type' => 'string', 'enum' => explode(',', $arg)];
            }
        }
        return ['type' => 'string'];
    }

    private function buildRequestBody(string $action): ?array
    {
        $requestClass = $this->extractor->detectRequestClass($action);

        if (!$requestClass) {
            return [
                'required' => true,
                'content'  => [
                    'application/json' => [
                        'schema' => ['type' => 'object'],
                    ],
                ],
            ];
        }

        $rules      = $this->extractor->getRules($requestClass);
        $schemaName = $this->classBasename($requestClass);

        if (!empty($rules)) {
            $this->schemas[$schemaName] = $this->converter->toSchema($rules);
        }

        return [
            'required' => true,
            'content'  => [
                'application/json' => [
                    'schema' => empty($rules)
                        ? ['type' => 'object']
                        : ['$ref' => "#/components/schemas/$schemaName"],
                ],
            ],
        ];
    }

    private function buildSecurity(array $route): array
    {
        $middleware = $route['middleware'] ?? [];
        foreach ($middleware as $mw) {
            if (str_starts_with($mw, 'api.auth') || str_starts_with($mw, 'auth')) {
                return [['SessionToken' => []]];
            }
        }
        return [];
    }

    private function buildResponses(string $method): array
    {
        $successCode = $method === 'post' ? '201' : '200';

        return [
            $successCode => [
                'description' => 'Successful operation',
                'content'     => [
                    'application/json' => [
                        'schema' => ['$ref' => '#/components/schemas/SuccessResponse'],
                    ],
                ],
            ],
            '400' => [
                'description' => 'Validation error or bad request',
                'content'     => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/ErrorResponse']]],
            ],
            '401' => [
                'description' => 'Unauthenticated — missing or expired session token',
                'content'     => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/ErrorResponse']]],
            ],
            '403' => [
                'description' => 'Forbidden — insufficient permissions',
                'content'     => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/ErrorResponse']]],
            ],
            '404' => [
                'description' => 'Resource not found',
                'content'     => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/ErrorResponse']]],
            ],
            '422' => [
                'description' => 'Unprocessable entity — validation failed',
                'content'     => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/ValidationErrorResponse']]],
            ],
            '500' => [
                'description' => 'Internal server error',
                'content'     => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/ErrorResponse']]],
            ],
        ];
    }

    private function generateSummary(string $method, string $name, string $action): string
    {
        if ($name) {
            $segments = array_filter(explode('.', $name));
            $last     = end($segments);
            return $this->methodLabel($method) . ' ' . ucfirst(str_replace('_', ' ', $last ?? $name));
        }

        $actionParts  = explode('@', $action);
        $actionMethod = end($actionParts) ?: '';

        return $this->methodLabel($method) . ' ' . trim(ucfirst(strtolower(preg_replace('/([A-Z])/', ' $1', $actionMethod))));
    }

    private function methodLabel(string $method): string
    {
        return match ($method) {
            'get'    => 'List or retrieve',
            'post'   => 'Create',
            'put'    => 'Update',
            'patch'  => 'Partially update',
            'delete' => 'Delete',
            default  => ucfirst($method),
        };
    }

    private function extractTag(string $action): string
    {
        if (!str_contains($action, 'Api\\V2\\')) {
            return 'General';
        }

        $relative = ltrim(str_replace('App\\Http\\Controllers\\Api\\V2\\', '', explode('@', $action)[0]), '\\');
        $parts    = explode('\\', $relative);

        return count($parts) >= 2 ? $parts[1] : ($parts[0] ?? 'General');
    }

    private function describePathParam(string $param): string
    {
        if ($param === 'id') {
            return 'The unique numeric ID of the resource';
        }
        if (str_ends_with($param, 'Id') || str_ends_with($param, '_id')) {
            $resource = str_replace(['Id', '_id'], '', $param);
            return "The unique ID of the $resource";
        }
        if (str_ends_with($param, 'uuid') || str_ends_with($param, 'Uuid')) {
            return 'The unique UUID of the resource';
        }
        return ucfirst(str_replace('_', ' ', $param));
    }

    private function makeOperationId(string $action): string
    {
        return strtolower(str_replace(['\\', '@', ' '], ['_', '_', ''], ltrim($action, '\\')));
    }

    private function classBasename(string $class): string
    {
        $parts = explode('\\', $class);
        return end($parts);
    }

    private function baseSchemas(): array
    {
        return [
            'SuccessResponse' => [
                'type'       => 'object',
                'properties' => [
                    'success' => ['type' => 'boolean', 'example' => true],
                    'message' => ['type' => 'string', 'example' => 'Operation completed successfully'],
                    'data'    => ['type' => 'object', 'description' => 'The response payload', 'nullable' => true],
                ],
            ],
            'PaginatedResponse' => [
                'type'       => 'object',
                'properties' => [
                    'success'      => ['type' => 'boolean', 'example' => true],
                    'message'      => ['type' => 'string'],
                    'data'         => ['type' => 'array', 'items' => ['type' => 'object']],
                    'current_page' => ['type' => 'integer', 'example' => 1],
                    'per_page'     => ['type' => 'integer', 'example' => 25],
                    'total'        => ['type' => 'integer', 'example' => 100],
                    'last_page'    => ['type' => 'integer', 'example' => 4],
                ],
            ],
            'ErrorResponse' => [
                'type'       => 'object',
                'properties' => [
                    'success' => ['type' => 'boolean', 'example' => false],
                    'message' => ['type' => 'string', 'example' => 'An error occurred'],
                ],
            ],
            'ValidationErrorResponse' => [
                'type'       => 'object',
                'properties' => [
                    'success' => ['type' => 'boolean', 'example' => false],
                    'message' => ['type' => 'string', 'example' => 'The given data was invalid'],
                    'errors'  => [
                        'type'                 => 'object',
                        'description'          => 'Validation errors keyed by field name',
                        'additionalProperties' => ['type' => 'array', 'items' => ['type' => 'string']],
                    ],
                ],
            ],
        ];
    }
}
