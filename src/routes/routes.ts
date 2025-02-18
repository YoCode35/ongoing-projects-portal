import { Router } from 'express';
import usersRouter from './users';
import loginRouter from './login';
import clientsRouter from './clients';
import dashboardRouter from './dashboard';

const router = Router();

router.use('/users', usersRouter);
router.use('/login', loginRouter);
router.use('/admin/clients', clientsRouter);
router.use('/dashboard', dashboardRouter);

export default router;
