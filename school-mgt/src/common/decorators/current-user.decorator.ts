import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { UserRole } from '../../auth/entities/user.entity';

export interface AuthenticatedUser {
  id: number;
  sub?: number;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request: { user?: AuthenticatedUser } = ctx
      .switchToHttp()
      .getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
