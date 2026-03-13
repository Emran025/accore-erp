<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Domain Route Loader
|--------------------------------------------------------------------------
| This file loads all domain-specific route files from the routes/domains
| directory. Each file corresponds to a specific Domain → Capability.
|
| This file is included by routes/api.php alongside the legacy routes,
| ensuring both old and new endpoints coexist during the Strangler Fig
| migration.
|--------------------------------------------------------------------------
*/

$domainRoutes = glob(__DIR__ . '/domains/*.php');

foreach ($domainRoutes as $routeFile) {
    require $routeFile;
}
