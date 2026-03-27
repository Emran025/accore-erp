<?php

namespace ApiDocEngine\Core;

use Illuminate\Foundation\Http\FormRequest;
use ReflectionClass;
use ReflectionMethod;
use ReflectionNamedType;

class FormRequestExtractor
{
    public function detectRequestClass(string $action): ?string
    {
        if (!str_contains($action, '@')) {
            return null;
        }

        [$controllerClass, $method] = explode('@', $action, 2);

        if (!class_exists($controllerClass)) {
            return null;
        }

        try {
            $ref = new ReflectionMethod($controllerClass, $method);

            foreach ($ref->getParameters() as $param) {
                $type = $param->getType();
                if ($type instanceof ReflectionNamedType && !$type->isBuiltin()) {
                    $typeName = $type->getName();
                    if (class_exists($typeName) && is_subclass_of($typeName, FormRequest::class)) {
                        return $typeName;
                    }
                }
            }
        } catch (\Throwable $e) {
        }

        return null;
    }

    public function getRules(string $requestClass): array
    {
        if (!class_exists($requestClass)) {
            return [];
        }

        try {
            $ref      = new ReflectionClass($requestClass);
            $instance = $ref->newInstanceWithoutConstructor();

            if (method_exists($instance, 'rules')) {
                $rules = $instance->rules();
                return is_array($rules) ? $rules : [];
            }
        } catch (\Throwable $e) {
        }

        return [];
    }

    public function getMessages(string $requestClass): array
    {
        if (!class_exists($requestClass)) {
            return [];
        }

        try {
            $ref      = new ReflectionClass($requestClass);
            $instance = $ref->newInstanceWithoutConstructor();

            if (method_exists($instance, 'messages')) {
                $msgs = $instance->messages();
                return is_array($msgs) ? $msgs : [];
            }
        } catch (\Throwable $e) {
        }

        return [];
    }

    public function getMethodDocComment(string $action): string
    {
        if (!str_contains($action, '@')) {
            return '';
        }

        [$controllerClass, $method] = explode('@', $action, 2);

        if (!class_exists($controllerClass)) {
            return '';
        }

        try {
            $ref     = new ReflectionMethod($controllerClass, $method);
            $comment = $ref->getDocComment();
            return $comment ? $this->parseDocComment($comment) : '';
        } catch (\Throwable $e) {
        }

        return '';
    }

    private function parseDocComment(string $comment): string
    {
        $lines = explode("\n", $comment);
        $desc  = [];

        foreach ($lines as $line) {
            $line = trim($line, " \t\n\r*\/");
            if ($line && !str_starts_with($line, '@')) {
                $desc[] = $line;
            }
        }

        return implode(' ', array_filter($desc));
    }
}
