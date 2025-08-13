<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Session;

class DjangoAuthMiddleware
{
    public function handle($request, Closure $next)
    {
        if (!session()->has('session_id') || !session()->has('username')) {
            return redirect('/login');
        }

        // Optionally, you can check if the session is still valid by making a request to the Django API
        // dd('Session ID: ' . session('session_id') . ', Username: ' . session('username'));
        return $next($request);
    }
}
