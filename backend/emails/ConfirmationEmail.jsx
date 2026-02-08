const React = require('react');
const {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} = require('@react-email/components');

const ConfirmationEmail = ({ userName, confirmationUrl }) => {
  return React.createElement(
    Html,
    null,
    React.createElement(
      Head,
      null
    ),
    React.createElement(
      Preview,
      null,
      'Confirm your Dayla account'
    ),
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
            React.createElement(
              Text,
              { style: logoText },
              '🌿'
            )
          ),
          React.createElement(
            Text,
            { style: brandName },
            'Dayla'
          )
        ),
        React.createElement(
          Heading,
          { style: heading },
          'Confirm your email'
        ),
        React.createElement(
          Text,
          { style: paragraph },
          `Hi ${userName || 'Explorer'},`
        ),
        React.createElement(
          Text,
          { style: paragraph },
          'Welcome to Dayla! We\'re excited to have you join our community of outdoor enthusiasts. Please confirm your email address to get started on your adventure planning journey.'
        ),
        React.createElement(
          Section,
          { style: buttonContainer },
          React.createElement(
            Button,
            { style: button, href: confirmationUrl },
            'Confirm Email Address'
          )
        ),
        React.createElement(
          Text,
          { style: paragraph },
          'This link will expire in 24 hours. If you didn\'t create an account with Dayla, you can safely ignore this email.'
        ),
        React.createElement(Hr, { style: hr }),
        React.createElement(
          Text,
          { style: footer },
          'If the button doesn\'t work, copy and paste this link into your browser:'
        ),
        React.createElement(
          Link,
          { href: confirmationUrl, style: link },
          confirmationUrl
        ),
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

// Styles
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

const logoSection = {
  textAlign: 'center',
  marginBottom: '32px',
};

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

const logoText = {
  fontSize: '32px',
  margin: '0',
  lineHeight: '64px',
  textAlign: 'center',
};

const brandName = {
  color: '#3a5a40',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center',
};

const heading = {
  color: '#3a5a40',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '0 0 24px 0',
};

const paragraph = {
  color: '#57534e',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center',
  margin: '32px 0',
};

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

const hr = {
  borderColor: '#e7e5e4',
  margin: '24px 0',
};

const footer = {
  color: '#a8a29e',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
};

const link = {
  color: '#588157',
  fontSize: '12px',
  wordBreak: 'break-all',
};

const footerSmall = {
  color: '#a8a29e',
  fontSize: '12px',
  textAlign: 'center',
  margin: '24px 0 0 0',
};

module.exports = ConfirmationEmail;
