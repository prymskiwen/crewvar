import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    envDir: ".",
    base: "/",
    server: {
        hmr: {
            overlay: false
        }
    },
    build: {
        assetsDir: "assets",
        rollupOptions: {
            output: {
                assetFileNames: "assets/[name]-[hash][extname]",
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    ui: ['react-router-dom', '@reduxjs/toolkit', 'react-redux']
                }
            },
        },
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@reduxjs/toolkit',
            'react-redux',
            'redux-persist',
            '@tanstack/react-query',
            'react-toastify',
            'firebase/app',
            'firebase/auth',
            'firebase/firestore'
        ],
        exclude: [
            'firebase/storage',
            'firebase/functions',
            'firebase/database'
        ]
    },
    plugins: [
        react(),
        VitePWA({
            registerType: "prompt",
            includeAssets: [
                "favicon.ico",
                "apple-touch-icon.png",
                "masked-icon.svg",
            ],
            manifest: {
                name: "Crewvar: Connect with Crew Members",
                short_name: "Crewvar",
                description: "Connect with crew members from cruise ships worldwide",
                theme_color: "#fff",
                start_url: "/",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
        }),
    ],
});