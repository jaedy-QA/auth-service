import express from 'express';
import { authRouter } from './authController.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRouter);

export { authRouter };

if (process.env.STANDALONE === 'true') {
  const PORT = process.env.AUTH_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Auth Service running standalone on port ${PORT}`);
  });
}
