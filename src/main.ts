import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

// Register Angular service worker (ngsw-worker.js) when available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/ngsw-worker.js')
      .then((reg) => console.log('Angular service worker registered.', reg))
      .catch((err) => console.warn('Service worker registration failed:', err));
  });
}
