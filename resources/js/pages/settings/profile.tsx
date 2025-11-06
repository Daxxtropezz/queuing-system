import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import Box from '@/components/ui/box';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile settings', href: '/settings/profile' },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const { user } = auth;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

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
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <SkeletonAvatar />
                                        <SkeletonSection title="Personal Details" />
                                    </div>
                                    <SkeletonFullWidthSection title="Organization Info" />
                                </>
                            ) : (
                                <>
                                    {/* Top Section: Two Columns */}
                                    <div className="grid gap-8 md:grid-cols-2">
                                        {/* Left Column — Avatar + Badges */}
                                        <Box className="flex flex-col items-center justify-center gap-3">
                                            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/9.x/fun-emoji/svg?backgroundType=gradientLinear,solid&seed=${user.first_name}%20${user.last_name}`}
                                                    alt={`${user.first_name} ${user.last_name}`}
                                                />
                                                <AvatarFallback className="text-2xl font-semibold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>

                                            <Box className="flex flex-wrap justify-center gap-2">
                                                <Badge variant="secondary">{user.position || 'No Position'}</Badge>
                                                <Badge variant="secondary">{user.role || 'User'}</Badge>
                                            </Box>
                                        </Box>

                                        {/* Right Column — Personal Details */}
                                        <InfoSection
                                            title="Personal Details"
                                            details={[
                                                { label: 'Employee ID', value: user.id_number || '—' },
                                                { label: 'Full Name', value: `${user.first_name} ${user.last_name}` },
                                                { label: 'Email Address', value: user.email },
                                            ]}
                                        />
                                    </div>

                                    {/* Full Width Organization Info */}
                                    <Box className="pt-2 md:col-span-2">
                                        <InfoSection
                                            title="Organization Info"
                                            details={[
                                                { label: 'Division', value: user.division || '—' },
                                                { label: 'Section', value: user.section || '—' },
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

/* Info Section Component */
function InfoSection({
    title,
    details,
}: {
    title: string;
    details: { label: string; value: string }[];
}) {
    return (
        <Box className="space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Separator />
            <Box className="space-y-3">
                {details.map((item, index) => (
                    <Box key={index} className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                        <span className="text-base font-semibold">{item.value}</span>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

/* Skeleton Components */
function SkeletonSection({ title }: { title: string }) {
    return (
        <Box className="space-y-4">
            <Box className="h-5 w-40 rounded-md bg-muted" />
            <Separator />
            <Box className="space-y-3">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-5 w-56 rounded-md" />
            </Box>
        </Box>
    );
}

function SkeletonFullWidthSection({ title }: { title: string }) {
    return (
        <Box className="space-y-4">
            <Box className="h-5 w-40 rounded-md bg-muted" />
            <Separator />
            <Box className="space-y-3">
                <Skeleton className="h-5 w-80 rounded-md" />
                <Skeleton className="h-5 w-64 rounded-md" />
            </Box>
        </Box>
    );
}

function SkeletonAvatar() {
    return <Skeleton className="h-28 w-28 rounded-full" />;
}
