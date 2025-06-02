import nodemailer from 'nodemailer';
import { IUser } from '../models/User';
import dotenv from 'dotenv';
import { EmailLog } from '../models/EmailLog';
dotenv.config();

// For development, we'll use a test SMTP service
// In production, replace with real SMTP credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    secure: true,
    port: 465,
    host: 'smtp.gmail.com'
});

export const sendVerificationEmail = async (user: IUser, verificationToken: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"SmartFlow CRM" <noreply@smartflow.com>',
    to: user.email,
    subject: 'Verify your SmartFlow CRM account',
    html: `
      <h1>Welcome to SmartFlow CRM!</h1>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for registering with SmartFlow CRM. Please verify your email address by clicking the button below:</p>
      <p>
        <a href="${verificationUrl}" style="
          background-color: #2D3282;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin: 16px 0;
        ">
          Verify Email Address
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>Best regards,<br>The SmartFlow CRM Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (user: IUser, resetToken: string) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"SmartFlow CRM" <noreply@smartflow.com>',
    to: user.email,
    subject: 'Reset your SmartFlow CRM password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.firstName},</p>
      <p>We received a request to reset your SmartFlow CRM password. Click the button below to reset it:</p>
      <p>
        <a href="${resetUrl}" style="
          background-color: #2D3282;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin: 16px 0;
        ">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br>The SmartFlow CRM Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendCustomEmail = async (
  to: string,
  subject: string,
  message: string,
  sentBy: any = null,
  type: string = 'manual',
  relatedEntity: any = null
) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"SmartFlow CRM" <noreply@smartflow.com>',
    to,
    subject,
    html: `<div style='font-family:sans-serif;font-size:16px;'>${message.replace(/\n/g, '<br>')}</div>`
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    await EmailLog.create({
      to,
      subject,
      body: message,
      sentBy,
      status: 'sent',
      type,
      relatedEntity,
      sentAt: new Date()
    });
    return info;
  } catch (error) {
    await EmailLog.create({
      to,
      subject,
      body: message,
      sentBy,
      status: 'failed',
      type,
      relatedEntity,
      error: (error as any).message,
      sentAt: new Date()
    });
    throw error;
  }
}; 