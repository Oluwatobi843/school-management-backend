

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

export const ROLES_KEY = 'roles';

export const role = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)