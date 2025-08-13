import { useForm } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, HelpCircle, DollarSign, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

export default function GuardPage() {
  const { data, setData, post, processing, errors, reset } = useForm({
    transaction_type: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedNumber, setGeneratedNumber] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    post(route("queue.guard.generate"), {
      onSuccess: (page: any) => {
        const number = page.props.generatedNumber || "N/A"; // server must return generated number
        setGeneratedNumber(number);
        setDialogOpen(true);

        // Trigger print after short delay so dialog renders
        setTimeout(() => {
          window.print();
        }, 300);
      },
    });
  }

  function handleDialogClose() {
    setDialogOpen(false);
    reset(); // resets dropdown to default
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-2xl shadow-2xl rounded-3xl border border-gray-200">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-blue-800">
            Generate Your Queue Number
          </CardTitle>
          <p className="text-gray-500 text-lg">Please select your transaction type</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              value={data.transaction_type}
              onValueChange={(val) => setData("transaction_type", val)}
            >
              <SelectTrigger className="h-16 text-lg px-6 rounded-2xl">
                <SelectValue placeholder="Tap to choose transaction type" />
              </SelectTrigger>
              <SelectContent className="text-lg">
                <SelectItem value="General Inquiry">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-blue-500" /> General Inquiry
                  </div>
                </SelectItem>
                <SelectItem value="Cash Withdrawal">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-500" /> Cash Withdrawal
                  </div>
                </SelectItem>
                <SelectItem value="Account Opening">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-6 h-6 text-orange-500" /> Account Opening
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.transaction_type && (
              <div className="text-red-500 text-center text-lg">
                {errors.transaction_type}
              </div>
            )}
            <Button
              type="submit"
              disabled={processing}
              size="lg"
              className="w-full h-20 text-2xl rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              {processing && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
              Generate Number
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-sm rounded-2xl text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-700">Your Number Is</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-4 text-5xl font-extrabold text-gray-900">{generatedNumber}</div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={handleDialogClose}
            className="mt-6 w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
