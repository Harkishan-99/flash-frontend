import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Calculate token expiry time (1 hour from now)
 */
export function getTokenExpiry(): Date {
  return new Date(Date.now() + 1000 * 60 * 60); // 1 hour
} 