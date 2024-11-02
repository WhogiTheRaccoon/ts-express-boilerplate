import { Express } from 'express';
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';

module.exports = (app: Express) => {
    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);

    app.get('/heartbeat', (req, res) => {
        res.send('Service is healthy');
    });

}