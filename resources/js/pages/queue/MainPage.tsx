import { Head } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function MainPage({ serving }: { serving: any[] }) {
    return (
        <>
            <Head title="Now Serving" />

            <div className="bg-red-600 min-h-screen p-8 text-white">
                <header className="text-center mb-12">
                    <h1 className="text-6xl font-black tracking-tight mb-2 uppercase animate-pulse">
                        Now Serving
                    </h1>
                    <p className="text-xl font-semibold text-yellow-300">
                        Please proceed to the counter.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {serving.length > 0 ? (
                        serving.map((item, idx) => (
                            <Card
                                key={idx}
                                className="bg-white text-gray-800 shadow-lg border-2 border-yellow-400"
                            >
                                <CardHeader className="text-center bg-gray-900 text-yellow-400 py-4">
                                    <CardTitle className="text-2xl font-black uppercase">
                                        {item.teller}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 text-center">
                                    {item.number ? (
                                        <>
                                            <div className="text-7xl font-black tracking-wider text-red-600">
                                                {item.number}
                                            </div>
                                            <div className="mt-2 text-xl font-bold uppercase text-gray-700">
                                                {item.transaction_type}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-gray-400">
                                            Serving Next
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center">
                            <p className="text-2xl text-yellow-300 font-medium">
                                No orders currently being served.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}