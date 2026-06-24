
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Landing from './components/Landing';
import PrivacyPage from './app/privacy/page';
import TermsPage from './app/terms/page';
import ContactPage from './app/contact/page';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Lightweight path-based routing for the public-facing pages. The authenticated
// app (auth, dashboard, community, etc.) continues to use its own state-based
// routing inside <App />.
function resolveRoute(): React.ReactElement {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);

  // Email verification / board invitation links must always reach <App />,
  // even when they arrive on the root path with a query token.
  if (params.get('token') || params.get('invitationId') || path === '/verify-email') {
    return <App />;
  }

  switch (path) {
    case '/':
    case '/index.html':
      return <Landing />;
    case '/privacy':
      return <PrivacyPage />;
    case '/terms':
      return <TermsPage />;
    case '/contact':
      return <ContactPage />;
    default:
      // /auth and any other in-app route
      return <App />;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {resolveRoute()}
  </React.StrictMode>
);

// Register Service Worker for PWA (offline-first)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('[PWA] Service Worker registered with scope:', registration.scope);

      // Check for updates periodically
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — notify user
              console.log('[PWA] New version available. Refresh to update.');
              // Auto-activate new SW
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    } catch (error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    }
  });

  // Reload page when new SW takes control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
