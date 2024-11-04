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
import path from 'path';
import logger from '@/services/loggerService';
import { queueService } from '@/services/queueService';
import { SendEmailFunction, emailJobData } from '@/types/types'; 
import handlebars from 'handlebars';
import fs from 'fs';
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

    public sendEmail: SendEmailFunction = async (to, templateName, subject, locals) => {
        const emailData = { to, templateName, subject, locals };
        await queueService.addJob('emailQueue', 'sendEmail', emailData); // QueueName, JobName, JobData
        logger.info(`Email Job added to Queue: emailQueue`, { service: 'emailService'});
    }

    public processEmailJob = async (jobData: emailJobData) => {
        var { to, templateName, subject, locals } = jobData;
        locals = { ...locals, appName: process.env.APPNAME, year: new Date().getFullYear() }; // Add appName and year to locals

        const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
        const source = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(source);
        const htmlContent = template(locals);

        const mailOptions = {
            from: `${process.env.APPNAME} ${process.env.EMAIL_USER}`,
            to,
            subject: subject,
            html: htmlContent,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`${templateName} Email sent to ${to}`, { service: 'emailService'});
        } catch (error: any) {
            logger.error(`Error sending email to ${to}: ${error.message}`, { service: 'emailService'});
            throw error;
        }
    }

}

export const emailService = new EmailService();