import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.schema';
import * as bcrypt from 'bcrypt';

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
  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();

    if (!user) {
      throw new NotFoundException(`user with ID ${id} not found`);
    }

    return user;
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
    user.save();
    return;
  }
}
