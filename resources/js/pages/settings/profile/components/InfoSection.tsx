import Box from '@/components/ui/box';
import { Separator } from '@/components/ui/separator';
import type { DetailItem } from '../types';

export default function InfoSection({ title, details }: { title: string; details: DetailItem[] }) {
    return (
        <Box className="space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Separator />
            <Box className="space-y-3">
                {details.map((item, index) => (
                    <Box key={index} className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                        <span className="text-base font-semibold">{item.value}</span>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
