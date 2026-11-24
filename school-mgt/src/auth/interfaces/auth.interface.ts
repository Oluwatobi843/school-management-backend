import { User } from '../entities/user.entity';

export interface AuthResponse {
  message: string;
  access_token: string;
  user: Omit<User, 'password'>;
}