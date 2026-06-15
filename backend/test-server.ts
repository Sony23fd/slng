import express from 'express';
import { authMiddleware } from './src/middleware/authMiddleware';
import priceRoutes from './src/routes/priceRoutes';

const app = express();
app.use(express.json());
app.use('/api/prices', priceRoutes);

app.listen(3002, () => {
  console.log("Test server on 3002");
});
