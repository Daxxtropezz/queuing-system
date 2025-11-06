import axios from 'axios';

export const postConfirmPassword = (password: string) => axios.post('/user/confirm-password', { password });
export const postEnable2FA = () => axios.post('/user/two-factor-authentication');
export const deleteDisable2FA = () => axios.delete('/user/two-factor-authentication');

export const fetchQrCode = async (): Promise<string> => {
    const res = await axios.get('/user/two-factor-qr-code');
    return res.data?.svg ?? res.data;
};

export const fetchRecoveryCodes = async (): Promise<string[]> => {
    const res = await axios.get('/user/two-factor-recovery-codes');
    return res.data as string[];
};
