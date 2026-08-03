import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface TenantContext {
  agencyId: string;
  userId: string;
}

/**
 * Extracts and validates the tenant context (agencyId and userId) for API Route Handlers.
 * In production, it extracts from the HttpOnly JWT cookie.
 * In development, it allows a fallback to custom request headers for easier testing.
 */
export async function getTenantContext(): Promise<TenantContext> {
  // 1. Development Mode fallback using headers (extremely useful for Postman/Insomnia testing)
  if (process.env.NODE_ENV === 'development') {
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

  // 2. Production Cookie extraction
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('Unauthorized: Missing authentication token');
  }

  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_change_me_in_prod';

  try {
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || !decoded.agencyId || !decoded.userId) {
      throw new Error('Unauthorized: Invalid token structure');
    }
    return {
      agencyId: decoded.agencyId,
      userId: decoded.userId,
    };
  } catch (error) {
    throw new Error('Unauthorized: Invalid or expired token');
  }
}
