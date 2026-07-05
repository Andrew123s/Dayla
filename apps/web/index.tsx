
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';

// Route-level code splitting: visitors on the public landing/legal pages never
// download the (much larger) authenticated app bundle, and vice versa.
const App = lazy(() => import('./App'));
const Landing = lazy(() => import('./components/Landing'));
const PrivacyPage = lazy(() => import('./app/privacy/page'));
const TermsPage = lazy(() => import('./app/terms/page'));
const ContactPage = lazy(() => import('./app/contact/page'));

const RouteFallback: React.FC = () => (
  <div
    style={{
      height: 'var(--app-height, 100dvh)',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f3ee',
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        border: '4px solid rgba(58,90,64,0.25)',
        borderTopColor: '#3a5a40',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
  </div>
);

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
  // even when they arrive on the root path with a query token. Same for the
  // return from Stripe checkout / the billing portal (?billing=success|cancel),
  // which Stripe sends back to the site root.
  if (
    params.get('token') ||
    params.get('invitationId') ||
    params.get('billing') ||
    path === '/verify-email'
  ) {
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
    <Suspense fallback={<RouteFallback />}>
      {resolveRoute()}
    </Suspense>
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
