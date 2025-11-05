import { cn } from "@/lib/utils";
import * as React from "react";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn(className)} {...props}>
                {children}
            </div>
        );
    }
);

Box.displayName = "Box";

export default Box;