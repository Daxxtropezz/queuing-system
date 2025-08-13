import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/two-factor-challenge');
    };

    return (
        <AuthLayout title="Two-Factor Authentication" description="Enter the authentication code from your authenticator app.">
            <Head title="Two-Factor Challenge" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="code">Authentication Code</Label>
                    <div className="flex justify-center">
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
                    </div>
                    <InputError message={errors.code} />
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <Label htmlFor="remember">Remember this device</Label>
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    Submit
                </Button>
            </form>
        </AuthLayout>
    );
}
