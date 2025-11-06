import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { Separator } from '@/components/ui/separator';
import Box from '@/components/ui/box';

import TwoFactorSection from './components/TwoFactorSection';

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
