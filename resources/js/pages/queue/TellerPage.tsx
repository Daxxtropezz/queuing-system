import { useForm, Head } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from '@/layouts/app-layout';

export default function TellerPage({ current }: { current?: any }) {
    const { post, processing } = useForm();

   function handleGrab() {
    post(route("queue.teller.grab"));
}

function handleNext() {
    post(route("queue.teller.next"));
}

const breadcrumbs = [
    {
        title: 'Teller',
        href: '/queue/teller',
    },
];

return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Teller" />
        <div className="p-8 max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Teller Panel</CardTitle>
                </CardHeader>
                <CardContent>
                    {current ? (
                        <div>
                            <div className="text-4xl font-bold mb-2">{current.number}</div>
                            <div className="text-lg mb-4">{current.transaction_type}</div>
                            <div className="text-green-600">Now Serving</div>
                            <div className="mt-4">
                                <Button onClick={handleNext} disabled={processing}>Next</Button>
                            </div>
                        </div>
                    ) : (
                        <Button onClick={handleGrab} disabled={processing}>Grab Next Number</Button>
                    )}
                </CardContent>
            </Card>
        </div>
    </AppLayout>
);
}