import type { MetadataRoute } from 'next';

// Lets her add Job Hunter to her phone's home screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Job Hunter',
    short_name: 'Job Hunter',
    description: 'Private job search and application tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#eef1f6',
    theme_color: '#0f1b33',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
