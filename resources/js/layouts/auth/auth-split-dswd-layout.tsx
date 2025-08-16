import AppLogoIcon from '@/components/app-logo-icon';
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
        <div className="relative min-h-dvh bg-gray-50">
            {/* Background image with gradient overlay */}
            <div className="absolute inset-0 bg-[url('/img/payout-login.jpg')] bg-cover bg-center dark:bg-[url('/img/payout-login.jpg')]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/99 via-black/35 to-red-900/90"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-red-900/90 via-black/35 to-blue-900/99"></div>
            </div>

            {/* Left side content (logo + quote) */}
            <div className="fixed top-0 left-0 hidden h-full w-1/2 flex-col p-10 text-white lg:flex">
                <Link href={route('home')} className="z-20 flex items-center text-xl font-medium">
                    <AppLogoIcon className="mr-2 size-12 fill-current text-white" />
                    {name}
                </Link>

                {quote && (
                    <div className="z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">" {quote.message} "</p>
                            <footer className="text-sm text-gray-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>

            <div className="fixed top-0 right-0 flex h-full w-full items-center justify-center p-4 lg:w-1/2">
                <div className="dark:bg-background/80 w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg transition-colors duration-200 dark:text-white">
                    {/* Mobile logo */}
                    <Link href={route('home')} className="mb-6 flex justify-center lg:hidden">
                        <AppLogoIcon className="size-12 h-10 fill-current text-black dark:text-white" />
                    </Link>

                    {/* Content heading with hover-replace for developers */}
                    <div className="group relative mb-6 text-center">
                        <div className="relative inline-block">
                            <h1 className="text-2xl font-semibold text-gray-800 transition-opacity duration-500 group-hover:opacity-0 dark:text-gray-100">
                                {title}
                            </h1>
                            {/* Hidden Team Boxes: replaces title on hover */}
                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-700 group-hover:pointer-events-auto group-hover:opacity-100">
                                <div className="flex flex-col items-center">
                                    <span className="mb-2 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-300">
                                        Developers
                                    </span>
                                    <div className="flex flex-row items-end space-x-3">
                                        <div className="flex w-32 flex-col items-center rounded-lg border border-gray-200 bg-white/90 p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900/90">
                                            <img
                                                src="/img/mm.png"
                                                alt="Melbert Monteagudo"
                                                className="mb-1 h-12 w-12 rounded-full bg-gray-200 object-cover"
                                            />
                                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Melbert Monteagudo</span>
                                        </div>
                                        <div className="flex w-32 flex-col items-center rounded-lg border border-gray-200 bg-white/90 p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900/90">
                                            <img
                                                src="/img/jm.png"
                                                alt="John Paul Miraflores"
                                                className="mb-1 h-12 w-12 rounded-full bg-gray-200 object-cover"
                                            />
                                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">John Paul Miraflores</span>
                                        </div>
                                        <div className="flex w-32 flex-col items-center rounded-lg border border-gray-200 bg-white/90 p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900/90">
                                            <img src="/img/md.png" alt="Person 3" className="mb-1 h-12 w-12 rounded-full bg-gray-200 object-cover" />
                                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Mc Joshua de Lima</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
