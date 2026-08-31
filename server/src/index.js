import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedData } from './seed.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Server error' }); });

const PORT = process.env.PORT || 4003;
connectDB().then(() => seedData()).then(() => app.listen(PORT, () => console.log(`[server] API on http://localhost:${PORT}`))).catch((e) => { console.error(e); process.exit(1); });
