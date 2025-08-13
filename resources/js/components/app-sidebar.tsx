// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building, ChartArea, Earth, House, Library, Logs, MessageSquareQuote, UserRoundCog, Users, Wrench } from 'lucide-react';
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

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: ChartArea,
        },
        {
            title: 'Parent',
            href: '#',
            icon: Library,
            children: [
                {
                    title: 'Child',
                    href: '/',
                    icon: MessageSquareQuote,
                },
            ],
        },
    ];

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
                    title: 'Activity Logs',
                    href: '/',
                    icon: Logs,
                },
                {
                    title: 'Maintenance',
                    href: '/maintenance',
                    icon: Wrench,
                },
                {
                    title: 'PSGC',
                    href: '#',
                    icon: Earth,
                    children: [
                        { title: 'Region', href: '/region', icon: Earth },
                        { title: 'Province', href: '/province', icon: Earth },
                        { title: 'City/Municipality', href: '/citymun', icon: Building },
                        { title: 'Barangay', href: '/barangay', icon: House },
                    ],
                },
            ],
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
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
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
