import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import SignaturePad from 'signature_pad';

interface SignaturePadProps {
    className?: string;
    width?: number;
    height?: number;
}

export interface SignaturePadMethods {
    clearSignature: () => void;
    saveSignature: () => string | null;
    isEmpty: () => boolean;
    loadSignature: (data: string) => void;
    disable: () => void;
    enable: () => void;
}

const SignaturePadComponent = forwardRef<SignaturePadMethods, SignaturePadProps>(({ className, width = 400, height = 200 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Set canvas dimensions
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;

        // Initialize signature pad with proper options
        signaturePadRef.current = new SignaturePad(canvas, {
            backgroundColor: 'transparent',
            penColor: 'rgb(0, 0, 0)',
            velocityFilterWeight: 0.7,
            minWidth: 1,
            maxWidth: 2.5,
            throttle: 16, // 60fps
        });

        // Handle window resize
        const handleResize = () => {
            if (!containerRef.current || !canvas) return;

            // Get the actual displayed size
            const rect = canvas.getBoundingClientRect();

            // Set canvas internal size to match displayed size
            canvas.width = rect.width;
            canvas.height = rect.height;

            // Clear and redraw if there was a signature
            if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                const data = signaturePadRef.current.toDataURL();
                signaturePadRef.current.clear();
                signaturePadRef.current.fromDataURL(data);
            }
        };

        // Initial adjustment
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (signaturePadRef.current) {
                signaturePadRef.current.off();
            }
        };
    }, [width, height]);

    const disable = () => {
        if (canvasRef.current) {
            canvasRef.current.style.pointerEvents = 'none';
        }
    };

    const enable = () => {
        if (canvasRef.current) {
            canvasRef.current.style.pointerEvents = 'auto';
        }
    };

    useImperativeHandle(ref, () => ({
        clearSignature: () => {
            if (signaturePadRef.current) {
                signaturePadRef.current.clear();
            }
        },
        saveSignature: () => {
            if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                return signaturePadRef.current.toDataURL('image/png');
            }
            return null;
        },
        isEmpty: () => {
            return signaturePadRef.current ? signaturePadRef.current.isEmpty() : true;
        },
        loadSignature: (signatureData: string) => {
            if (signaturePadRef.current) {
                signaturePadRef.current.fromDataURL(signatureData);
            }
        },
        disable,
        enable,
    }));

    return (
        <div ref={containerRef} className={`inline-block ${className}`}>
            <canvas
                ref={canvasRef}
                className="h-full w-full cursor-crosshair rounded-lg border border-gray-300 bg-white"
                style={{ width: `${width}px`, height: `${height}px` }}
            />
        </div>
    );
});

SignaturePadComponent.displayName = 'SignaturePad';

export default SignaturePadComponent;
