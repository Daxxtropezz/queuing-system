<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Http\Requests\LoginRequest;

class AuthControllerDjango extends Controller
{
    public function login(Request $request)
    {
        // Verify reCAPTCHA if enabled
        if (config('services.recaptcha.enabled')) {
            $recaptchaResponse = $request->input('recaptcha_token');

            if (empty($recaptchaResponse)) {
                return back()->withErrors([
                    'recaptcha' => 'Please complete the reCAPTCHA verification.',
                ]);
            }

            try {
                Log::info('reCAPTCHA enabled:', ['enabled' => config('services.recaptcha.enabled')]);
                Log::info('reCAPTCHA secret:', ['secret' => config('services.recaptcha.secret_key')]);

                $recaptchaSecret = config('services.recaptcha.secret_key');
                $recaptchaVerifyResponse = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $recaptchaSecret,
                    'response' => $recaptchaResponse,
                    'remoteip' => $request->ip(),
                ]);

                $recaptchaData = $recaptchaVerifyResponse->json();

                if (!$recaptchaData['success']) {
                    Log::warning('reCAPTCHA failed', ['response' => $recaptchaData]);
                    return back()->withErrors([
                        'recaptcha' => 'reCAPTCHA verification failed. Please try again.',
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('reCAPTCHA error: ' . $e->getMessage());
                return back()->withErrors([
                    'recaptcha' => 'reCAPTCHA verification failed. Please try again.',
                ]);
            }
        }

        try {
            // Decrypt credentials first
            $decryptedEmail = rsa_decrypt($request->input('email'));
            $decryptedPassword = rsa_decrypt($request->input('password'));

            // Validate decrypted credentials
            if (empty($decryptedEmail) || empty($decryptedPassword)) {
                return back()->withErrors([
                    'email' => 'Invalid credentials provided.',
                ]);
            }

            // Send login request to Django API
            $response = Http::withHeaders([
                'X-Token' => env('SYSTEM_TOKEN'),
            ])->asForm()->post('http://172.26.62.16:8000/api/login/v2/', [
                'username' => $decryptedEmail,
                'password' => $decryptedPassword,
            ]);

            $apiResponse = $response->json();

            // Check for API errors
            if (isset($apiResponse['error'])) {
                return back()->withErrors([
                    'email' => 'Invalid username or password.',
                ]);
            }

            // Validate API response data
            if (!isset($apiResponse['data'])) {
                return back()->withErrors([
                    'email' => 'Authentication service unavailable. Please try again later.',
                ]);
            }

            $data = $apiResponse['data'];

            // Validate required fields from API
            if (empty($data['id_number']) || empty($data['first_name']) || empty($data['last_name'])) {
                return back()->withErrors([
                    'email' => 'Invalid user data received from authentication service.',
                ]);
            }

            // Create or update local user
            $user = User::updateOrCreate(
                ['id_number' => $data['id_number']],
                [
                    'username' => $decryptedEmail,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'] ?? $decryptedEmail,
                    'password' => bcrypt($decryptedPassword),
                    'position' => $data['position'],
                    'section' => $data['section'],
                    'division' => $data['division'],
                ]
            );

            if ($user->roles->isEmpty()) {
                // Check if there are any users with roles already assigned
                $hasAdministrator = User::role('Administrator')->exists();

                if ($hasAdministrator) {
                    $user->assignRole('Guest');
                    $user->role = 'Guest';
                } else {
                    $user->assignRole('Administrator');
                    $user->role = 'Administrator';
                }

                $user->save();
            }

            // Manually resolve Fortify's LoginRequest
            $loginRequest = LoginRequest::createFrom($request);

            // Attempt authentication
            if (Auth::attempt([
                'username' => $decryptedEmail,
                'password' => $decryptedPassword,
            ], $loginRequest->boolean('remember'))) {

                $loginRequest->session()->regenerate();

                // Handle 2FA if enabled
                if (!is_null(Auth::user()->two_factor_secret)) {
                    $loginRequest->session()->put('login.id', Auth::id());
                    Auth::logout();
                    return redirect()->route('two-factor.login');
                }

                return app(LoginResponse::class);
            }

            return back()->withErrors([
                'email' => 'Invalid username or password.',
            ]);
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors([
                'email' => 'An error occurred during login. Please try again.',
            ]);
        }
    }
}
