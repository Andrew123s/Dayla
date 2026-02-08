const { Resend } = require('resend');
const React = require('react');
const { render } = require('@react-email/components');
const ConfirmationEmail = require('../emails/ConfirmationEmail.jsx');
const InvitationEmail = require('../emails/InvitationEmail.jsx');
const logger = require('../utils/logger');

// Initialize Resend with API key (only if key is provided)
let resend = null;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here') {
  resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send email confirmation to new user
 * @param {string} to - Recipient email address
 * @param {string} userName - User's name
 * @param {string} confirmationUrl - URL to confirm email
 */
const sendConfirmationEmail = async (to, userName, confirmationUrl) => {
  try {
    // Check if Resend is configured
    if (!resend) {
      logger.warn('Resend API key not configured. Email not sent.');
      logger.info(`[DEV] Confirmation URL for ${to}: ${confirmationUrl}`);
      return { id: 'dev-mode', message: 'Email skipped - no API key' };
    }

    // Render the React Email component to HTML
    const emailHtml = await render(
      React.createElement(ConfirmationEmail, { userName, confirmationUrl })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: 'Confirm your Dayla account',
      html: emailHtml,
    });

    if (error) {
      logger.error('Failed to send confirmation email:', error);
      throw new Error(error.message);
    }

    logger.info(`Confirmation email sent to ${to}`);
    return data;
  } catch (error) {
    logger.error('Email service error:', error);
    throw error;
  }
};

/**
 * Send invitation email to user
 * @param {string} to - Recipient email address
 * @param {string} inviterName - Name of the person sending invitation
 * @param {string} dashboardName - Name of the dashboard
 * @param {string} invitationUrl - URL to accept invitation
 */
const sendInvitationEmail = async (to, inviterName, dashboardName, invitationUrl) => {
  try {
    // Check if Resend is configured
    if (!resend) {
      logger.warn('Resend API key not configured. Email not sent.');
      logger.info(`[DEV MODE] Invitation details:`);
      logger.info(`  To: ${to}`);
      logger.info(`  From: ${inviterName}`);
      logger.info(`  Dashboard: ${dashboardName}`);
      logger.info(`  URL: ${invitationUrl}`);
      
      // Return success in dev mode so the flow continues
      return { id: 'dev-mode', message: 'Email skipped - no API key configured. Check logs for invitation URL.' };
    }

    logger.info(`Attempting to send invitation email to ${to}...`);

    // Render the React Email component to HTML
    const emailHtml = await render(
      React.createElement(InvitationEmail, { 
        recipientEmail: to, 
        inviterName, 
        dashboardName, 
        invitationUrl 
      })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: `${inviterName} invited you to collaborate on ${dashboardName}`,
      html: emailHtml,
    });

    if (error) {
      logger.error('Resend API error:', error);
      // Log the invitation URL so it can still be shared manually
      logger.warn(`⚠️  Email delivery failed. Invitation URL for manual sharing: ${invitationUrl}`);
      logger.warn('Note: If using onboarding@resend.dev, emails can only be sent to the Resend account owner email. Add a custom domain in Resend to send to any address.');
      // Don't throw - let the invitation still be created in the database
      return { id: 'email-failed', message: error.message, invitationUrl };
    }

    logger.info(`✅ Invitation email sent successfully to ${to} for dashboard ${dashboardName}`);
    logger.info(`Email ID: ${data.id}`);
    return data;
  } catch (error) {
    logger.error('Invitation email service error:', error);
    // Log invitation URL as fallback
    logger.warn(`⚠️  Email service error. Invitation URL for manual sharing: ${invitationUrl}`);
    // Don't throw - let the invitation still be recorded
    return { id: 'email-error', message: error.message, invitationUrl };
  }
};

/**
 * Generate email verification token
 * @returns {string} - Random token
 */
const generateVerificationToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  sendConfirmationEmail,
  sendInvitationEmail,
  generateVerificationToken,
};
