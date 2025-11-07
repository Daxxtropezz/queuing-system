import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// In GuardPage.tsx
export default function GuardPage() {
    const { processing } = useForm({
        ispriority: null,
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [generatedNumber, setGeneratedNumber] = useState('');
    const [priority, setPriority] = useState('');
    const [now, setNow] = useState<Date>(new Date());
    const [cooldown, setCooldown] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Build a self-contained print document sized 80mm x 210mm, ticket at top-left
    function buildTicketHtml(type: string, number: string, datetime: string): string {
        const logoDSWD = '/img/dswd-ticket-logo.png';
        return `<!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Ticket</title>
                        <style>
                        /* ✅ Let height auto-adjust to content */
                        @page {
                        size: 80mm auto portrait;
                        margin: 0;
                        }
                        html, body {
                        width: 80mm;
                        margin: 0;
                        padding: 0;
                        }


                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            position: relative;
                        }

                        .ticket {
                            margin: 0;
                            padding: 2mm;
                            width: 80mm;
                            box-sizing: border-box;
                            background: #fff;
                            text-align: center;
                            font-family: Arial, sans-serif;
                            color: #000;
                        }

                        .logo {
                            width: 60mm;
                            height: auto;
                            margin: 0 auto 2mm auto;
                            display: block;
                        }

                        .type { font-weight: 700; font-size: 6mm; line-height: 1.1; margin: 0; }
                        .number { font-weight: 800; font-size: 16mm; line-height: 1; margin: 0; }
                        .datetime { font-size: 5mm; color: #333; line-height: 1.1; margin: 0; }
                        </style>
                    </head>
                    <body>
                        <div class="ticket">
                            <img src="${logoDSWD}" alt="DSWD Logo" class="logo" />
                            <div class="type">${type}</div>
                            <div class="number">${number}</div>
                            <div class="datetime">${datetime}</div>
                        </div>
                    </body>
                </html>`;
    }



    // Print via hidden iframe to avoid page CSS conflicting with print layout
    function printViaIframe(html: string): void {
        const frame = document.createElement('iframe');
        frame.style.position = 'fixed';
        frame.style.right = '0';
        frame.style.bottom = '0';
        frame.style.width = '0';
        frame.style.height = '0';
        frame.style.border = '0';
        document.body.appendChild(frame);

        const doc = frame.contentDocument || frame.contentWindow?.document;
        if (!doc) {
            window.print();
            return;
        }
        doc.open();
        doc.write(html);
        doc.close();

        // Wait for the logo image to load before printing
        const tryPrint = () => {
            const img = doc.querySelector('.logo') as HTMLImageElement | null;
            if (img && img.complete) {
                frame.contentWindow?.focus();
                frame.contentWindow?.print();
                setTimeout(() => {
                    frame.parentNode && frame.parentNode.removeChild(frame);
                }, 1000);
            } else if (img) {
                img.onload = () => {
                    frame.contentWindow?.focus();
                    frame.contentWindow?.print();
                    setTimeout(() => {
                        frame.parentNode && frame.parentNode.removeChild(frame);
                    }, 1000);
                };
            } else {
                // fallback: print after 500ms if image not found
                setTimeout(() => {
                    frame.contentWindow?.focus();
                    frame.contentWindow?.print();
                    setTimeout(() => {
                        frame.parentNode && frame.parentNode.removeChild(frame);
                    }, 1000);
                }, 500);
            }
        };
        setTimeout(tryPrint, 300);
    }

    async function handleGenerate(value: number) {
        if (processing || cooldown) {
            Swal.fire({
                icon: 'warning',
                title: 'Please wait!',
                text: 'You can only generate a new number every 5 seconds.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        setCooldown(true);

        try {
            const { data: response } = await axios.post(route('queue.guard.generate'), {
                ispriority: value,
            });

            let num = response.generatedNumber.toString().replace(/[^0-9]/g, '');
            num = num.padStart(4, '0');
            const typeLabel = value === 1 ? 'Priority' : 'Regular';

            setGeneratedNumber(num);
            setPriority(typeLabel);

            // ✅ Print automatically right after generation
            const nowDate = new Date();
            const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
            const formattedDate = `${monthNames[nowDate.getMonth()]} ${nowDate.getDate()}, ${nowDate.getFullYear()}`;
            const formattedTime = nowDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const datetime = `${formattedDate} ${formattedTime}`;
            const html = buildTicketHtml(typeLabel, num, datetime);
            printViaIframe(html);

            // ✅ Show success toast
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Number Generated!',
                text: `Your ${typeLabel} number is ${num}`,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong while generating your number.',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        } finally {
            setTimeout(() => setCooldown(false), 5000);
        }
    }


    return (
        <>
            <Head title="Generate Number" />
            <Box className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
                <Card className="w-full max-w-md p-6 rounded-3xl bg-slate-800/70 text-center shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-amber-400">
                            Choose Client Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <Button
                            type="button"
                            size="lg"
                            disabled={cooldown}
                            className="h-20 rounded-2xl text-xl font-bold bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleGenerate(0)}
                        >
                            Regular
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            disabled={cooldown}
                            className="h-auto min-h-[6rem] w-full rounded-2xl text-xl font-bold bg-amber-400 text-black hover:bg-amber-300 
               disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-center items-center 
               px-3 py-3 text-center whitespace-normal break-words"
                            onClick={() => handleGenerate(1)}
                        >
                            <span>Priority</span>
                            <span className="text-xs text-slate-900 italic font-normal mt-1 leading-tight text-center">
                                For Senior Citizens, Pregnant Women, and Persons with Disabilities (PWD)
                            </span>
                        </Button>



                    </CardContent>
                </Card>

                {/* Ticket modal + print layout */}
                <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>

                    {/* Print-only ticket (kept for on-screen preview if needed) */}
                    <Box className="print-ticket hidden text-center print:block">
                        <Box className="type font-bold">{priority}</Box>
                        <Box className="number font-bold">{generatedNumber}</Box>
                        <Box className="datetime">
                            {now.toLocaleDateString()} {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </>
    );
}
