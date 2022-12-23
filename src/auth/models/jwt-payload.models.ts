import { UserRole } from 'src/users/models/user-role.enum';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat?: string;
  exp?: string;
}
