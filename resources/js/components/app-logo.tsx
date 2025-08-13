import AppLogoIcon from './app-logo-icon';

function getAppAcronym(name: string): string {
    return name
        .split(/[\s-]+/)
        .map((word) => word[0]?.toUpperCase())
        .join('');
}

export default function AppLogo() {
    const appName = import.meta.env.VITE_APP_NAME || 'App';
    const acronymEnabled = import.meta.env.VITE_APP_ACRONYM_ENABLED === 'true';

    const displayName = acronymEnabled ? getAppAcronym(appName) : appName;

    return (
        <>
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-7 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{displayName}</span>
            </div>
        </>
    );
}
