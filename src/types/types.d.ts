export type SendEmailFunction = (to: string, templateName: string, subject: string, locals: object) => Promise<void>;
export type queueJobFunction = (queueName: string, jobName: string, jobData: any) => Promise<Job>;

export type emailJobData = { 
    to: string; 
    templateName: string; 
    subject: string;
    locals: object;
};

type CustomUser = {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    email_verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

declare global {
    namespace Express {
        interface User extends CustomUser {}
    }
}