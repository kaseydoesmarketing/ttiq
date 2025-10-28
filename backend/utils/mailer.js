/**
 * Email Utility for TitleIQ
 *
 * Handles sending transactional emails for authentication flows
 * Supports Resend, SendGrid, and AWS SES
 */

const MAIL_PROVIDER = process.env.MAIL_PROVIDER || 'resend';
const MAIL_FROM = process.env.MAIL_FROM || 'TitleIQ <no-reply@tightslice.com>';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Send password reset code email
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit reset code
 * @returns {Promise<Object>} - Send result
 */
export async function sendPasswordResetCode(email, code) {
  const subject = 'Reset your TitleIQ password';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">TitleIQ</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>

      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
        You requested to reset your password. Use the code below to complete the password reset process:
      </p>

      <!-- Code Box -->
      <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center;">
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>

      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
        This code will expire in <strong>15 minutes</strong>.
      </p>

      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://titleiq.tightslice.com/reset-password"
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Reset Password →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f7fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
      <p style="color: #718096; font-size: 13px; line-height: 1.5; margin: 0;">
        This email was sent by TitleIQ. If you have any questions, please contact us.
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin: 10px 0 0 0;">
        © ${new Date().getFullYear()} TitleIQ. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  const text = `
Reset Your TitleIQ Password

You requested to reset your password. Use the code below:

${code}

This code will expire in 15 minutes.

If you didn't request this password reset, you can safely ignore this email.

Visit https://titleiq.tightslice.com/reset-password to reset your password.

---
TitleIQ
© ${new Date().getFullYear()} TitleIQ. All rights reserved.
  `;

  return await sendEmail(email, subject, html, text);
}

/**
 * Send password change confirmation email
 * @param {string} email - Recipient email address
 * @returns {Promise<Object>} - Send result
 */
export async function sendPasswordChangeConfirmation(email) {
  const subject = 'Your TitleIQ password was changed';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">✓ Password Changed</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Your Password Was Successfully Changed</h2>

      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
        This email confirms that your TitleIQ account password was changed on <strong>${new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        })}</strong>.
      </p>

      <div style="background-color: #f0fdf4; border-left: 4px solid #48bb78; padding: 16px; margin: 20px 0;">
        <p style="color: #065f46; margin: 0; font-weight: 500;">
          ✓ Your account is secure
        </p>
      </div>

      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0 0 0;">
        If you did not make this change or believe an unauthorized person has accessed your account, please contact us immediately.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://titleiq.tightslice.com/login"
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Log In to TitleIQ →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f7fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
      <p style="color: #718096; font-size: 13px; line-height: 1.5; margin: 0;">
        This is a security notification from TitleIQ.
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin: 10px 0 0 0;">
        © ${new Date().getFullYear()} TitleIQ. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  const text = `
Your TitleIQ Password Was Changed

This email confirms that your TitleIQ account password was changed on ${new Date().toLocaleString()}.

If you did not make this change or believe an unauthorized person has accessed your account, please contact us immediately.

Visit https://titleiq.tightslice.com/login to log in.

---
TitleIQ
© ${new Date().getFullYear()} TitleIQ. All rights reserved.
  `;

  return await sendEmail(email, subject, html, text);
}

/**
 * Core email sending function (provider-agnostic)
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @param {string} text - Plain text body
 * @returns {Promise<Object>} - Send result
 */
async function sendEmail(to, subject, html, text) {
  // In development, log instead of sending
  if (NODE_ENV === 'development') {
    console.log('[MAILER] [DEV MODE] Would send email:');
    console.log('[MAILER] To:', to);
    console.log('[MAILER] Subject:', subject);
    console.log('[MAILER] Body:', text.slice(0, 200) + '...');

    return {
      success: true,
      provider: 'dev-mode',
      messageId: 'dev-' + Date.now()
    };
  }

  try {
    switch (MAIL_PROVIDER) {
      case 'resend':
        return await sendViaResend(to, subject, html, text);

      case 'sendgrid':
        return await sendViaSendGrid(to, subject, html, text);

      case 'ses':
        return await sendViaSES(to, subject, html, text);

      default:
        throw new Error(`Unknown mail provider: ${MAIL_PROVIDER}`);
    }
  } catch (error) {
    console.error('[MAILER] Failed to send email:', error);

    // In production, we still want the app to work even if email fails
    // Log the error but don't throw
    if (NODE_ENV === 'production') {
      console.error('[MAILER] [CRITICAL] Email delivery failed in production:', error.message);

      // Fall back to logging masked content for manual intervention
      console.warn('[MAILER] [FALLBACK] Email to:', to.replace(/(.{2}).*@/, '$1***@'));
      console.warn('[MAILER] [FALLBACK] Subject:', subject);
    }

    throw error; // Re-throw in non-production for debugging
  }
}

/**
 * Send email via Resend
 */
async function sendViaResend(to, subject, html, text) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [to],
      subject,
      html,
      text
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Resend API error: ${data.message || response.statusText}`);
  }

  console.log('[MAILER] Email sent via Resend:', data.id);

  return {
    success: true,
    provider: 'resend',
    messageId: data.id
  };
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(to, subject, html, text) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: {
        email: MAIL_FROM.match(/<(.+)>/)?.[1] || MAIL_FROM,
        name: MAIL_FROM.match(/(.+)</) ? MAIL_FROM.match(/(.+)</)[1].trim() : 'TitleIQ'
      },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  const messageId = response.headers.get('x-message-id');
  console.log('[MAILER] Email sent via SendGrid:', messageId);

  return {
    success: true,
    provider: 'sendgrid',
    messageId
  };
}

/**
 * Send email via AWS SES
 */
async function sendViaSES(to, subject, html, text) {
  // AWS SES implementation would require AWS SDK
  // For now, just throw an error indicating it's not implemented
  throw new Error('AWS SES provider not yet implemented. Use resend or sendgrid instead.');
}

export default {
  sendPasswordResetCode,
  sendPasswordChangeConfirmation
};
