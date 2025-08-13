// file-upload-modal.tsx
import React, { useEffect } from "react"; // Removed useState as it's not explicitly used here
import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Upload } from "lucide-react"; // Only need Eye and Upload for this context
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const FileUploadModal = ({ isModalVisible, files, onClose }) => {
    // Determine if it's a create operation. This is stable.
    const isCreate = !files;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        // Initialize with default empty values for create, or existing values for edit.
        // This initial state will be overwritten by useEffect when modal opens/files change.
        name: files?.name || "",
        description: files?.description || "",
        file: null,
    });

    // Consolidated useEffect for handling modal visibility and file data
    useEffect(() => {
        if (isModalVisible) {
            // When modal opens:
            if (files) {
                // If 'files' prop is provided (editing an existing file)
                setData({
                    name: files.name,
                    description: files.description,
                    file: null, // Always null for the file input on load/edit
                });
            } else {
                // If 'files' prop is null (creating a new file)
                setData({
                    name: "",
                    description: "",
                    file: null,
                });
            }
        } else {
            // When modal closes, reset the form data to its initial empty state
            // This prevents old data from lingering if the modal reopens for a new item.
            reset();
        }
    }, [isModalVisible, files, setData, reset]); // Dependencies: When these change, re-run

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        ];

        if (!allowedTypes.includes(file.type)) {
            setData("file", null); // Clear file input
            Swal.fire({
                title: "Invalid file",
                text: "Only PDF, Word, and Excel files are allowed.",
                icon: "error",
                showConfirmButton: false,
                position: 'top-end',
                timer: 3000,
                toast: true,
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            // 10 MB limit
            setData("file", null); // Clear file input
            Swal.fire({
                title: "File too large",
                text: "File size exceeds the 10MB limit.",
                icon: "error",
                showConfirmButton: false,
                position: 'top-end',
                timer: 3000,
                toast: true,
            });
            return;
        }

        setData("file", file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const onSuccess = () => {
            Swal.fire({
                title: "Success!",
                text: `File has been ${isCreate ? "uploaded" : "updated"}.`,
                icon: "success",
                showConfirmButton: false,
                position: 'top-end',
                timer: 3000,
                toast: true,
                showCloseButton: true,
            });
            onClose();
        };

        const onError = () => {
            Swal.fire({
                title: "Error!",
                text: `There was a problem ${isCreate ? "uploading" : "updating"} the file.`,
                icon: "error",
                showConfirmButton: false,
                position: 'top-end',
                timer: 3000,
                toast: true,
            });
        };

        if (isCreate) {
            post(route("files.store"), { onSuccess, onError, forceFormData: true });
        } else {
            put(route("files.update", files.id), data, { onSuccess, onError, forceFormData: true });
        }
    };

    return (
        <Dialog open={isModalVisible} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isCreate ? "Create Form File" : "Edit Form File"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreate
                            ? "Upload a new form file to the system."
                            : "Edit the details of this form file."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="col-span-3"
                        />
                        {errors.name && (
                            <p className="col-span-4 text-destructive text-sm mt-1 text-right">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea // Using Textarea for description
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            className="col-span-3 resize-none"
                        />
                        {errors.description && (
                            <p className="col-span-4 text-destructive text-sm mt-1 text-right">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">
                            File
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                className="col-span-3 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:py-1 file:px-2 file:mr-2 hover:file:bg-primary/90"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Max 10MB. Allowed: PDF, Word (.doc, .docx), Excel (.xls, .xlsx).
                            </p>

                            {/* Show selected file name if uploading new file */}
                            {data.file && (
                                <p className="text-sm text-gray-500 mt-1 inline-flex items-center">
                                    <Upload className="mr-1 h-4 w-4 text-muted-foreground" />
                                    {data.file.name}
                                </p>
                            )}

                            {/* Show current file if editing and no new file selected */}
                            {!data.file && files?.path && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                asChild
                                                variant="link"
                                                className="text-sm mt-1 inline-flex items-center"
                                            >
                                                <a
                                                    href={`/storage/${files.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Eye className="mr-1 h-4 w-4" />
                                                    View current file
                                                </a>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Click to view the currently uploaded file.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        {errors.file && (
                            <p className="col-span-4 text-destructive text-sm mt-1 text-right">
                                {errors.file}
                            </p>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!data.name || (isCreate && !data.file) || processing}
                        >
                            {processing ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FileUploadModal;