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
    data: {
        formatted_number: string;
        started_at: string | null;
        finished_at: string | null;
    }[];
}

export default function ServiceTimeChart({ data }: ServiceTimeChartProps) {
    const chartData = {
        labels: data.map((t) => t.formatted_number),
        datasets: [{
            label: "Service Time (s)",
            data: data.map((t) =>
                t.started_at && t.finished_at
                    ? Math.round(
                        (new Date(t.finished_at).getTime() -
                            new Date(t.started_at).getTime()) /
                        1000
                    )
                    : 0
            ),
            backgroundColor: "#f59e0b",
            borderRadius: 6,
        }],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.raw} sec`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Seconds",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Queue Number",
                },
            },
        },
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Service Time Analysis</CardTitle>
                <CardDescription>Time spent per transaction (in seconds)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}
