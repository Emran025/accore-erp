<?php

namespace ApiDocEngine\Core;

use Illuminate\Support\Facades\Route;

class RouteScanner
{
    public function scan(): array
    {
        return collect(Route::getRoutes()->getRoutes())
            ->filter(fn($route) => str_starts_with($route->uri(), 'api/'))
            ->map(fn($route) => [
                'methods'  => array_values(array_filter($route->methods(), fn($m) => $m !== 'HEAD')),
                'uri'      => $route->uri(),
                'name'     => $route->getName() ?? '',
                'action'   => $route->getActionName(),
                'middleware' => $route->middleware(),
            ])
            ->filter(fn($r) => str_contains($r['action'], '@') && !str_ends_with($r['action'], '@{closure}'))
            ->values()
            ->toArray();
    }
}
