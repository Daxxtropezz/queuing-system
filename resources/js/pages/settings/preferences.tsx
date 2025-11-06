import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import axios from 'axios';
import Box from '@/components/ui/box';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication Settings',
        href: '/settings/preferences',
    },
];

export default function Password({ two_factor_enabled }: { two_factor_enabled: boolean }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <Box className="space-y-6">
                    <HeadingSmall title="Theme" description="Update your account's interface settings" />
                    <AppearanceTabs />
                </Box>

                <Separator className="my-6" />

                <TwoFactorSection initialEnabled={two_factor_enabled} />
            </SettingsLayout>
        </AppLayout>
    );
}

function TwoFactorSection({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [qrCode, setQrCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const confirmPassword = async () => {
        // If no input provided, show required message and skip request
        if (!password.trim()) {
            setError('This field is required.');
            return false;
        }

        try {
            await axios.post('/user/confirm-password', { password });
            setPassword('');
            return true;
        } catch {
            setError('Password is incorrect.');
            return false;
        }
    };

    const enable2FA = async () => {
        setError('');
        const confirmed = await confirmPassword();
        if (!confirmed) return;

        setLoading(true);
        try {
            await axios.post('/user/two-factor-authentication');
            const qrRes = await axios.get('/user/two-factor-qr-code');
            const codesRes = await axios.get('/user/two-factor-recovery-codes');
            setQrCode(qrRes.data.svg);
            setRecoveryCodes(codesRes.data);
            setEnabled(true);
        } catch {
            setError('Failed to enable 2FA.');
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        setError('');
        const confirmed = await confirmPassword();
        if (!confirmed) return;

        setLoading(true);
        try {
            await axios.delete('/user/two-factor-authentication');
            setEnabled(false);
            setQrCode('');
            setRecoveryCodes([]);
        } catch {
            setError('Failed to disable 2FA.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="mt-10 space-y-6">
            <HeadingSmall title="Two-Factor Authentication" description="Protect your account with 2FA" />

            <Box className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm your password</Label>
                <Input
                    id="confirm_password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter current password"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
            </Box>
            {enabled ? (
                <>
                    <Box>
                        <p className="font-medium text-green-600">Two-factor authentication is enabled.</p>
                        {qrCode && <Box className="mt-4 flex justify-center rounded-lg bg-white p-3" dangerouslySetInnerHTML={{ __html: qrCode }} />}
                        {recoveryCodes.length > 0 && (
                            <Box className="mt-4">
                                <p className="text-sm text-gray-600 dark:text-white">Recovery Codes:</p>
                                <ul className="mt-1 rounded bg-neutral-100 p-2 text-center font-mono text-sm dark:bg-neutral-800">
                                    {recoveryCodes.map((code) => (
                                        <li key={code}>{code}</li>
                                    ))}
                                </ul>
                            </Box>
                        )}
                    </Box>
                    <Button className="cursor-pointer" variant="destructive" onClick={disable2FA} disabled={loading}>
                        Disable 2FA
                    </Button>
                </>
            ) : (
                <>
                    <p className="text-sm text-gray-600">It is required to enable your two-factor authentication for the security of your account.</p>
                    <Button className="cursor-pointer" onClick={enable2FA} disabled={loading}>
                        Enable 2FA
                    </Button>
                </>
            )}
        </Box>
    );
}
