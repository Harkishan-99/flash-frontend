import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

// Create a transporter
const transporter = nodemailer.createTransport(smtpConfig);

export async function sendAdminApprovalEmail(userEmail: string, userName: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('Admin email not configured');
    return;
  }

  const message = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: adminEmail,
    subject: 'New User Registration Approval Required',
    html: `
      <h1>New User Registration</h1>
      <p>A new user has registered and is awaiting approval:</p>
      <ul>
        <li><strong>Name:</strong> ${userName || 'Not provided'}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
      </ul>
      <p>Please log in to the admin dashboard to approve or reject this user.</p>
      <a href="${process.env.NEXTAUTH_URL}/admin/users" style="padding: 10px 15px; background-color: #FFD700; color: #000; text-decoration: none; border-radius: 4px;">Go to Admin Dashboard</a>
    `,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Admin notification email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw new Error('Failed to send admin notification email');
  }
}

export async function sendUserApprovalEmail(userEmail: string, userName: string) {
  const message = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: userEmail,
    subject: 'Your Account Has Been Approved',
    html: `
      <h1>Account Approved</h1>
      <p>Hello ${userName || 'there'},</p>
      <p>Your account has been approved. You can now log in to the Flash platform.</p>
      <a href="${process.env.NEXTAUTH_URL}/login" style="padding: 10px 15px; background-color: #FFD700; color: #000; text-decoration: none; border-radius: 4px;">Login Now</a>
    `,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Approval notification email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending user approval email:', error);
    throw new Error('Failed to send user approval email');
  }
}

export async function sendUserRejectionEmail(userEmail: string, userName: string) {
  const message = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: userEmail,
    subject: 'Regarding Your Account Registration',
    html: `
      <h1>Registration Status</h1>
      <p>Hello ${userName || 'there'},</p>
      <p>We regret to inform you that your account registration was not approved at this time.</p>
      <p>If you believe this was done in error or have any questions, please contact our support team.</p>
    `,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Rejection notification email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending user rejection email:', error);
    throw new Error('Failed to send user rejection email');
  }
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;
  
  const message = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: userEmail,
    subject: 'Password Reset Request',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="padding: 10px 15px; background-color: #FFD700; color: #000; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
} 