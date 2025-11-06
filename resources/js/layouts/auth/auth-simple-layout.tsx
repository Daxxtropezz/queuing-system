import AppLogoIcon from '@/components/app-logo-icon';
import Box from '@/components/ui/box';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <Box className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <Box className="w-full max-w-sm">
                <Box className="flex flex-col gap-8">
                    <Box className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <Box className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                            </Box>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <Box className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-muted-foreground text-center text-sm">{description}</p>
                        </Box>
                    </Box>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
