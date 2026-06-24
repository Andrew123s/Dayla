import React from 'react';
import StaticPage from '../../components/StaticPage';

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '18px 20px',
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #ece5db',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#588157',
};

const valueStyle: React.CSSProperties = {
  fontSize: 17,
  color: '#3d3d3d',
  textDecoration: 'none',
};

const ContactPage: React.FC = () => {
  return (
    <StaticPage title="Contact Us">
      <p style={{ marginTop: 0 }}>
        We’d love to hear from you. Reach out to the Dayla team using the details below.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>Location</span>
          <span style={valueStyle}>Germany, Budapester 22, 10609 Dresden</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Email</span>
          <a href="mailto:daylaexp@gmail.com" style={valueStyle}>
            daylaexp@gmail.com
          </a>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Contact</span>
          <a href="tel:+4917673941903" style={valueStyle}>
            +4917673941903
          </a>
        </div>
      </div>
    </StaticPage>
  );
};

export default ContactPage;
