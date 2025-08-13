import { useForm } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function GuardPage() {
    const { data, setData, post, processing, errors } = useForm({
        transaction_type: "",
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route("queue.guard.generate"));
    }

    return (
        <div className="p-8 max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Queue Number</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select
                            value={data.transaction_type}
                            onValueChange={val => setData("transaction_type", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                <SelectItem value="Cash Withdrawal">Cash Withdrawal</SelectItem>
                                <SelectItem value="Account Opening">Account Opening</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.transaction_type && (
                            <div className="text-red-500">{errors.transaction_type}</div>
                        )}
                        <Button type="submit" disabled={processing}>Generate Number</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
