// resources/js/Components/ProvinceModal.tsx
import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

// Shadcn UI Components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'; // Adjust path based on your shadcn setup
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Define interfaces for props and form data for better type safety
interface Region {
    psgc_reg: string;
    reg_name: string;
}

interface Province {
    psgc_reg: string;
    psgc_prov: string;
    prov_name: string;
}

interface ProvinceModalProps {
    province?: Province | null;
    regions?: Region[];
    isModalVisible: boolean; // Changed from isModalOpen to isModalVisible
    onClose: () => void;
}

const ProvinceModal: React.FC<ProvinceModalProps> = ({ province, regions, isModalVisible, onClose }) => {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        psgc_reg: '',
        psgc_prov: '',
        prov_name: '',
    });

    useEffect(() => {
        if (province) {
            setData({
                psgc_reg: province.psgc_reg,
                psgc_prov: province.psgc_prov,
                prov_name: province.prov_name,
            });
        } else {
            reset();
        }
        clearErrors();
    }, [province, isModalVisible]);

    useEffect(() => {
        if (!regions || !Array.isArray(regions)) {
            console.warn("ProvinceModal: 'regions' prop is missing or not an array.");
        }
        // This useEffect is good for warnings, but doesn't directly impact the select display
    }, [regions]);

    const isCreate = !province;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isCreate) {
            post('/province', {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Province has been created',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    onClose();
                },
                onError: (backendErrors) => {
                    console.error('Create Errors:', backendErrors);
                    Swal.fire({
                        title: 'Error!',
                        text: 'There was a problem creating the province.',
                        icon: 'error',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                },
            });
        } else {
            if (!province?.psgc_prov) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Cannot update: Province ID is missing',
                    icon: 'error',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
                return;
            }
            put(`/province/${province.psgc_prov}`, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Province has been updated.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    onClose();
                },
                onError: (backendErrors) => {
                    console.error('Update Errors:', backendErrors);
                    Swal.fire({
                        title: 'Error!',
                        text: 'There was a problem updating the province.',
                        icon: 'error',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                },
            });
        }
    };

     const handleClose = () => {
        onClose();
    }

    const limitPsgcReg = (e) => {
        let value = e.target.value.toString(); // Convert to string to check length
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        setData('psgc_prov', value); // Update the form data
    };

     return (
        <Dialog open={isModalVisible} onOpenChange={handleClose}>
           <DialogContent className="max-w-lg sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isCreate ? 'Create New Province' : 'Edit Province'}</DialogTitle>
                    <DialogDescription>
                        {isCreate ? 'Fill in the details to create a new province.' : 'Edit the province details below.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="psgc_reg" className="text-left">
                            Region
                        </Label>
                       <Select
    onValueChange={(value) => {
        setData('psgc_reg', value);
    }}
    value={data.psgc_reg?.toString() ?? ''}
    disabled={processing}
>
    <SelectTrigger className="col-span-3">
        <SelectValue placeholder="Select a region" />
    </SelectTrigger>
    <SelectContent>
        {regions && regions.length > 0 ? (
            regions.map((region) => (
                <SelectItem key={region.psgc_reg} value={region.psgc_reg.toString()}>
                    {region.reg_name}
                </SelectItem>
            ))
        ) : (
            <SelectItem value="" disabled>No regions available</SelectItem>
        )}
    </SelectContent>
</Select>
                        {errors.psgc_reg && <p className="col-span-4 text-left text-sm text-red-500">{errors.psgc_reg}</p>}
                    </div>
                    

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="psgc_prov" className="text-left">
                            Region PSGC Code
                        </Label>
                        <Input
                            id="psgc_prov"
                            type="number"
                            value={data.psgc_prov}
                            onChange={limitPsgcReg}
                            className="col-span-3"
                            disabled={processing || !isCreate}
                        />
                        {errors.psgc_prov && <p className="col-span-4 text-left text-sm text-red-500">{errors.psgc_prov}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="prov_name" className="text-left">
                            Province Name
                        </Label>
                        <Input
                            id="prov_name"
                            value={data.prov_name}
                            onChange={(e) => setData('prov_name', e.target.value)}
                            className="col-span-3"
                            maxLength={100}
                            disabled={processing}
                        />
                        {errors.prov_name && <p className="col-span-4 text-left text-sm text-red-500">{errors.prov_name}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : (isCreate ? 'Create' : 'Save Changes')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProvinceModal;