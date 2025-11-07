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

    // Build a self-contained print document sized 80mm x auto, ticket at top-left
    function buildTicketHtml(type: string, number: string, datetime: string): string {
        // Assuming this path is correct for your DSWD logo
        const logoDSWD = '/img/dswd-ticket-logo.png'; 
        return `<!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Queue Ticket</title>
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

                        .header-text { 
                            font-weight: 700; 
                            font-size: 5mm; 
                            line-height: 1.1; 
                            margin: 0 0 2mm 0; 
                        }
                        .type { font-weight: 700; font-size: 6mm; line-height: 1.1; margin: 0; }
                        .number { font-weight: 800; font-size: 16mm; line-height: 1; margin: 0; }
                        .datetime { font-size: 5mm; color: #333; line-height: 1.1; margin: 0; }
                        
                        /* Added DSWD specific colors and message for ticket */
                        .dswd-brand { 
                            color: #004c97; /* DSWD Primary Blue */
                            font-weight: bold;
                        }
                        /* ❌ REMOVED: Since the modal is the thank you message */
                        /* .thank-you-message {
                            font-size: 5.5mm;
                            font-weight: 700;
                            color: #c99a00;
                            margin: 3mm 0 1mm 0;
                        } */
                        .instruction {
                            font-size: 4mm;
                            color: #555;
                            margin-top: 1mm;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="ticket">
                            <img src="${logoDSWD}" alt="DSWD Logo" class="logo" />
                            <div class="type">${type}</div>
                            <div class="number">${number}</div>
                            <div class="instruction">Please take your ticket and wait for your number to be called.</div>
                            <div class="datetime">${datetime}</div>
                        </div>
                    </body>
                </html>`;
    }


    // Print via hidden iframe (No change needed here, the kiosk flag handles the silent print)
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
            // Fallback if iframe fails - window.print() will show the dialog
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
                // 💡 This is the line that will print silently IF the browser is in Kiosk-Print mode
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
            const prefix = value === 1 ? 'P' : 'R';
            const printedNumber = prefix + num; 
            
            setGeneratedNumber(printedNumber);
            setPriority(typeLabel);

            // 1. Show the Modal/Pop-up first
            setDialogOpen(true);

            // 2. Prepare for printing
            const nowDate = new Date();
            const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
            const formattedDate = `${monthNames[nowDate.getMonth()]} ${nowDate.getDate()}, ${nowDate.getFullYear()}`;
            const formattedTime = nowDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const datetime = `${formattedDate} ${formattedTime}`;
            
            // 3. Trigger Print (The browser's kiosk flag will handle silent printing)
            const html = buildTicketHtml(typeLabel, printedNumber, datetime);
            printViaIframe(html);
            
            // 4. Close the modal after 3 seconds (to allow user to see the number while it prints)
            setTimeout(() => {
                setDialogOpen(false);
            }, 3000);


        } catch (error) {
            console.error(error);
            setDialogOpen(false); 
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
            
            {/* DSWD-inspired Interface */}
            <Box className="flex min-h-screen items-center justify-center bg-blue-900 text-slate-100">
                <Card className="w-full max-w-md p-6 rounded-3xl bg-white text-center shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-blue-800">
                            Choose Client Type
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            *Please select your type to get a queue number.
                        </p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {/* Regular Button */}
                        <Button
                            type="button"
                            size="lg"
                            disabled={cooldown || processing}
                            className="h-24 rounded-2xl text-2xl font-extrabold 
                                       bg-blue-600 hover:bg-blue-700 text-white 
                                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            onClick={() => handleGenerate(0)}
                        >
                            Regular Client
                        </Button>
                        {/* Priority Button */}
                        <Button
                            type="button"
                            size="lg"
                            disabled={cooldown || processing}
                            className="h-auto min-h-[7rem] w-full rounded-2xl text-2xl font-extrabold 
                                       bg-yellow-500 text-blue-900 hover:bg-yellow-600 
                                       disabled:opacity-50 disabled:cursor-not-allowed 
                                       flex flex-col justify-center items-center px-3 py-3 
                                       text-center whitespace-normal break-words shadow-lg"
                            onClick={() => handleGenerate(1)}
                        >
                            <span>Priority Lane</span>
                            <span className="text-sm text-blue-900 italic font-normal mt-2 leading-tight text-center">
                                For Senior Citizens, Pregnant Women, and Persons with Disabilities (PWD)
                            </span>
                        </Button>
                    </CardContent>
                    <p className="text-sm text-gray-500 mt-4">
                        Current Time: {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </Card>

                {/* The DSWD Thank You Pop-up / Modal */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white p-6 shadow-2xl">
                        <DialogHeader className="text-center">
                            <DialogTitle className="text-4xl font-extrabold text-blue-700 mt-4">
                                THANK YOU!
                            </DialogTitle>
                            <div className="text-xl text-gray-600 mt-2">
                                Your {priority} Queue Number is:
                            </div>
                        </DialogHeader>
                        <div className="text-center my-6">
                            <p className="text-8xl font-black text-yellow-500 leading-none">
                                {generatedNumber}
                            </p>
                        </div>
                        <div className="text-center text-lg text-blue-800 font-semibold mb-4">
                            Please take your ticket now.
                        </div>
                    </DialogContent>
                </Dialog>
            </Box>
        </>
    );
}