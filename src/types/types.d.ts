export type SendEmailFunction = (to: string, templateName: string, subject: string, locals: object) => Promise<void>;
export type queueJobFunction = (queueName: string, jobName: string, jobData: any) => Promise<Job>;

export type emailJobData = { 
    to: string; 
    templateName: string; 
    subject: string;
    locals: object;
};
