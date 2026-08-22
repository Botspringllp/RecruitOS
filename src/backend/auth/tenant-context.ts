import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface TenantContext {
  agencyId: string;
  userId: string;
  userRole?: string;
  email?: string;
}

/**
 * Extracts and validates the tenant context (agencyId and userId) for API Route Handlers.
 * In production, it extracts from the HttpOnly JWT cookie.
 * Development header bypass is ONLY allowed if ALLOW_DEV_AUTH is explicitly set to 'true' AND NOT in production.
 */
export async function getTenantContext(): Promise<TenantContext> {
  // 1. Development Mode header bypass (GATED explicitly on ALLOW_DEV_AUTH env variable)
  if (process.env.ALLOW_DEV_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
    const reqHeaders = await headers();
    const devAgencyId = reqHeaders.get('x-agency-id');
    const devUserId = reqHeaders.get('x-user-id');
    if (devAgencyId && devUserId) {
      return {
        agencyId: devAgencyId,
        userId: devUserId,
      };
    }
  }

  // 2. Cookie Extraction & Verification
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Unauthorized: Missing authentication token');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }

  try {
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || !decoded.agencyId || !decoded.userId) {
      throw new Error('Unauthorized: Invalid token structure');
    }
    return {
      agencyId: decoded.agencyId,
      userId: decoded.userId,
      userRole: decoded.role,
      email: decoded.email,
    };
  } catch (error: any) {
    throw new Error('Unauthorized: Invalid or expired authentication token');
  }
}
