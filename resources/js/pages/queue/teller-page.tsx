import { useForm, Head } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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
      title: "Teller",
      href: "/queue/teller",
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Teller" />
      <div className="p-6 flex justify-center">
        <Card className="w-full max-w-lg shadow-xl rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl font-bold text-gray-800">
              Teller Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {current ? (
              <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                <div className="text-6xl font-extrabold text-gray-900 tracking-wider">
                  {current.number}
                </div>
                <div className="text-lg text-gray-600 font-medium">
                  {current.transaction_type?.name}
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  Now Serving
                </Badge>

                <Button
                  onClick={handleNext}
                  disabled={processing}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 ease-in-out rounded-lg shadow-lg"
                >
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Next
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                <p className="text-gray-500 text-sm">
                  No current queue number assigned
                </p>
                <Button
                  onClick={handleGrab}
                  disabled={processing}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 ease-in-out rounded-lg shadow-lg"
                >
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Grab Next Number
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
