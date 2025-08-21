import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

// In GuardPage.tsx
export default function GuardPage() {
    const { data, setData, processing, reset } = useForm({
        ispriority: null,
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [generatedNumber, setGeneratedNumber] = useState('');
    const [priority, setPriority] = useState('');
    const [now, setNow] = useState<Date>(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (generatedNumber && priority) {
            window.print();
        }
    }, [generatedNumber, priority]);

    async function handleGenerate(value: number) {
        if (processing) return;

        try {
            const { data: response } = await axios.post(route('queue.guard.generate'), {
                ispriority: value,
            });

            let num = response.generatedNumber.toString().replace(/[^0-9]/g, '');
            num = num.padStart(4, '0');
            setGeneratedNumber(num);
            setPriority(value === 1 ? 'Priority' : 'Regular');
            setDialogOpen(true);
        } catch (error) {
            console.error(error);
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
                            className="h-20 rounded-2xl text-xl font-bold bg-blue-500 hover:bg-blue-400"
                            onClick={() => handleGenerate(0)}
                        >
                            Regular
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            className="h-20 rounded-2xl text-xl font-bold bg-amber-400 text-black hover:bg-amber-300"
                            onClick={() => handleGenerate(1)}
                        >
                            Priority
                        </Button>
                    </CardContent>
                </Card>

                {/* Ticket modal + print layout */}
                <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
                    <DialogContent className="max-w-md text-center rounded-3xl bg-slate-900/80 backdrop-blur-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-amber-300">
                                Your Number
                            </DialogTitle>
                            <div className="mt-4 text-6xl font-bold text-amber-400">
                                {generatedNumber}
                            </div>
                            <div className="mt-2 text-lg">{priority}</div>
                        </DialogHeader>
                        <Button
                            onClick={() => setDialogOpen(false)}
                            className="mt-6 w-full rounded-2xl bg-amber-500 text-black"
                        >
                            OK
                        </Button>
                    </DialogContent>

                    {/* Print-only ticket */}
                    <div className="print-ticket hidden text-center print:block">
                        <div className="text-sm font-bold">{priority}</div>
                        <div className="text-5xl font-bold">{generatedNumber}</div>
                        <div className="text-xs text-gray-600">
                            {now.toLocaleDateString()} {now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
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

