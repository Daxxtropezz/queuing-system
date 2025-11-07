import { useState } from 'react';
import { deleteDisable2FA, fetchQrCode, fetchRecoveryCodes, postConfirmPassword, postEnable2FA } from '../utils/api';
import type { UseTwoFactorAuthReturn } from '../types';

export default function useTwoFactorAuth(initialEnabled: boolean): UseTwoFactorAuthReturn {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [qrCode, setQrCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const confirmPassword = async () => {
        if (!password.trim()) {
            setError('This field is required.');
            return false;
        }
        try {
            await postConfirmPassword(password);
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
            await postEnable2FA();
            const [qr, codes] = await Promise.all([fetchQrCode(), fetchRecoveryCodes()]);
            setQrCode(qr);
            setRecoveryCodes(codes);
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
            await deleteDisable2FA();
            setEnabled(false);
            setQrCode('');
            setRecoveryCodes([]);
        } catch {
            setError('Failed to disable 2FA.');
        } finally {
            setLoading(false);
        }
    };

    return { enabled, loading, error, password, qrCode, recoveryCodes, setPassword, enable2FA, disable2FA };
}
