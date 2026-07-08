import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const templates = {
  emailVerification: (data) => ({
    subject: 'Verify your email - ManagePD',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ManagePD</h1>
        </div>
        <div style="padding: 40px; background: #ffffff;">
          <h2 style="color: #1f2937;">Welcome to ManagePD!</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">Hi ${data.name},</p>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">Thank you for signing up! Please verify your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationLink}" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">This link expires in 24 hours.</p>
          <p style="color: #9ca3af; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #f9fafb;">
          <p style="color: #9ca3af; font-size: 12px;">© 2024 ManagePD. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Reset your password - ManagePD',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ManagePD</h1>
        </div>
        <div style="padding: 40px; background: #ffffff;">
          <h2 style="color: #1f2937;">Reset Your Password</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">Hi ${data.name},</p>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #9ca3af; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #f9fafb;">
          <p style="color: #9ca3af; font-size: 12px;">© 2024 ManagePD. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  workspaceInvitation: (data) => ({
    subject: `You've been invited to ${data.workspaceName} - ManagePD`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ManagePD</h1>
        </div>
        <div style="padding: 40px; background: #ffffff;">
          <h2 style="color: #1f2937;">Workspace Invitation</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">Hi ${data.name},</p>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">${data.invitedByName} has invited you to join <strong>${data.workspaceName}</strong> as a <strong>${data.role}</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.inviteLink}" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">This invitation expires in 7 days.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #f9fafb;">
          <p style="color: #9ca3af; font-size: 12px;">© 2024 ManagePD. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

export const sendEmail = async ({ to, subject, template, data }) => {
  if (config.env === 'test') {
    logger.debug(`[TEST] Skipping email to ${to}: ${template}`);
    return { messageId: 'test-mock-id' };
  }

  try {
    const { subject: emailSubject, html } = templates[template](data);

    const mailOptions = {
      from: `"ManagePD" <${config.smtp.from}>`,
      to,
      subject: emailSubject || subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`Email sending failed: ${error.message}`);
    throw error;
  }
};

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info('Email server is ready');
  } catch (error) {
    logger.warn(`Email server not ready: ${error.message}`);
  }
};
