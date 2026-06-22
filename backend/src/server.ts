import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import priceRoutes from './routes/priceRoutes';

import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import constantRoutes from './routes/constantRoutes';
import coverRuleRoutes from './routes/coverRuleRoutes';
import customerRoutes from './routes/customerRoutes';
import templateRoutes from './routes/templateRoutes';
import uploadRoutes from './routes/uploadRoutes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/constants', constantRoutes);
app.use('/api/coverrules', coverRuleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('Selenge API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
