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

        setCooldown(true); // 🚫 immediately lock buttons

        try {
            const { data: response } = await axios.post(route('queue.guard.generate'), {
                ispriority: value,
            });

            let num = response.generatedNumber.toString().replace(/[^0-9]/g, '');
            num = num.padStart(4, '0');
            setGeneratedNumber(num);
            setPriority(value === 1 ? 'Priority' : 'Regular');
            setDialogOpen(true);

            // Print immediately
            setTimeout(() => {
                window.print();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Number Generated!',
                    text: `Your ${value === 1 ? 'Priority' : 'Regular'} number is ${num}`,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });

            }, 300);
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
            // ⏳ Release after 5s
            setTimeout(() => setCooldown(false), 5000);
        }
    }

    return (
        <>
            <Head title="Generate Number" />
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
                <Card className="w-full max-w-md p-6 rounded-3xl bg-slate-800/70 text-center shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-amber-400">
                            Choose Queue Type
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
                            className="h-20 rounded-2xl text-xl font-bold bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleGenerate(1)}
                        >
                            Priority
                        </Button>
                    </CardContent>
                </Card>

                {/* Ticket modal + print layout */}
                <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>

                    {/* Print-only ticket */}
                    <div className="print-ticket hidden text-center print:block">
                        <div className="text-sm font-bold">{priority}</div>
                        <div className="text-5xl font-bold">{generatedNumber}</div>
                        <div className="text-xs text-gray-600">
                            {now.toLocaleDateString()} {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </Dialog>

                <style>
                    {`
                      @media print {
                        body * { visibility: hidden; }
                        .print-ticket, .print-ticket * { visibility: visible; }
                        .print-ticket {
                          position: absolute;
                          top: 0;
                          left: 0;
                          width: 100%;
                          padding: 10px;
                          font-family: Arial, sans-serif;
                          color: #000;
                        }
                      }
                    `}
                </style>
            </div>
        </>
    );
}
