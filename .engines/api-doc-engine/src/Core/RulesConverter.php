<?php

namespace ApiDocEngine\Core;

class RulesConverter
{
    public function toSchema(array $rules): array
    {
        $schema     = ['type' => 'object', 'properties' => []];
        $required   = [];
        $arrayMeta  = [];

        foreach ($rules as $field => $ruleSet) {
            $ruleList = $this->parseRuleSet($ruleSet);

            if (str_contains($field, '.*.')) {
                $this->handleArrayItem($schema, $arrayMeta, $field, $ruleList);
                continue;
            }

            if (str_contains($field, '.')) {
                $this->handleDotNotation($schema, $field, $ruleList);
                continue;
            }

            $property = $this->buildProperty($field, $ruleList);
            $schema['properties'][$field] = $property;

            if ($this->isRequired($ruleList)) {
                $required[] = $field;
            }
        }

        if (!empty($required)) {
            $schema['required'] = array_values(array_unique($required));
        }

        if (empty($schema['properties'])) {
            unset($schema['properties']);
        }

        return $schema;
    }

    private function parseRuleSet($ruleSet): array
    {
        if (is_string($ruleSet)) {
            return array_values(array_filter(explode('|', $ruleSet), fn($r) => $r !== ''));
        }

        if (is_array($ruleSet)) {
            $parsed = [];
            foreach ($ruleSet as $rule) {
                if (is_string($rule)) {
                    foreach (array_filter(explode('|', $rule)) as $r) {
                        $parsed[] = $r;
                    }
                } elseif (is_object($rule)) {
                    $parsed[] = (string) $rule;
                }
            }
            return $parsed;
        }

        return [];
    }

    private function buildProperty(string $field, array $ruleList): array
    {
        $prop         = [];
        $type         = null;
        $nullable     = in_array('nullable', $ruleList);
        $isNumericCtx = false;

        foreach ($ruleList as $rule) {
            [$name, $arg] = $this->splitRule($rule);

            switch ($name) {
                case 'string':
                    $type = 'string';
                    break;
                case 'integer':
                case 'int':
                case 'digits':
                case 'digits_between':
                    $type         = 'integer';
                    $isNumericCtx = true;
                    break;
                case 'numeric':
                case 'decimal':
                    $type         = 'number';
                    $isNumericCtx = true;
                    break;
                case 'boolean':
                case 'bool':
                    $type = 'boolean';
                    break;
                case 'array':
                    $type = 'array';
                    break;
                case 'email':
                    $type           = 'string';
                    $prop['format'] = 'email';
                    break;
                case 'date':
                    $type           = 'string';
                    $prop['format'] = 'date';
                    break;
                case 'date_format':
                    $type = 'string';
                    if ($arg) {
                        $prop['format'] = 'date-time';
                    }
                    break;
                case 'uuid':
                    $type           = 'string';
                    $prop['format'] = 'uuid';
                    break;
                case 'url':
                    $type           = 'string';
                    $prop['format'] = 'uri';
                    break;
                case 'ip':
                case 'ipv4':
                case 'ipv6':
                    $type = 'string';
                    break;
                case 'json':
                    $type = 'string';
                    break;
                case 'file':
                case 'image':
                case 'mimes':
                case 'mimetypes':
                    $type           = 'string';
                    $prop['format'] = 'binary';
                    break;
                case 'in':
                    if ($arg) {
                        $enum = explode(',', $arg);
                        $prop['enum'] = array_map('trim', $enum);
                    }
                    break;
                case 'not_in':
                    break;
                case 'min':
                    if ($arg !== null) {
                        $isNumericCtx
                            ? $prop['minimum'] = (float) $arg
                            : $prop['minLength'] = (int) $arg;
                    }
                    break;
                case 'max':
                    if ($arg !== null) {
                        $isNumericCtx
                            ? $prop['maximum'] = (float) $arg
                            : $prop['maxLength'] = (int) $arg;
                    }
                    break;
                case 'between':
                    if ($arg) {
                        $parts = explode(',', $arg);
                        if (count($parts) === 2) {
                            if ($isNumericCtx) {
                                $prop['minimum'] = (float) $parts[0];
                                $prop['maximum'] = (float) $parts[1];
                            } else {
                                $prop['minLength'] = (int) $parts[0];
                                $prop['maxLength'] = (int) $parts[1];
                            }
                        }
                    }
                    break;
                case 'regex':
                    if ($arg) {
                        $prop['pattern'] = trim($arg, '/');
                    }
                    break;
            }
        }

        if ($type === null) {
            $type = $this->inferTypeFromFieldName($field);
        }

        if ($nullable) {
            $prop['nullable'] = true;
        }

        if ($type === 'array') {
            $prop['type']  = 'array';
            $prop['items'] = ['type' => 'object'];
        } else {
            $prop['type'] = $type;
        }

        return $prop;
    }

