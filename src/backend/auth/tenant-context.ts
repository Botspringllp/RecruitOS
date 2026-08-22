import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface TenantContext {
  agencyId: string;
  userId: string;
  userRole?: string;
}

/**
 * Extracts and validates the tenant context (agencyId and userId) for API Route Handlers.
 * In production, it extracts from the HttpOnly JWT cookie.
 * Dev header bypass is strictly gated behind process.env.ALLOW_DEV_AUTH === 'true'.
 */
export async function getTenantContext(): Promise<TenantContext> {
  // 1. Strict Dev-Bypass gated behind ALLOW_DEV_AUTH environment variable
  if (process.env.ALLOW_DEV_AUTH === 'true') {
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

  // 2. Cookie extraction & verification
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Unauthorized: Missing authentication token');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  const secret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || !decoded.agencyId || !decoded.userId) {
      throw new Error('Unauthorized: Invalid token structure');
    }
    return {
      agencyId: decoded.agencyId,
      userId: decoded.userId,
      userRole: decoded.role,
    };
  } catch (error: any) {
    throw new Error(`Unauthorized: ${error.message || 'Invalid or expired token'}`);
  }
}
