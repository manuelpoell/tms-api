import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SessionInfoModel } from 'src/auth/models/session-info.models';
import { SessionInfo } from 'src/auth/decorators/session-info.decorator';
import { UserDtoMapper } from './mapper/user-dto.mapper';
import { UserDto } from './models/user.dto';
import { UsersService } from './users.service';
import { UserUpdateDto } from './models/user-update.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@SessionInfo() session: SessionInfoModel): Promise<UserDto> {
    return UserDtoMapper(
      await this.usersService.findByIdOrFail(session.userId),
    );
  }

  @Patch('me')
  async patchMe(@SessionInfo() session: SessionInfoModel, @Body() userUpdate: UserUpdateDto): Promise<UserDto> {
    return UserDtoMapper(
      await this.usersService.updateUser(session.userId, userUpdate),
    );
  }
}
