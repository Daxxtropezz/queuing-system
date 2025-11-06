import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import Box from '@/components/ui/box';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors } = useForm<Required<ProfileForm>>({
        name: auth.user.first_name + ' ' + auth.user.last_name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <Box className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <Box className="grid gap-2">
                            <Label htmlFor="name">{"Name"}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full text-center"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                                disabled
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </Box>

                        <Box className="grid gap-2">
                            <Label htmlFor="email">{"Email address"}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full text-center"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                                disabled
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </Box>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <Box>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    {"Your email address is unverified. "}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        {"Click here to resend the verification email."}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <Box className="mt-2 text-sm font-medium text-green-600">
                                        {"A new verification link has been sent to your email address."}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </form>
                </Box>
            </SettingsLayout>
        </AppLayout>
    );
}
