import React from 'react';
import Footer from './Footer';

interface StaticPageProps {
  title: string;
  children: React.ReactNode;
}

const StaticPage: React.FC<StaticPageProps> = ({ title, children }) => {
  return (
    <div
      style={{
        minHeight: 'var(--app-height, 100dvh)',
        width: '100%',
        background: '#f7f3ee',
        fontFamily: "'Quicksand', sans-serif",
        color: '#3d3d3d',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          width: '100%',
          padding: '20px 20px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        <a href="/" aria-label="Dayla home" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <img
            src="/icons/Daylap_Logo_Green.png"
            alt="Dayla"
            style={{ height: 40, width: 'auto', display: 'block' }}
          />
        </a>
        <a
          href="/"
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#3a5a40',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: 999,
            border: '1px solid #cdd9c4',
          }}
        >
          ← Home
        </a>
      </header>

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 760,
          margin: '0 auto',
          padding: '32px 20px 0',
          boxSizing: 'border-box',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 800,
            color: '#3a5a40',
            letterSpacing: '-0.02em',
            margin: '0 0 24px',
          }}
        >
          {title}
        </h1>
        <div style={{ fontSize: 17, lineHeight: 1.7, color: '#4a4a4a' }}>{children}</div>
      </main>

      <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
        <Footer />
      </div>
    </div>
  );
};

export default StaticPage;
