import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface ServiceTimeChartProps {
    step1Data: {
        formatted_number: string;
        started_at_step1: string | null;
        finished_at_step1: string | null;
        transaction_type?: { name: string };
        ispriority?: boolean|number;
    }[];
    step2Data: {
        formatted_number: string;
        started_at_step2: string | null;
        finished_at_step2: string | null;
        transaction_type?: { name: string };
        ispriority?: boolean|number;
    }[];
}

function buildChartData(data: any[], step: 1 | 2) {
    return {
        labels: data.map((t) =>
            `${t.formatted_number} (${t.transaction_type?.name || ''} ${t.ispriority ? 'Priority' : 'Regular'})`
        ),
        datasets: [{
            label: `Service Time (s) - Step ${step}`,
            data: data.map((t) => {
                const started = step === 1 ? t.started_at_step1 : t.started_at_step2;
                const finished = step === 1 ? t.finished_at_step1 : t.finished_at_step2;
                return started && finished
                    ? Math.round((new Date(finished).getTime() - new Date(started).getTime()) / 1000)
                    : 0;
            }),
            backgroundColor: step === 1 ? "#f59e0b" : "#6366f1",
            borderRadius: 6,
        }],
    };
}

export default function ServiceTimeChart({ step1Data, step2Data }: ServiceTimeChartProps) {
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.raw} sec`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Seconds" },
            },
            x: {
                title: { display: true, text: "Queue Number / Type" },
            },
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
                <CardHeader>
                    <CardTitle>Service Time Analysis (Step 1)</CardTitle>
                    <CardDescription>Time spent per transaction (in seconds) - Step 1</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <Bar data={buildChartData(step1Data, 1)} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Service Time Analysis (Step 2)</CardTitle>
                    <CardDescription>Time spent per transaction (in seconds) - Step 2</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <Bar data={buildChartData(step2Data, 2)} options={chartOptions} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
