import Box from '@/components/ui/box';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonFullWidthSection({ title }: { title: string }) {
    return (
        <Box className="space-y-4">
            <Box className="h-5 w-40 rounded-md bg-muted" />
            <Separator />
            <Box className="space-y-3">
                <Skeleton className="h-5 w-80 rounded-md" />
                <Skeleton className="h-5 w-64 rounded-md" />
            </Box>
        </Box>
    );
}
