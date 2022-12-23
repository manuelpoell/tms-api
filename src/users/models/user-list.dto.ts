import { UserDto } from './user.dto';

export interface UserListDto {
  users: Array<UserDto>;
  filterCount: number;
  totalCount: number;
}
