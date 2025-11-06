import Box from '@/components/ui/box';
import HeadingSmall from '@/components/heading-small';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useTwoFactorAuth from '../hooks/useTwoFactorAuth';

export default function TwoFactorSection({ initialEnabled }: { initialEnabled: boolean }) {
    const { enabled, loading, password, error, qrCode, recoveryCodes, setPassword, enable2FA, disable2FA } = useTwoFactorAuth(initialEnabled);

    return (
        <Box className="mt-10 space-y-6">
            <HeadingSmall title="Two-Factor Authentication" description="Protect your account with 2FA" />

            <Box className="grid gap-2">
                <Label htmlFor="confirm_password">{"Confirm your password"}</Label>
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
                        <p className="font-medium text-green-600">{"Two-factor authentication is enabled."}</p>
                        {qrCode && <Box className="mt-4 flex justify-center rounded-lg bg-white p-3" dangerouslySetInnerHTML={{ __html: qrCode }} />}
                        {recoveryCodes.length > 0 && (
                            <Box className="mt-4">
                                <p className="text-sm text-gray-600 dark:text-white">{"Recovery Codes:"}</p>
                                <ul className="mt-1 rounded bg-neutral-100 p-2 text-center font-mono text-sm dark:bg-neutral-800">
                                    {recoveryCodes.map((code) => (
                                        <li key={code}>{code}</li>
                                    ))}
                                </ul>
                            </Box>
                        )}
                    </Box>
                    <Button className="cursor-pointer" variant="destructive" onClick={disable2FA} disabled={loading}>
                        {"Disable 2FA"}
                    </Button>
                </>
            ) : (
                <>
                    <p className="text-sm text-gray-600">{"It is required to enable your two-factor authentication for the security of your account."}</p>
                    <Button className="cursor-pointer" onClick={enable2FA} disabled={loading}>
                        {"Enable 2FA"}
                    </Button>
                </>
            )}
        </Box>
    );
}
