import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import Box from '@/components/ui/box';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import InfoSection from './components/InfoSection';
import SkeletonSection from './components/SkeletonSection';
import SkeletonFullWidthSection from './components/SkeletonFullWidthSection';
import SkeletonAvatar from './components/SkeletonAvatar';
import useDelayedLoading from './hooks/useDelayedLoading';
import { avatarUrl, getInitials } from './utils/profile';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile settings', href: '/settings/profile' },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const { user } = auth;
    const loading = useDelayedLoading(1200);

    const initials = getInitials(user);
    const positionLabel = typeof (user as any).position === 'string' ? (user as any).position : (user as any).position?.name ?? 'No Position';
    const roleLabel = typeof (user as any).role === 'string' ? (user as any).role : (user as any).role?.name ?? 'User';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <Box className="space-y-8">
                    <HeadingSmall
                        title="Profile Overview"
                        description="Your personal information and account details."
                    />

                    <Card className="overflow-hidden shadow-lg transition-all hover:shadow-xl">
                        <CardContent className="p-8 space-y-10">
                            {loading ? (
                                <>
                                    <Box className="grid gap-8 md:grid-cols-2">
                                        <SkeletonAvatar />
                                        <SkeletonSection title="Personal Details" />
                                    </Box>
                                    <SkeletonFullWidthSection title="Organization Info" />
                                </>
                            ) : (
                                <>
                                    {/* Top Section: Two Columns */}
                                    <Box className="grid gap-8 md:grid-cols-2">
                                        {/* Left Column — Avatar + Badges */}
                                        <Box className="flex flex-col items-center justify-center gap-3">
                                            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                                                <AvatarImage
                                                    src={avatarUrl(user)}
                                                    alt={`${user.first_name} ${user.last_name}`}
                                                />
                                                <AvatarFallback className="text-2xl font-semibold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>

                                            <Box className="flex flex-wrap justify-center gap-2">
                                                <Badge variant="secondary">{positionLabel}</Badge>
                                                <Badge variant="secondary">{roleLabel}</Badge>
                                            </Box>
                                        </Box>

                                        {/* Right Column — Personal Details */}
                                        <InfoSection
                                            title="Personal Details"
                                            details={[
                                                { label: 'Employee ID', value: String((user as any).id_number ?? '—') },
                                                { label: 'Full Name', value: `${(user as any).first_name ?? ''} ${(user as any).last_name ?? ''}`.trim() },
                                                { label: 'Email Address', value: String((user as any).email ?? '—') },
                                            ]}
                                        />
                                    </Box>

                                    {/* Full Width Organization Info */}
                                    <Box className="pt-2 md:col-span-2">
                                        <InfoSection
                                            title="Organization Info"
                                            details={[
                                                { label: 'Division', value: String((user as any).division ?? '—') },
                                                { label: 'Section', value: String((user as any).section ?? '—') },
                                            ]}
                                        />
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </SettingsLayout>
        </AppLayout>
    );
}
