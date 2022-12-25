import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.schema';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { SessionInfoModel } from 'src/auth/models/session-info.models';
import { UserRole } from './models/user-role.enum';
import { UserAddDto } from './models/user-add.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Finds user by email.
   * @param email
   * @returns
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Finds user by ID.
   * @param id
   * @returns
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findOne({ id }).exec();
  }

  /**
   * Finds user by ID, fails otherwise.
   * @param id
   * @returns
   */
  async findByIdOrFail(session: SessionInfoModel, id: string): Promise<User> {
    // Only admins should be able to view other users
    if (session.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`user with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Returns a list of users with text filter, offset and limit.
   * @param session
   * @param limit
   * @param offset
   * @param filter
   * @returns
   */
  async getUserList(
    session: SessionInfoModel,
    limit: number,
    offset: number,
    filter: string,
  ): Promise<{ users: Array<User>; filterCount: number; totalCount: number }> {
    // Only admins should be able to fetch the list of users
    if (session.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const filterOptions =
      filter.length > 0 ? { $text: { $search: filter } } : {};

    const users = await this.userModel
      .find(filterOptions)
      .skip(offset)
      .limit(limit)
      .exec();
    const filterCount = await this.userModel
      .countDocuments(filterOptions)
      .exec();
    const totalCount = await this.userModel.countDocuments().exec();

    return {
      users,
      totalCount,
      filterCount,
    };
  }

  /**
   * Adds a new user.
   * @param session
   * @param addUser
   * @returns
   */
  async addUser(session: SessionInfoModel, addUser: UserAddDto): Promise<User> {
    // Only admins should be able to add new users
    if (session.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const user = new this.userModel({
      id: uuidv4(),
      firstName: addUser.firstName,
      lastName: addUser.lastName,
      email: addUser.email,
      role: addUser.role,
      password: bcrypt.hashSync(addUser.password, 10),
    });

    return user.save();
  }

  /**
   * Updates a user by ID with new values.
   * @param id
   * @param userUpdate
   * @returns
   */
  async updateUser(
    session: SessionInfoModel,
    id: string,
    userUpdate: Partial<User>,
  ): Promise<User> {
    // Only admins should be able to update other users
    if (session.userId !== id && session.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`user with ID ${id} not found`);
    }

    user.firstName = userUpdate.firstName ?? user.firstName;
    user.lastName = userUpdate.lastName ?? user.lastName;
    user.email = userUpdate.email ?? user.email;

    return user.save();
  }

  /**
   * Deletes a user by ID.
   * @param session
   * @param id
   * @returns
   */
  async deleteUserById(session: SessionInfoModel, id: string): Promise<void> {
    // Only admins should be able to delete users
    if (session.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    await this.userModel.deleteOne({ id }).exec();
    return;
  }

  /**
   * Deletes own user account.
   * @param session
   * @param password
   */
  async deleteSelf(session: SessionInfoModel, password: string): Promise<void> {
    const user = await this.userModel.findOne({ id: session.userId });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException(`provided password does not match`);
    }

    await this.userModel.deleteOne({ id: session.userId });
    return;
  }

  /**
   * Sets/Unsets refresh token for a user.
   * @param userId
   * @param refreshToken
   */
  async setRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const user = await this.userModel.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException(`user with ID ${userId} not found`);
    }

    user.refreshToken = refreshToken ? bcrypt.hashSync(refreshToken, 10) : '';
    await user.save();
    return;
  }
}
