import { IsString } from 'class-validator';

export class UserDeleteSelfDto {
  @IsString()
  password: string;
}
