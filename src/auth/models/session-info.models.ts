import { UserRole } from 'src/users/models/user-role.enum';

export interface SessionInfoModel {
  userId: string;
  role: UserRole;
}
