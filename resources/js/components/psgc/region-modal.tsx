import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react'; // For handling form data with Inertia
import Swal from 'sweetalert2'; // For showing alerts

// Shadcn UI Components for the Modal
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Shadcn UI Form Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegionModal({ isModalVisible, onClose, region }) {
    // Determine if the modal is for creating or editing based on the 'region' prop
    const isEditMode = !!region;

    // Initialize Inertia's useForm hook
    const { data, setData, post, put, processing, errors, reset } = useForm({
        psgc_reg: region?.psgc_reg || '',
        reg_name: region?.reg_name || '',
        region: region?.region || '',
    });

    // Effect to reset form data when the modal becomes visible or the 'region' prop changes
    // This ensures the form is correctly populated for editing or cleared for creating.
    useEffect(() => {
        if (isEditMode) {
            setData({
                psgc_reg: region.psgc_reg,
                reg_name: region.reg_name,
                region: region.region,
            });
        } else {
            reset(); // Clear the form fields for a new creation
        }
    }, [isModalVisible, region, isEditMode, setData, reset]); // Add setData and reset to dependencies

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default browser form submission

        if (isEditMode) {
            // For editing, send a PUT request to the update route
            put(route('region.update', region.psgc_reg), {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'The region has been updated.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    onClose();
                },
                onError: (validationErrors) => {
                    // Inertia's onError provides validationErrors directly
                    console.error("Update Errors:", validationErrors);
                    Swal.fire({
                        title: 'Error!',
                        text: 'There was a problem updating the region.',
                        icon: 'error',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });

                },
            });
        } else {
            // For creating, send a POST request to the store route
            post(route('region.store'), {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'The region has been created.',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    onClose();
                },
                onError: (validationErrors) => {
                    console.error("Create Errors:", validationErrors);
                    Swal.fire({
                        title: 'Error!',
                        text: 'There was a problem creating the region',
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

    // Limit psgc_reg input to 10 characters (since type is "number", this converts it to string for length check)
    const limitPsgcReg = (e) => {
        let value = e.target.value.toString(); // Convert to string to check length
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        setData('psgc_reg', value); // Update the form data
    };

    return (
        <Dialog open={isModalVisible} onOpenChange={onClose}>
          <DialogContent className="max-w-lg sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Region' : 'Create Region'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Make changes to the region here.'
                            : 'Add a new region here.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="psgc_reg" className="text-left">
                                Region PSGC Code
                            </Label>
                            <Input
                                id="psgc_reg"
                                type="number"
                                value={data.psgc_reg}
                                onChange={limitPsgcReg} // Use the custom limit function
                                className="col-span-3"
                                readOnly={isEditMode} // Disable editing the code if in edit mode
                            />
                            {errors.psgc_reg && (
                                <p className="col-span-4 text-red-500 text-sm">
                                    {errors.psgc_reg}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reg_name" className="text-left">
                                Region Name
                            </Label>
                            <Input
                                id="reg_name"
                                type="text"
                                value={data.reg_name}
                                onChange={(e) => setData('reg_name', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.reg_name && (
                                <p className="col-span-4 text-red-500 text-sm">
                                    {errors.reg_name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="region" className="text-left">
                                Region Classification
                            </Label>
                            <Input
                                id="region"
                                type="text"
                                value={data.region}
                                onChange={(e) => setData('region', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.region && (
                                <p className="col-span-4 text-red-500 text-sm">
                                    {errors.region}
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing || // Disable while form is submitting
                                !data.psgc_reg || !data.region || !data.reg_name // Disable if fields are empty
                            }
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}