import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import os from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// ESM-safe __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Auto-detect a non-internal IPv4 address for HMR host (fallbacks to env or localhost)
function getLANIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] ?? []) {
            if (net && typeof net === 'object' && net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return undefined;
}

export default defineConfig(({ mode }) => {
    const envVars = loadEnv(mode, process.cwd(), '');
    const useHttps = envVars.VITE_DEV_SERVER_HTTPS === 'true';
    const hmrPort = Number(envVars.VITE_HMR_PORT || 5173);

    // Prefer explicit env if provided and not 0.0.0.0; otherwise auto-detect LAN IP; fallback to localhost
    const envHost = envVars.VITE_HMR_HOST && envVars.VITE_HMR_HOST.trim() !== '' ? envVars.VITE_HMR_HOST.trim() : undefined;
    const clientHost = envHost && envHost !== '0.0.0.0' ? envHost : getLANIP() || 'localhost';

    // Always advertise a usable origin to the browser (never 0.0.0.0)
    const originUnsafe = envVars.VITE_DEV_SERVER_URL || `${useHttps ? 'https' : 'http'}://${clientHost}:${hmrPort}`;
    const origin = originUnsafe.replace(/\/+$/, '');

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
                hotFile: 'storage/framework/vite.hot',
            }),
            react(),
            tailwindcss(),
        ],
        define: {
            'process.env': {
                // Only expose variables you NEED (e.g., VITE_* variables)
                VITE_API_URL: JSON.stringify(process.env.VITE_API_URL),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            },
        },
        esbuild: {
            jsx: 'automatic',
        },
        resolve: {
            alias: {
                'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
                '@': resolve(__dirname, 'resources/js'),
                '~': resolve(__dirname, 'resources'),
            },
        },
        server: {
            host: true, // bind 0.0.0.0 for LAN access
            port: hmrPort,
            strictPort: true,
            origin, // absolute URL for dev assets
            hmr: {
                host: clientHost, // browser connects to this host (LAN IP or localhost)
                port: hmrPort,
                clientPort: hmrPort,
                protocol: useHttps ? 'wss' : 'ws',
            },
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['*'],
            },
        },
        preview: {
            host: true,
            port: hmrPort,
        },
    };
});
