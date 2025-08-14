import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function TransactionTypeModal({ isModalVisible, onClose, type }) {
    const isEditMode = !!type;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: type?.name || '',
        description: type?.description || '',
    });

    useEffect(() => {
        if (isEditMode) {
            setData({
                name: type.name,
                description: type.description || '',
            });
        } else {
            reset();
        }
    }, [isModalVisible, type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('transaction-types.update', type.id), {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Updated!',
                        text: 'Transaction type updated successfully.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        timer: 3000,
                        showConfirmButton: false,
                    });
                    onClose();
                },
            });
        } else {
            post(route('transaction-types.store'), {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Created!',
                        text: 'Transaction type created successfully.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        timer: 3000,
                        showConfirmButton: false,
                    });
                    onClose();
                },
            });
        }
    };

    return (
        <Dialog open={isModalVisible} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Transaction Type' : 'Create Transaction Type'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update the details of the transaction type.' : 'Fill in the details to create a new transaction type.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" className="col-span-3" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="col-span-4 text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                className="col-span-3"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="col-span-4 text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
