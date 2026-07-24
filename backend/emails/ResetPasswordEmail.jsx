const React = require('react');
const {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} = require('@react-email/components');

// Password-reset email — same visual language as ConfirmationEmail.jsx.
const ResetPasswordEmail = ({ userName, resetUrl }) => {
  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(Preview, null, 'Reset your Dayla password'),
    React.createElement(
      Body,
      { style: main },
      React.createElement(
        Container,
        { style: container },
        React.createElement(
          Section,
          { style: logoSection },
          React.createElement(
            'div',
            { style: logoContainer },
            React.createElement(Text, { style: logoText }, '🌿')
          ),
          React.createElement(Text, { style: brandName }, 'Dayla')
        ),
        React.createElement(Heading, { style: heading }, 'Reset your password'),
        React.createElement(Text, { style: paragraph }, `Hi ${userName || 'Explorer'},`),
        React.createElement(
          Text,
          { style: paragraph },
          'We received a request to reset the password for your Dayla account. Tap the button below to choose a new password.'
        ),
        React.createElement(
          Section,
          { style: buttonContainer },
          React.createElement(
            Button,
            { style: button, href: resetUrl },
            'Reset Password'
          )
        ),
        React.createElement(
          Text,
          { style: paragraph },
          'This link expires in 1 hour and can be used only once. If you didn\'t request a password reset, you can safely ignore this email — your password won\'t change.'
        ),
        React.createElement(Hr, { style: hr }),
        React.createElement(
          Text,
          { style: footer },
          'If the button doesn\'t work, copy and paste this link into your browser:'
        ),
        React.createElement(Link, { href: resetUrl, style: link }, resetUrl),
        React.createElement(Hr, { style: hr }),
        React.createElement(
          Text,
          { style: footerSmall },
          '© 2026 Dayla. Explore Together.'
        )
      )
    )
  );
};

// Styles (identical palette to the confirmation email).
const main = {
  backgroundColor: '#f7f3ee',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '24px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
};
const logoSection = { textAlign: 'center', marginBottom: '32px' };
const logoContainer = {
  backgroundColor: '#3a5a40',
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  margin: '0 auto 12px auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const logoText = { fontSize: '32px', margin: '0', lineHeight: '64px', textAlign: 'center' };
const brandName = { color: '#3a5a40', fontSize: '24px', fontWeight: 'bold', margin: '0', textAlign: 'center' };
const heading = { color: '#3a5a40', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 24px 0' };
const paragraph = { color: '#57534e', fontSize: '16px', lineHeight: '26px', margin: '16px 0' };
const buttonContainer = { textAlign: 'center', margin: '32px 0' };
const button = {
  backgroundColor: '#3a5a40',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '16px 32px',
};
const hr = { borderColor: '#e7e5e4', margin: '24px 0' };
const footer = { color: '#a8a29e', fontSize: '12px', lineHeight: '20px', margin: '0' };
const link = { color: '#588157', fontSize: '12px', wordBreak: 'break-all' };
const footerSmall = { color: '#a8a29e', fontSize: '12px', textAlign: 'center', margin: '24px 0 0 0' };

module.exports = ResetPasswordEmail;
