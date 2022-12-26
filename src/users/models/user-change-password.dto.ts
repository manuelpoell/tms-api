import { IsString } from 'class-validator';

export class UserChangePasswordDto {
  @IsString()
  password: string;

  @IsString()
  newPassword: string;
}
