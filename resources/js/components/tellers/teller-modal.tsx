import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

type Teller = { id: number; name: string; description?: string | null };
type ModalProps = {
    isModalVisible: boolean;
    onClose: (open: boolean) => void;
    teller?: Teller | null;
};

export default function TellerModal({ isModalVisible, onClose, teller }: ModalProps) {
    const isEditMode = !!teller;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: teller?.name || '',
        description: teller?.description || '',
    });

    useEffect(() => {
        if (isEditMode) {
            setData({
                name: teller!.name,
                description: teller!.description || '',
            });
        } else {
            reset();
        }
    }, [isModalVisible, teller]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('tellers.update', teller!.id), {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Updated!',
                        text: 'Teller updated successfully.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        timer: 3000,
                        showConfirmButton: false,
                    });
                    onClose(false);
                },
                onError: (errors) => {
                    // Add an error handler to see what's going wrong
                    Swal.fire({
                        title: 'Error!',
                        text: 'An error occurred while updating the teller.',
                        icon: 'error',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    console.error(errors);
                },
            });
        } else {
            post(route('tellers.store'), {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Created!',
                        text: 'Teller created successfully.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        timer: 3000,
                        showConfirmButton: false,
                    });
                    onClose(false);
                },
            });
        }
    };

    return (
        <Dialog open={isModalVisible} onOpenChange={onClose}>
            <DialogContent className="max-w-lg border border-slate-200 bg-white/90 ring-1 ring-slate-200/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/80 dark:ring-slate-800/50">
                <DialogHeader>
                    <DialogTitle className="text-slate-800 dark:text-slate-100">{isEditMode ? 'Edit Teller' : 'Create Teller'}</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        {isEditMode ? 'Update the details of the teller.' : 'Fill in the details to create a new teller.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                                Name
                            </Label>
                            <Input
                                id="name"
                                className="col-span-3 rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-0 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-600 dark:focus-visible:ring-blue-400/30"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="col-span-4 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                                Description
                            </Label>
                            <Input
                                id="description"
                                className="col-span-3 rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-0 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-600 dark:focus-visible:ring-blue-400/30"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="col-span-4 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter className="border-t border-slate-200 pt-4 dark:border-slate-800">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:outline-none"
                        >
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onClose(false)}
                            className="focus-visible:ring-2 focus-visible:ring-slate-500/30 focus-visible:outline-none"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
