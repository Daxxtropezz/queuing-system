// components/user-role-modal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserRoleModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (userId: number, role: string) => void;
    userId: number | null;
    currentRole: string;
    roles: string[];
}

export default function UserRoleModal({
    open,
    onClose,
    onSubmit,
    userId,
    currentRole,
    roles
}: UserRoleModalProps) {
    const [selectedRole, setSelectedRole] = React.useState(currentRole);

    React.useEffect(() => {
        setSelectedRole(currentRole);
    }, [currentRole]);

    const handleSave = () => {
        if (userId !== null) {
            onSubmit(userId, selectedRole);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Role</DialogTitle>
                </DialogHeader>
                <div className="my-4">
                    <select
                        className="w-full border rounded p-2 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>

                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
