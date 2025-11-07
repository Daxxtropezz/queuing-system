export type RecoveryCode = string;

export type UseTwoFactorAuthReturn = {
    enabled: boolean;
    loading: boolean;
    error: string;
    password: string;
    qrCode: string;
    recoveryCodes: RecoveryCode[];
    setPassword: (v: string) => void;
    enable2FA: () => Promise<void>;
    disable2FA: () => Promise<void>;
};
