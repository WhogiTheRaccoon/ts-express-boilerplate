/*
    Service: QueueService
    Description: Service to create and manage queues using BullMQ
    Methods:
        - getQueue(queueName: string): Queue
        - addJob(queueName: string, jobName: string, jobData: any): Promise<Job>
        - clearQueue(queueName: string): Promise<void>
        - createWorker(queueName: string): void
    Usage:
    - Use getQueue method to get the queue by name
    - Use addJob method to add a job to the queue
    - Use createWorker method to create a worker for the queue
    - Use clearQueue method to clear the queue
*/
import { Queue, Worker, QueueOptions, Job } from 'bullmq';
import logger from '@/services/loggerService';
import { emailService } from '@/services/emailService'; // Import emailService
import dotenv from 'dotenv';
dotenv.config();

class QueueService {
    private queues: { [key: string]: Queue } = {};
    private redisConnection: any;

    constructor() {
      this.redisConnection = {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASS || undefined
      };
    }

    // Dynamic Queue
    public getQueue(queueName: string): Queue {
        if (!this.queues[queueName]) {
            const queueOptions: QueueOptions = {
                connection: this.redisConnection,
            };

            this.queues[queueName] = new Queue(queueName, queueOptions);
            this.createWorker(queueName);
        }
        return this.queues[queueName];
    }

    // Add Job to Queue
    public async addJob(queueName: any, jobName: string, jobData: any): Promise<Job> {
        const queue = this.getQueue(queueName);
        const job = await queue.add(jobName, jobData);
        return job;
    }

    // Create Worker
    private createWorker(queueName: string) {
        const worker = new Worker(queueName, async (job: any) => {
            const { name, data } = job;
            logger.info(`Processing Job: ${name} in Queue: ${queueName} with data: ${JSON.stringify(data)}`, { service: 'queueService' });

            switch (queueName) { // Add switch case for each queue
                case 'emailQueue':
                    await emailService.processEmailJob(data);
                    break;
                default:
                    logger.error(`Queue: ${queueName} not found`, { service: 'queueService' });
            }
        }, {
            connection: this.redisConnection,
            limiter: {
                max: 10,
                duration: 1000,
            },
        });

        worker.on('completed', (job: any) => {
            logger.info(`Job: ${job.id} in Queue: ${queueName} completed`, { service: 'queueService' });
        });

        worker.on('failed', (job: any, err) => {
            logger.error(`Job: ${job.id} in Queue: ${queueName} failed with error: ${err.message}`, { service: 'queueService' });
        });
    }

    // Clear Queue
    public async clearQueue(queueName: string): Promise<void> {
        const queue = this.getQueue(queueName);
        const time = Number(process.env.REDIS_CLEAR) || 0;

        queue.clean(time, 'completed' as any).then((jobs) => {
            logger.info(`Cleared ${jobs} completed jobs from Queue: ${queueName}`, { service: 'queueService' });
        }).catch((error) => {
            logger.error(`Error clearing Queue: ${queueName}: ${error}`, { service: 'queueService' });
        });
    }

}

export const queueService = new QueueService();