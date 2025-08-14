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

        // Detect dev mode (Laravel env OR common local/LAN hosts)
        $host = $request->getHost();
        $isDev = app()->environment('local', 'development')
            || (bool) preg_match(
                '/^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/',
                $host
            );

        // Common CSP directives for both environments
        $csp = [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
        ];

        if ($isDev) {
            // Relaxed dev CSP to allow Vite/HMR over LAN
            $csp = array_merge($csp, [
                "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
                "script-src-elem * 'unsafe-inline' 'unsafe-eval' data: blob:",
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

        // Enforce CSP only when NOT in dev; otherwise send Report-Only
        $enforceCsp = !$isDev && app()->environment('production');
        $header = $enforceCsp ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';

        $response->headers->set($header, implode('; ', $csp));

        return $response;
    }
}
