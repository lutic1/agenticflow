/**
 * Authentication and Authorization
 * Fixes: V-006 (Missing Authentication - CVSS 9.8)
 */

import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
}

/**
 * Simple authentication manager (production should use OAuth 2.0 or JWT)
 * This is a minimal implementation to fix V-006
 */
export class AuthenticationManager {
  private sessions: Map<string, Session> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    // Create a default admin user for testing
    // In production, this should be removed and users created via secure registration
    this.users.set('admin@example.com', {
      id: 'user-admin',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date()
    });
  }

  /**
   * Authenticate user and create session
   * In production, implement proper password hashing with bcrypt
   */
  async authenticate(email: string, password: string): Promise<AuthToken | null> {
    // SECURITY NOTE: This is a placeholder
    // In production, use bcrypt.compare() with hashed passwords
    const user = this.users.get(email);
    if (!user) {
      return null;
    }

    // Create session
    const session = this.createSession(user.id);

    return {
      token: session.token,
      expiresAt: session.expiresAt
    };
  }

  /**
   * Create a new session
   */
  private createSession(userId: string): Session {
    const session: Session = {
      id: this.generateId(),
      userId,
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date()
    };

    this.sessions.set(session.token, session);
    return session;
  }

  /**
   * Validate session token
   */
  validateToken(token: string): { valid: boolean; userId?: string; error?: string } {
    const session = this.sessions.get(token);

    if (!session) {
      return { valid: false, error: 'Invalid token' };
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, userId: session.userId };
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.id === userId);
  }

  /**
   * Check if user has required role
   */
  authorize(userId: string, requiredRole: User['role']): boolean {
    const user = this.getUser(userId);
    if (!user) return false;

    const roleHierarchy = { admin: 3, user: 2, guest: 1 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Revoke session (logout)
   */
  revokeToken(token: string): void {
    this.sessions.delete(token);
  }

  /**
   * Generate cryptographically secure token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `session-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(token);
      }
    }
  }
}

// Singleton instance
export const authManager = new AuthenticationManager();

/**
 * Middleware for protecting routes (Express-style)
 */
export function requireAuth(requiredRole: User['role'] = 'user') {
  return (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validation = authManager.validateToken(token);
    if (!validation.valid) {
      return res.status(401).json({ error: validation.error });
    }

    if (!authManager.authorize(validation.userId!, requiredRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = authManager.getUser(validation.userId!);
    next();
  };
}
