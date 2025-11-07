import InputError from '@/components/input-error';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import rsaService from '@/Services/rsaService';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    recaptcha_token?: string;
};

interface LoginProps {
    status?: string;
    recaptchaEnabled?: boolean;
    recaptchaSiteKey?: string;
    errors?: {
        email?: string;
        password?: string;
        recaptcha?: string;
    };
}

export default function Login({ status, recaptchaEnabled = false, recaptchaSiteKey = '', errors: propErrors }: LoginProps) {
    const { data, setData, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
        recaptcha_token: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const MAX_ATTEMPTS = 3;
    const LOCKOUT_SECONDS = 180;

    // Helper to get lockout info from localStorage
    const getLockoutInfo = (username: string) => {
        const info = localStorage.getItem(`login_lockout_${username}`);
        return info ? JSON.parse(info) : { attempts: 0, lockoutUntil: 0 };
    };

    // Helper to set lockout info in localStorage
    const setLockoutInfo = (username: string, attempts: number, lockoutUntil: number) => {
        localStorage.setItem(`login_lockout_${username}`, JSON.stringify({ attempts, lockoutUntil }));
    };

    // Helper to clear lockout info
    const clearLockoutInfo = (username: string) => {
        localStorage.removeItem(`login_lockout_${username}`);
    };

    const showErrorToast = (message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: message,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
        });
    };

    const resetRecaptcha = () => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const username = data.email;
        const lockoutInfo = getLockoutInfo(username);
        const now = Math.floor(Date.now() / 1000);

        // Check if user is locked out
        if (lockoutInfo.lockoutUntil && now < lockoutInfo.lockoutUntil) {
            const secondsLeft = lockoutInfo.lockoutUntil - now;
            showErrorToast(`You must wait at ${secondsLeft} seconds before logging in again.`);
            return;
        }

        if (recaptchaEnabled && !data.recaptcha_token) {
            showErrorToast('Please complete the reCAPTCHA verification');
            return;
        }

        let encryptedEmail, encryptedPassword;
        try {
            encryptedEmail = await rsaService.encrypt(data.email);
            encryptedPassword = await rsaService.encrypt(data.password);
        } catch (err: unknown) {
            console.error('Encryption failed:', err);
            showErrorToast('We encountered a technical issue. Please try again or contact support.');
            return;
        }

        router.post(
            route('djangologin'),
            {
                email: encryptedEmail,
                password: encryptedPassword,
                remember: data.remember,
                recaptcha_token: data.recaptcha_token,
            },
            {
                onFinish: () => {
                    reset('password');
                    if (recaptchaEnabled) {
                        resetRecaptcha();
                        setData('recaptcha_token', '');
                    }
                },
                onError: (errors) => {
                    if (recaptchaEnabled) {
                        resetRecaptcha();
                        setData('recaptcha_token', '');
                    }

                    // If login failed (invalid username/password)
                    if (errors.email || errors.password) {
                        let { attempts } = getLockoutInfo(username);
                        attempts = attempts ? attempts + 1 : 1;
                        if (attempts >= MAX_ATTEMPTS) {
                            const lockoutUntil = now + LOCKOUT_SECONDS;
                            setLockoutInfo(username, attempts, lockoutUntil);
                            showErrorToast(`You must wait at ${LOCKOUT_SECONDS} seconds before logging in again.`);
                        } else {
                            setLockoutInfo(username, attempts, 0);
                            showErrorToast(
                                `Invalid username/password, you only got ${MAX_ATTEMPTS - attempts} for the username before being locked out`,
                            );
                        }
                    } else if (errors.recaptcha) {
                        showErrorToast('reCAPTCHA verification failed');
                    }
                },
                onSuccess: () => {
                    // On successful login, clear lockout info
                    clearLockoutInfo(username);
                },
            },
        );
    };

    const handleRecaptchaChange = (token: string | null) => {
        setData('recaptcha_token', token || '');
    };

    return (
        <AuthLayout title="Log in to Your Account" description="Enter your details below to access your account">
            <Head title="Log in" />

            {status && (
                <Box className="mb-6 rounded-lg bg-green-100 p-4 text-center text-lg text-green-800 dark:bg-green-900 dark:text-green-200">
                    {status}
                </Box>
            )}

            <form className="space-y-6" onSubmit={submit}>
                <Box className="space-y-4">
                    <Box>
                        <Input
                            id="email"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value.replace(/['"]/g, ''))}
                            placeholder="Enter your username"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white/90 p-4 text-lg dark:border-gray-600 dark:bg-gray-800/90 dark:text-white"
                        />
                        <InputError message={errors.email || propErrors?.email} className="text-lg text-red-600 dark:text-red-400" />
                    </Box>

                    <Box className="relative">
                        <Box className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value.replace(/['"]/g, ''))}
                                placeholder="Enter your password"
                                className="w-full rounded-lg border-2 border-gray-300 bg-white/90 p-4 pr-12 text-lg dark:border-gray-600 dark:bg-gray-800/90 dark:text-white"
                            />
                            <button
                                type="button"
                                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={3}
                            >
                                {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </button>
                        </Box>
                        <InputError message={errors.password || propErrors?.password} className="text-lg text-red-600 dark:text-red-400" />
                    </Box>

                    <Box className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            className="h-6 w-6 cursor-pointer"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={4}
                        />
                        <Label htmlFor="remember" className="text-lg text-gray-800 dark:text-gray-200">
                            Remember me
                        </Label>
                    </Box>

                    {recaptchaEnabled && recaptchaSiteKey && (
                        <>
                            <Box className="flex justify-center py-4">
                                <Box className="mx-auto flex w-full max-w-xs justify-center sm:max-w-sm md:max-w-md">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={recaptchaSiteKey}
                                        onChange={handleRecaptchaChange}
                                        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                                    />
                                </Box>
                            </Box>
                            {propErrors?.recaptcha && (
                                <InputError message={propErrors.recaptcha} className="text-center text-lg text-red-600 dark:text-red-400" />
                            )}
                        </>
                    )}

                    <Button
                        type="submit"
                        className="w-full cursor-pointer rounded-lg bg-blue-800 px-6 py-4 text-xl font-semibold text-white shadow-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center">
                                <LoaderCircle className="mr-2 h-6 w-6 animate-spin" />
                                Signing In...
                            </span>
                        ) : (
                            'Log in'
                        )}
                    </Button>
                </Box>
            </form>
        </AuthLayout>
    );
}
