<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class ViteHotServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (! $this->app->environment('local')) {
            return;
        }

        $hotPath = public_path('hot');

        // compute URL from VITE_DEV_SERVER_URL or VITE_HMR_HOST/VITE_HMR_PORT
        $url = trim((string) env('VITE_DEV_SERVER_URL', ''));

        if ($url === '') {
            // prefer explicit env VITE_HMR_HOST when set
            $host = trim((string) env('VITE_HMR_HOST', ''));

            // if not set, try to derive host from APP_URL
            if ($host === '') {
                $appUrl = trim((string) env('APP_URL', ''));
                if ($appUrl !== '') {
                    $parts = @parse_url($appUrl);
                    if (is_array($parts) && ! empty($parts['host'])) {
                        $host = $parts['host'];
                        $derivedPort = $parts['port'] ?? null;
                    }
                }
            }

            if ($host === '' || $host === '0.0.0.0') {
                $host = 'localhost';
            }

            $port = (string) ($derivedPort ?? env('VITE_HMR_PORT', env('VITE_PORT', 5173)));
            $https = filter_var(env('VITE_DEV_SERVER_HTTPS', false), FILTER_VALIDATE_BOOL);
            $scheme = $https ? 'https' : 'http';
            $url = "{$scheme}://{$host}:{$port}";
        }

        // sanity: strip trailing slashes
        $url = rtrim($url, "/ \t\n\r\0\x0B");

        if ($url && (! file_exists($hotPath) || trim(file_get_contents($hotPath)) !== $url)) {
            // write hot file so Illuminate\Foundation\Vite::hotAsset() treats HMR as running
            try {
                @file_put_contents($hotPath, $url);
            } catch (\Throwable $e) {
                // don't crash app if file write fails
            }
        }
    }
}
