import { Router, Request, Response } from 'express';
import { UserStore } from './userStore.js';
import { RegisterRequest, LoginRequest, ApiResponse } from '../../shared-types/src/index.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as RegisterRequest;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: 'Email, password, and name are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    const newUser = UserStore.createUser(email, password, name);
    const token = UserStore.createSession(newUser.id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: newUser
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const storedUser = UserStore.findByEmail(email);
    if (!storedUser || !UserStore.verifyPassword(storedUser.passwordHash, password)) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = UserStore.createSession(storedUser.id);
    const { passwordHash, ...userPublic } = storedUser;

    res.json({
      success: true,
      data: {
        token,
        user: userPublic
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Internal auth error.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ success: false, error: 'No authorization token provided.' });
    return;
  }

  const user = UserStore.getUserByToken(token);
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
    return;
  }

  res.json({ success: true, data: { user } });
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (token) {
    UserStore.removeSession(token);
  }

  res.json({ success: true, data: { message: 'Logged out successfully.' } });
});

// Export helper middleware to verify auth token for other microservices
export function requireAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. Missing token.' });
    return;
  }

  const user = UserStore.getUserByToken(token);
  if (!user) {
    res.status(401).json({ success: false, error: 'Authentication failed. Invalid token.' });
    return;
  }

  (req as any).userId = user.id;
  (req as any).user = user;
  next();
}
