import AppLogoIcon from '@/components/app-logo-icon';
import Box from '@/components/ui/box';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthFloatingCardLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <Box className="relative min-h-dvh bg-gray-50">
            {/* Background image with gradient overlay */}
            <Box className="absolute inset-0 bg-[url('/img/payout-login.jpg')] bg-cover bg-center dark:bg-[url('/img/payout-login.jpg')]">
                <Box className="absolute inset-0 bg-gradient-to-br from-blue-900/99 via-black/35 to-red-900/90"></Box>
                <Box className="absolute inset-0 bg-gradient-to-bl from-red-900/90 via-black/35 to-blue-900/99"></Box>
            </Box>

            {/* Left side content (logo + quote) */}
            <Box className="fixed top-0 left-0 hidden h-full w-1/2 flex-col p-10 text-white lg:flex">
                <Link href={route('home')} className="z-20 flex items-center text-xl font-medium">
                    <AppLogoIcon className="mr-2 size-12 fill-current text-white" />
                    {name}
                </Link>

                {quote && (
                    <Box className="z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">" {quote.message} "</p>
                            <footer className="text-sm text-gray-300">{quote.author}</footer>
                        </blockquote>
                    </Box>
                )}
            </Box>

            <Box className="fixed top-0 right-0 flex h-full w-full items-center justify-center p-4 lg:w-1/2">
                <Box className="dark:bg-background/80 w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg transition-colors duration-200 dark:text-white">
                    {/* Mobile logo */}
                    <Link href={route('home')} className="mb-6 flex justify-center lg:hidden">
                        <AppLogoIcon className="size-12 h-10 fill-current text-black dark:text-white" />
                    </Link>

                    {/* Content heading - the "developers" section is now removed */}
                    <Box className="group relative mb-6 text-center">
                        <Box className="relative inline-block">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                {title}
                            </h1>
                            {/* The whole "Hidden Team Boxes" Box is removed */}
                        </Box>
                        {description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>}
                    </Box>

                    {children}
                </Box>
            </Box>
        </Box>
    );
}