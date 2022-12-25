import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SessionInfoModel } from 'src/auth/models/session-info.models';
import { SessionInfo } from 'src/auth/decorators/session-info.decorator';
import { UserDtoMapper } from './mapper/user-dto.mapper';
import { UserDto } from './models/user.dto';
import { UsersService } from './users.service';
import { UserUpdateDto } from './models/user-update.dto';
import { UserListDto } from './models/user-list.dto';
import { UserAddDto } from './models/user-add.dto';
import { UserDeleteSelfDto } from './models/user-delete-self.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUserList(
    @SessionInfo() session: SessionInfoModel,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('filter', new DefaultValuePipe('')) filter: string,
  ): Promise<UserListDto> {
    const { users, filterCount, totalCount } =
      await this.usersService.getUserList(session, limit, offset, filter);
    return {
      users: users.map((user) => UserDtoMapper(user)),
      filterCount,
      totalCount,
    };
  }

  @Get('me')
  async getMe(@SessionInfo() session: SessionInfoModel): Promise<UserDto> {
    return UserDtoMapper(
      await this.usersService.findByIdOrFail(session, session.userId),
    );
  }

  @Get(':id')
  async getUser(
    @SessionInfo() session: SessionInfoModel,
    @Param('id') userId: string,
  ): Promise<UserDto> {
    return UserDtoMapper(
      await this.usersService.findByIdOrFail(session, userId),
    );
  }

  @Post()
  async addUser(
    @SessionInfo() session: SessionInfoModel,
    @Body() addUser: UserAddDto,
  ): Promise<UserDto> {
    return UserDtoMapper(await this.usersService.addUser(session, addUser));
  }

  @Patch('me')
  async patchMe(
    @SessionInfo() session: SessionInfoModel,
    @Body() userUpdate: UserUpdateDto,
  ): Promise<UserDto> {
    return UserDtoMapper(
      await this.usersService.updateUser(session, session.userId, userUpdate),
    );
  }

  @Patch(':id')
  async patchUser(
    @SessionInfo() session: SessionInfoModel,
    @Param('id') userId: string,
    @Body() userUpdate: UserUpdateDto,
  ): Promise<UserDto> {
    return UserDtoMapper(
      await this.usersService.updateUser(session, userId, userUpdate),
    );
  }

  @Put('me')
  async deleteSelf(
    @SessionInfo() session: SessionInfoModel,
    @Body() body: UserDeleteSelfDto,
  ): Promise<void> {
    return await this.usersService.deleteSelf(session, body.password);
  }

  @Delete(':id')
  async deleteUser(
    @SessionInfo() session: SessionInfoModel,
    @Param('id') userId: string,
  ): Promise<void> {
    return await this.usersService.deleteUserById(session, userId);
  }
}
