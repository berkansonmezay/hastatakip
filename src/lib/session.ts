import { cookies } from 'next/headers';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure the secret is 32 bytes (exactly 32 characters in ASCII/UTF-8)
const SECRET_KEY = process.env.SESSION_SECRET || 'klinikhastatakipsistemi32bytekey'; // exactly 32 chars

export interface SessionPayload {
  userId: string;
  role: string;
  name: string;
  expiresAt: string;
}

export function encrypt(payload: SessionPayload): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(token: string): SessionPayload | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const duration = 7 * 24 * 60 * 60 * 1000; // 7 days
  const expiresAt = new Date(Date.now() + duration);
  
  const fullPayload: SessionPayload = {
    ...payload,
    expiresAt: expiresAt.toISOString(),
  };

  const encrypted = encrypt(fullPayload);
  const cookieStore = await cookies();

  cookieStore.set('session', encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    if (!cookie) return null;

    const payload = decrypt(cookie);
    if (!payload) return null;

    // Check expiration
    if (new Date(payload.expiresAt) < new Date()) {
      cookieStore.delete('session');
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}
