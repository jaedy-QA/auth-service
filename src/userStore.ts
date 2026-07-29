import crypto from 'crypto';
import { User } from '../../shared-types/src/index.js';

export interface StoredUser extends User {
  passwordHash: string;
}

// In-memory user store with pre-seeded demo user
const users = new Map<string, StoredUser>();
// Session tokens mapping token -> userId
const sessions = new Map<string, { userId: string; createdAt: Date }>();

// Helper to hash passwords securely using crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_notes_salt').digest('hex');
}

// Seed default demo user: demo@example.com / password123
const demoId = 'user_demo_101';
const demoHash = hashPassword('password123');
users.set(demoId, {
  id: demoId,
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
  passwordHash: demoHash
});

export const UserStore = {
  findByEmail(email: string): StoredUser | undefined {
    const normalized = email.trim().toLowerCase();
    for (const user of users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  },

  findById(id: string): User | undefined {
    const u = users.get(id);
    if (!u) return undefined;
    const { passwordHash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  },

  createUser(email: string, password: string, name: string): User {
    const normalized = email.trim().toLowerCase();
    if (this.findByEmail(normalized)) {
      throw new Error('User with this email already exists');
    }

    const id = 'user_' + crypto.randomBytes(6).toString('hex');
    const newUser: StoredUser = {
      id,
      email: normalized,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password)
    };

    users.set(id, newUser);
    const { passwordHash, ...userPublic } = newUser;
    return userPublic;
  },

  verifyPassword(storedHash: string, passwordAttempt: string): boolean {
    return storedHash === hashPassword(passwordAttempt);
  },

  createSession(userId: string): string {
    const token = 'token_' + crypto.randomBytes(16).toString('hex');
    sessions.set(token, { userId, createdAt: new Date() });
    return token;
  },

  getUserByToken(token: string): User | undefined {
    const session = sessions.get(token);
    if (!session) return undefined;
    return this.findById(session.userId);
  },

  removeSession(token: string): void {
    sessions.delete(token);
  }
};
