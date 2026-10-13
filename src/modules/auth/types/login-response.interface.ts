import { PublicUser } from '../../users/types/public-user.interface';

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: PublicUser;
}