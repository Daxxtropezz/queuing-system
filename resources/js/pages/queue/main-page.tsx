import { Head } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function MainPage({ serving }: { serving: any[] }) {
    return (
        <>
            <Head title="Now Serving" />
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 flex flex-col items-center justify-center p-0">
                <header className="w-full py-8 bg-blue-800 shadow-lg text-center">
                    <h1 className="text-7xl font-extrabold tracking-wide text-yellow-300 drop-shadow-lg uppercase mb-2 animate-pulse">
                        NOW SERVING
                    </h1>
                    <p className="text-2xl font-semibold text-white tracking-wide">
                        Please proceed to the counter
                    </p>
                </header>
                <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 w-full max-w-7xl">
                        {serving.length > 0 ? (
                            serving.map((item, idx) => (
                                <Card
                                    key={idx}
                                    className="bg-gradient-to-br from-white via-yellow-100 to-yellow-50 border-4 border-yellow-400 shadow-2xl rounded-3xl flex flex-col items-center justify-center"
                                    style={{ minHeight: "350px" }}
                                >
                                    <CardHeader className="w-full text-center bg-yellow-400 rounded-t-3xl py-6 shadow">
                                        <CardTitle className="text-4xl font-black uppercase text-blue-900 tracking-wider">
                                            Counter {item.teller}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center pt-10">
                                        {item.number ? (
                                            <>
                                                <div className="text-8xl font-extrabold tracking-widest text-red-600 drop-shadow-lg mb-4">
                                                    {item.number}
                                                </div>
                                                <div className="mt-2 text-2xl font-bold uppercase text-blue-900">
                                                    {item.transaction_type}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-4xl font-bold text-gray-400 mt-10">
                                                Serving Next
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <p className="text-4xl text-yellow-300 font-bold drop-shadow-lg">
                                    No orders currently being served.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <footer className="w-full py-4 bg-blue-900 text-center text-white text-lg font-semibold tracking-wide shadow-inner">
                    Welcome to DSWD Queuing System
                </footer>
            </div>
        </>
    );
}