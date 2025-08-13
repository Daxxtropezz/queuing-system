import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { env } from 'node:process';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: env.APP_URL,
        port: 5173,
        origin: 'http://localhost:5173',
        cors: {
            origin: ['http://localhost:1620'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
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
});
