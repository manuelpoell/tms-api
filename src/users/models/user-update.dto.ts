import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from './user-role.enum';

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
