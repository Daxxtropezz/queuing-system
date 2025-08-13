// import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import AuthLayoutTemplate from '@/layouts/auth/auth-split-dswd-layout';

export default function AuthLayout({
    children,
    title = 'Welcome back',
    description = 'Sign in to your account',
    ...props
}: {
    children: React.ReactNode;
    title?: string;
    description?: string;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
