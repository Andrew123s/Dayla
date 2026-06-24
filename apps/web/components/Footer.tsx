import React from 'react';

const linkStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#52796f',
  textDecoration: 'none',
};

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        width: '100%',
        borderTop: '1px solid #e7e0d6',
        marginTop: 48,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/privacy" style={linkStyle}>Privacy</a>
        <a href="/terms" style={linkStyle}>Terms</a>
        <a href="/contact" style={linkStyle}>Contact</a>
      </nav>
      <p style={{ margin: 0, fontSize: 13, color: '#9c9488' }}>
        © {new Date().getFullYear()} Dayla. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
