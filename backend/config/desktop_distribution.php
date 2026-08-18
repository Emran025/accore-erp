<?php

return [
    /*
     * Public, non-secret identity exposed only by the narrow Desktop bootstrap
     * contract. Deployments should set ACCORE_SERVER_ID once during server setup.
     */
    'server_id' => env('ACCORE_SERVER_ID', 'accore-server-local'),
    'server_name' => env('ACCORE_SERVER_NAME', 'Accore Server'),
    'api_contract' => 'desktop-v1',
    'minimum_client_version' => env('ACCORE_MINIMUM_CLIENT_VERSION', '0.1.0'),
    'enrollment_mode' => env('ACCORE_DESKTOP_ENROLLMENT_MODE', 'evidence'),
    'certificate_fingerprint' => env('ACCORE_SERVER_CERTIFICATE_FINGERPRINT'),
    'enrollment_evidence_ttl_minutes' => (int) env('ACCORE_DESKTOP_ENROLLMENT_TTL_MINUTES', 15),
];
