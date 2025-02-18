import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

export default app;
