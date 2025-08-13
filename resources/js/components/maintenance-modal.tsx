// src/Components/MaintenanceModal.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";

// Shadcn UI Components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Shadcn Label for form fields
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Define the shape of a MaintenanceItem (should match your backend/data structure)
interface MaintenanceItem {
    maintenance_id?: number; // Optional for creation
    category_name: string;
    category_value: string;
    category_des: string;
    category_module: string;
    // Add other fields if necessary
}

// Define props for the MaintenanceModal component
interface MaintenanceModalProps {
    isModalVisible: boolean;
    maintenance?: MaintenanceItem | null; // `maintenance` is optional, used for editing
    onClose: () => void; // Callback to close the modal
}

export default function MaintenanceModal({
    isModalVisible,
    maintenance,
    onClose,
}: MaintenanceModalProps) {
    // Determine if it's a create or edit operation
    const isCreate = !maintenance;

    // Initialize Inertia form hook
    // The useForm hook provides properties like data, setData, post, put, errors, processing
    const form = useForm<MaintenanceItem>({
        category_name: maintenance?.category_name || "",
        category_value: maintenance?.category_value || "",
        category_des: maintenance?.category_des || "",
        category_module: maintenance?.category_module || "",
    });

    // Update form data when `maintenance` prop changes (e.g., when opening for edit)
    // This ensures the form is pre-filled correctly
    useEffect(() => {
        if (maintenance) {
            form.setData({
                category_name: maintenance.category_name,
                category_value: maintenance.category_value,
                category_des: maintenance.category_des,
                category_module: maintenance.category_module,
            });
        } else {
            // Reset form for create mode if modal is opened without maintenance prop
            form.reset();
        }
    }, [maintenance, isModalVisible]); // Re-run effect if maintenance object changes or modal visibility changes

    // Handle form submission
    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault(); // Prevent default browser form submission

            if (isCreate) {
                // Submit form for creation
                form.post("/maintenance", {
                    onSuccess: () => {
                        Swal.fire(
                            "Success!",
                            "Maintenance has been created.",
                            "success"
                        );
                        onClose(); // Close modal on success
                    },
                    onError: (errors) => {
                        console.error("Creation errors:", errors);
                        Swal.fire(
                            "Error!",
                            "There was a problem creating the maintenance.",
                            "error"
                        );
                    },
                    onFinish: () => {
                        // Any final logic after request finishes (success or error)
                    },
                });
            } else if (maintenance?.maintenance_id) {
                // Submit form for update
                form.put(`/maintenance/${maintenance.maintenance_id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            "Success!",
                            "Maintenance has been updated.",
                            "success"
                        );
                        onClose(); // Close modal on success
                    },
                    onError: (errors) => {
                        console.error("Update errors:", errors);
                        Swal.fire(
                            "Error!",
                            "There was a problem updating the maintenance.",
                            "error"
                        );
                    },
                    onFinish: () => {
                        // Any final logic after request finishes (success or error)
                    },
                });
            }
        },
        [isCreate, maintenance, form, onClose] // Dependencies for useCallback
    );

    return (
        // Dialog component from Shadcn UI, controls visibility with `open` prop
        <Dialog open={isModalVisible} onOpenChange={onClose}>
           <DialogContent className="max-w-lg sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isCreate ? "Create Category Maintenance" : "Edit Category Maintenance"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreate
                            ? "Fill in the details to create a new maintenance category."
                            : "Edit the details of the selected maintenance category."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Category Name Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category_name" className="text-left">
                                Name
                            </Label>
                            <Input
                                id="category_name"
                                value={form.data.category_name}
                                onChange={(e) =>
                                    form.setData("category_name", e.target.value)
                                }
                                className="col-span-3"
                            />
                            {/* Display validation error */}
                            {form.errors.category_name && (
                                <p className="col-start-2 col-span-3 text-red-500 text-sm mt-1">
                                    {form.errors.category_name}
                                </p>
                            )}
                        </div>

                        {/* Category Value Textarea */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="category_value" className="text-left pt-2">
                                Value
                            </Label>
                            <Textarea
                                id="category_value"
                                value={form.data.category_value}
                                onChange={(e) =>
                                    form.setData("category_value", e.target.value)
                                }
                                className="col-span-3 resize-none" // Disable manual resize
                                maxLength={200}
                                rows={3}
                            />
                            <p className="col-start-2 col-span-3 text-xs text-green-500 mt-1">
                                <i>
                                    {200 - (form.data.category_value?.length || 0)}{" "}
                                    characters remaining
                                </i>
                            </p>
                            {/* Display validation error */}
                            {form.errors.category_value && (
                                <p className="col-start-2 col-span-3 text-red-500 text-sm mt-1">
                                    {form.errors.category_value}
                                </p>
                            )}
                        </div>

                        {/* Category Description Textarea */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="category_des" className="text-left pt-2">
                                Description
                            </Label>
                            <Textarea
                                id="category_des"
                                value={form.data.category_des}
                                onChange={(e) =>
                                    form.setData("category_des", e.target.value)
                                }
                                className="col-span-3 resize-none" // Disable manual resize
                                maxLength={255}
                                rows={3}
                            />
                            <p className="col-start-2 col-span-3 text-xs text-green-500 mt-1">
                                <i>
                                    {255 - (form.data.category_des?.length || 0)}{" "}
                                    characters remaining
                                </i>
                            </p>
                            {/* Display validation error */}
                            {form.errors.category_des && (
                                <p className="col-start-2 col-span-3 text-red-500 text-sm mt-1">
                                    {form.errors.category_des}
                                </p>
                            )}
                        </div>

                        {/* Category Module Textarea */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="category_module" className="text-left pt-2">
                                Module
                            </Label>
                            <Textarea
                                id="category_module"
                                value={form.data.category_module}
                                onChange={(e) =>
                                    form.setData("category_module", e.target.value)
                                }
                                className="col-span-3 resize-none" // Disable manual resize
                                maxLength={100}
                                rows={3}
                            />
                            <p className="col-start-2 col-span-3 text-xs text-green-500 mt-1">
                                <i>
                                    {100 - (form.data.category_module?.length || 0)}{" "}
                                    characters remaining
                                </i>
                            </p>
                            {/* Display validation error */}
                            {form.errors.category_module && (
                                <p className="col-start-2 col-span-3 text-red-500 text-sm mt-1">
                                    {form.errors.category_module}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons in DialogFooter */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary" // Shadcn secondary button style
                            onClick={onClose}
                            disabled={form.processing} // Disable while processing
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !form.data.category_name ||
                                !form.data.category_value ||
                                form.processing
                            }
                        >
                            {form.processing ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                <span>Save</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
