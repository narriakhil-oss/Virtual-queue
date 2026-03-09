import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'vqueue_super_secret_key_123';

export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}
