import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import Box from '@/components/ui/box';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Only one field should be sent; the server (Fortify) will validate whichever is present
        post('/two-factor-challenge');
    };

    return (
        <AuthLayout title="Two-Factor Authentication" description={useRecovery ? 'Enter one of your recovery codes.' : 'Enter the authentication code from your authenticator app.'}>
            <Head title="Two-Factor Challenge" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {!useRecovery ? (
                    <Box className="grid gap-2">
                        <Label htmlFor="code">Authentication Code</Label>
                        <Box className="flex justify-center">
                            <InputOTP id="code" name="code" maxLength={6} value={data.code} onChange={(value) => setData('code', value)}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="rounded-md shadow-md ring-1 shadow-black/40 ring-black/50" />
                                    <InputOTPSlot index={1} className="rounded-md shadow-md ring-1 shadow-black/40 ring-black/50" />
                                    <InputOTPSlot index={2} className="rounded-md shadow-md ring-1 shadow-black/40 ring-black/50" />
                                    <InputOTPSlot index={3} className="rounded-md shadow-md ring-1 shadow-black/40 ring-black/50" />
                                    <InputOTPSlot index={4} className="rounded-md shadow-md ring-1 shadow-black/40 ring-black/50" />
                                    <InputOTPSlot index={5} className="rounded-md shadow-md ring-1 shadow-black/40 ring-black/50" />
                                </InputOTPGroup>
                            </InputOTP>
                        </Box>
                        <InputError message={errors.code} />
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline self-start"
                            onClick={() => setUseRecovery(true)}
                        >
                            Use a recovery code instead
                        </button>
                    </Box>
                ) : (
                    <Box className="grid gap-2">
                        <Label htmlFor="recovery_code">Recovery Code</Label>
                        <input
                            id="recovery_code"
                            name="recovery_code"
                            type="text"
                            inputMode="text"
                            autoComplete="one-time-code"
                            className="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter one of your recovery codes"
                            value={data.recovery_code}
                            onChange={(e) => setData('recovery_code', e.target.value)}
                        />
                        <InputError message={errors.recovery_code} />
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline self-start"
                            onClick={() => setUseRecovery(false)}
                        >
                            Use an authentication code instead
                        </button>
                    </Box>
                )}

                <Box className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <Label htmlFor="remember">Remember this device</Label>
                </Box>

                <Button type="submit" className="w-full" disabled={processing}>
                    Submit
                </Button>
            </form>
        </AuthLayout>
    );
}
