<?php

namespace App\Providers;

use App\Models\Video;
use App\Observers\VideoObserver;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
        // Enable strict mode for Eloquent models in non-production environments
        Model::shouldBeStrict(! $this->app->environment('production'));

        // Prohibit destructive commands in production environment
        DB::prohibitDestructiveCommands($this->app->environment('production'));
        
        Video::observe(VideoObserver::class);
    }
}
