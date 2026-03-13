<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

class ValidateComplianceStructureAction
{
    public function execute(array $data): array
    {
        $errors = [];

        switch ($data['format']) {
            case 'json':
                json_decode($data['structure']);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $errors[] = 'JSON syntax error: ' . json_last_error_msg();
                }
                break;

            case 'xml':
                libxml_use_internal_errors(true);
                simplexml_load_string($data['structure']);
                if (libxml_get_errors()) {
                    foreach (libxml_get_errors() as $error) {
                        $errors[] = "XML error line {$error->line}: " . trim($error->message);
                    }
                    libxml_clear_errors();
                }
                break;

            case 'yml':
                try {
                    if (function_exists('yaml_parse')) {
                        $result = yaml_parse($data['structure']);
                        if ($result === false) {
                            $errors[] = 'Invalid YAML syntax';
                        }
                    }
                    if (str_contains($data['structure'], "\t")) {
                        $errors[] = 'Tabs are not allowed in YAML — use spaces for indentation';
                    }
                } catch (\Exception $e) {
                    $errors[] = 'YAML parse error: ' . $e->getMessage();
                }
                break;
        }

        return [
            'valid'  => empty($errors),
            'errors' => $errors,
        ];
    }
}