    private function handleArrayItem(array &$schema, array &$arrayMeta, string $field, array $ruleList): void
    {
        [$arrayField, $nestedField] = explode('.*.', $field, 2);

        if (!isset($schema['properties'][$arrayField])) {
            $schema['properties'][$arrayField] = [
                'type'  => 'array',
                'items' => [
                    'type'       => 'object',
                    'properties' => [],
                ],
            ];
        }

        if (!isset($schema['properties'][$arrayField]['items']['properties'])) {
            $schema['properties'][$arrayField]['items']['properties'] = [];
        }

        $prop = $this->buildProperty($nestedField, $ruleList);
        $schema['properties'][$arrayField]['items']['properties'][$nestedField] = $prop;

        if ($this->isRequired($ruleList)) {
            $schema['properties'][$arrayField]['items']['required'][] = $nestedField;
        }
    }

    private function handleDotNotation(array &$schema, string $field, array $ruleList): void
    {
        $parts   = explode('.', $field, 2);
        $parent  = $parts[0];
        $child   = $parts[1];

        if (!isset($schema['properties'][$parent])) {
            $schema['properties'][$parent] = [
                'type'       => 'object',
                'properties' => [],
            ];
        }

        $schema['properties'][$parent]['properties'][$child] = $this->buildProperty($child, $ruleList);
    }

    private function isRequired(array $ruleList): bool
    {
        $notRequired = ['nullable', 'sometimes', 'optional'];
        if (in_array('nullable', $ruleList) && !in_array('required', $ruleList)) {
            return false;
        }
        if (in_array('required', $ruleList)) {
            return true;
        }
        foreach ($ruleList as $rule) {
            if (str_starts_with($rule, 'required_if:') ||
                str_starts_with($rule, 'required_with:') ||
                str_starts_with($rule, 'required_unless:') ||
                str_starts_with($rule, 'required_without:')) {
                return false;
            }
        }
        return false;
    }

    private function inferTypeFromFieldName(string $field): string
    {
        $lower = strtolower($field);
        if (str_ends_with($lower, '_id') || str_ends_with($lower, '_count') || $lower === 'id') {
            return 'integer';
        }
        if (str_ends_with($lower, '_at') || str_ends_with($lower, '_date') || str_ends_with($lower, 'date')) {
            return 'string';
        }
        if (str_contains($lower, 'amount') || str_contains($lower, 'price') ||
            str_contains($lower, 'rate') || str_contains($lower, 'quantity')) {
            return 'number';
        }
        if (str_contains($lower, 'is_') || str_contains($lower, 'has_') || $lower === 'active') {
            return 'boolean';
        }
        return 'string';
    }

    private function splitRule(string $rule): array
    {
        $pos = strpos($rule, ':');
        if ($pos === false) {
            return [strtolower(trim($rule)), null];
        }
        return [strtolower(substr($rule, 0, $pos)), substr($rule, $pos + 1)];
    }
}
