interface LoadingOverlayProps {
    visible?: boolean;
    title?: string;
    message?: string;
    className?: string;
    iconSrc?: string;
    iconAlt?: string;
    iconSize?: number;
    animation?: 'spin' | 'pulse' | 'bounce' | 'none';
}

export default function LoadingOverlay({
    visible = true,
    title = 'Loading…',
    message = '',
    className = '',
    iconSrc = '/img/dswd.png',
    iconAlt = 'DSWD logo',
    iconSize = 32,
    animation = 'bounce',
}: LoadingOverlayProps) {
    if (!visible) return null;

    const animationClass = (() => {
        switch (animation) {
            case 'pulse':
                return 'animate-pulse';
            case 'spin':
                return 'animate-spin';
            case 'none':
                return '';
            case 'bounce':
            default:
                return 'animate-bounce';
        }
    })();

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 ${className}`} role="status" aria-live="polite">
            <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                {iconSrc ? (
                    <img
                        src={iconSrc}
                        alt={iconAlt}
                        aria-hidden={iconAlt ? 'false' : 'true'}
                        className={`object-contain ${animationClass}`}
                        style={{ height: iconSize, width: iconSize }}
                    />
                ) : (
                    <svg className={`${animationClass} h-6 w-6 text-blue-600`} viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                )}
                <div>
                    <div className="font-semibold">{title}</div>
                    {message ? <div className="text-xs text-gray-500">{message}</div> : null}
                </div>
            </div>
        </div>
    );
}