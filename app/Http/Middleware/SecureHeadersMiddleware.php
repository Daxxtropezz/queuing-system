<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecureHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Remove headers that might expose server information
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        // Vite dev server hosts for development
        $viteDevHosts = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "ws://localhost:5173",
            "ws://127.0.0.1:5173",
            // Note: IPv6 [::1] is not properly supported in CSP by browsers
        ];

        // Common CSP directives for both environments
        $csp = [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
        ];

        if (app()->environment('local', 'development')) {
            // Development-specific CSP (more permissive)
            $csp = array_merge($csp, [
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' " . implode(' ', $viteDevHosts) . " https:",
                "script-src-elem 'self' 'unsafe-inline' " . implode(' ', $viteDevHosts) . " https:",
                "style-src 'self' 'unsafe-inline' " . implode(' ', $viteDevHosts) . " https:",
                "font-src 'self' data: " . implode(' ', $viteDevHosts) . " https:",
                "img-src 'self' data: blob: " . implode(' ', $viteDevHosts) . " https:",
                "connect-src 'self' " . implode(' ', $viteDevHosts) . " https: ws: wss:",
                "frame-src 'self' https://www.google.com/recaptcha/ https://www.google.com/",
                /** frame-src Fix for checking upon development, local **/
                "media-src 'self' blob: " . implode(' ', $viteDevHosts) . " https:",
            ]);
        } else {
            // Production CSP (more strict)
            $csp = array_merge($csp, [
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
                "script-src-elem 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
                "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net",
                "img-src 'self' data: blob: https:",
                "connect-src 'self' https://ui.shadcn.com/schema.json https:",
                "frame-src 'self' https://www.google.com/recaptcha/ https://www.google.com/",
                "media-src 'self' blob: https:",
            ]);
        }

        // Security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Only set HSTS in production
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Use report-only mode in development for easier debugging
        $header = app()->environment('production')
            ? 'Content-Security-Policy'
            : 'Content-Security-Policy'; // use report-only mode in development

        $response->headers->set($header, implode('; ', $csp));

        return $response;
    }
}
