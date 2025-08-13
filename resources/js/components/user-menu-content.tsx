import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import Swal from 'sweetalert2';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = async () => {
        const isDarkMode = document.documentElement.classList.contains('dark');

        const ConfirmSubmitToast = Swal.mixin({
            toast: true,
            position: 'bottom-start',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonColor: '#014A70',
            cancelButtonColor: '#FF6700',
            timer: undefined,
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#1f2937',
        });

        const result = await ConfirmSubmitToast.fire({
            title: 'Are you sure you want to log out?',
            text: 'Please confirm to proceed.',
            icon: 'warning',
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            cleanup();
            router.post(route('logout'));
        }
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full cursor-pointer" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button className="block w-full cursor-pointer text-left" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Log out
                </button>
            </DropdownMenuItem>
        </>
    );
}
