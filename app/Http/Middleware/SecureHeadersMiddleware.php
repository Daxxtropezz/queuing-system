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

        // Detect dev mode (Laravel env OR common local hosts)
        $isDev = app()->environment('local', 'development')
            || preg_match('/^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/', $request->getHost());

        // Common CSP directives for both environments
        $csp = [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
        ];

        if ($isDev) {
            // Wildcard everything in dev to avoid host/IP CSP issues
            $csp = array_merge($csp, [
                "script-src * 'unsafe-inline' data: blob:",
                "script-src-elem * 'unsafe-inline' data: blob:",
                "style-src * 'unsafe-inline' data: blob:",
                "font-src * data: blob:",
                "img-src * data: blob:",
                "connect-src * ws: wss:",
                "frame-src *",
                "media-src * data: blob:",
            ]);
        } else {
            // Production CSP (strict)
            $csp = array_merge($csp, [
                "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
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
            : 'Content-Security-Policy';

        $response->headers->set($header, implode('; ', $csp));

        return $response;
    }
}
