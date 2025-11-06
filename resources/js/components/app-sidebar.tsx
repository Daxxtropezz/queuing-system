// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CreditCard, FileChartColumnIncreasing, ListChecks, ScrollText, UserCheck, UserRoundCog, Users, Video } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as unknown as {
        auth: {
            user: {
                roles: string[];
            };
        };
    };

    const isAdmin = auth?.user?.roles?.includes('Administrator');
    const isTellerStep1 = auth?.user?.roles?.includes('Step1-Teller');
    const isTellerStep2 = auth?.user?.roles?.includes('Step2-Teller');

    const mainNavItems: NavItem[] = [];

    if (isAdmin || isTellerStep1) {
        mainNavItems.push({
            title: "Step 1 - Service Counter",
            href: "/queue/teller-step1",
            icon: UserCheck,
        });
    }

    if (isAdmin || isTellerStep2) {
        mainNavItems.push({
            title: "Step 2 - Service Counter",
            href: "/queue/teller-step2",
            icon: UserCheck,
        });
    }

    if (isAdmin) {
        mainNavItems.push({
            title: 'Administrator',
            href: '#',
            icon: UserRoundCog,
            children: [
                {
                    title: 'User Management',
                    href: '/users',
                    icon: Users,
                },
                {
                    title: 'Transaction Types',
                    href: '/transaction-types',
                    icon: ListChecks,
                },
                {
                    title: 'Teller Management',
                    href: '/tellers',
                    icon: CreditCard,
                },

                {
                    title: 'Videos',
                    href: '/videos',
                    icon: Video,
                },
                {
                    title: 'Audit Logs',
                    href: '/audit-logs',
                    icon: ScrollText,
                },
                {
                    title: 'Reports',
                    href: '/reports',
                    icon: FileChartColumnIncreasing,
                },
            ],
        });
    }

    if (isAdmin || isTellerStep1) {
        mainNavItems.push({
            title: "Step 1 - Serving Board",
            href: "/queue/step-1",
            icon: UserCheck,
        });
    }
    if (isAdmin || isTellerStep2) {
        mainNavItems.push({
            title: "Step 2 - Serving Board",
            href: "/queue/step-2",
            icon: UserCheck,
        });
    }

    // const footerNavItems: NavItem[] = [
    //     {
    //         title: 'User Management',
    //         href: '/users',
    //         icon: Users,
    //     },
    // ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="overflow-x-hidden max-w-full">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
