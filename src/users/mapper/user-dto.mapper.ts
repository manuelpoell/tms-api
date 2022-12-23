import { DataMapper } from 'src/core/utils/data.mapper';
import { UserDto } from '../models/user.dto';
import { User } from '../models/user.schema';

export const UserDtoMapper: DataMapper<User, UserDto> = (from) => ({
  id: from.id,
  firstName: from.firstName,
  lastName: from.lastName,
  email: from.email,
  role: from.role,
});
