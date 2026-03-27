<?php

namespace ApiDocEngine;

use ApiDocEngine\Commands\GenerateApiDocsCommand;
use Illuminate\Support\ServiceProvider;

class ApiDocEngineServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                GenerateApiDocsCommand::class,
            ]);
        }
    }
}
