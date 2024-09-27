import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  // private async sendEmail(emailOptions: EmailOptions): Promise<void> {
  async sendEmail(emailOptions: EmailOptions): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("🚀 ~ sendEmail ~ transporter:", transporter)

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailOptions.to,
      subject: emailOptions.subject,
      text: emailOptions.text,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
