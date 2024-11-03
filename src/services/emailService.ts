/*
    Service: EmailService
    Description: Service to send emails using nodemailer and queueService
    Methods:
        - sendEmail(to: string, template: file, locals?: object): Promise<void>
        - processEmailJob(jobData: any): Promise<void>
    Usage:
        - Use sendEmail method to send an email. It will add the email job to the emailQueue
        - The emailQueue will process the email job and send the email using nodemailer
        - If the email fails to send, it will log an error. If the email is sent successfully, it will log a success message
*/
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';
import logger from '@/services/loggerService';
import { queueService } from '@/services/queueService';
import dotenv from 'dotenv';
dotenv.config();

class EmailService {
    private transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
    });

    // Email Template Configuration
    private email = new Email({
        message: {
            from: `${process.env.APPNAME} ${process.env.EMAIL_USER}`,
        },
        transport: this.transporter,
        send: true,
        preview: false,
        views: {
            root: path.join(__dirname, '../templates'),
            options: {
                extension: 'pug',
            },
        },
    })

    public async sendEmail(to: string, template: string, locals?: object): Promise<void> {
        const emailData = { to, template, locals };
        await queueService.addJob('emailQueue', 'sendEmail', emailData); // QueueName, JobName, JobData
        logger.info(`Email Job added to Queue: emailQueue`, { service: 'emailService'});
    }

    public async processEmailJob(jobData: { to: string; template: string; locals?: object }): Promise<void> {
        var { to, template, locals } = jobData;
        locals = { ...locals, appName: process.env.APPNAME }; // Add appName to locals


        try {
            await this.email.send({
                template: template,
                message: { to },
                locals, // Data to be passed to the template
            });

            logger.info(`${template} Email sent to ${to}`, { service: 'emailService'});
        } catch (error: any) {
            logger.error(`Error sending email to ${to}: ${error.message}`, { service: 'emailService'});
            throw error;
        }
    }

}

export const emailService = new EmailService();