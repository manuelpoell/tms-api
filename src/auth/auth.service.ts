import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/models/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthResultDto } from './models/auth-result.dto';
import { JwtPayload } from './models/jwt-payload.models';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Validates given login credentials and returns user on success.
   * @param email
   * @param password
   * @returns
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }

    return null;
  }

  /**
   * Generates access and refresh tokens for successfully logged in user.
   * @param user
   * @returns
   */
  async login(user: User): Promise<AuthResultDto> {
    const tokens = await this.getTokens(user);
    this.usersService.setRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Refreshes the accessToken and refreshToken of a user.
   * @param userId
   * @param refreshToken
   * @returns
   */
  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthResultDto> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new NotFoundException();
    }

    if (!bcrypt.compareSync(refreshToken, user.refreshToken)) {
      throw new UnauthorizedException();
    }

    const tokens = await this.getTokens(user);
    this.usersService.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  /**
   * Performs a user logout by deleting the refresh token.
   * @param userId
   */
  async logout(userId: string): Promise<void> {
    return this.usersService.setRefreshToken(userId, null);
  }

  private async getTokens(user: User): Promise<AuthResultDto> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get<string>('TMS_JWT_EXPIRATION', '20m'),
        secret: this.config.get<string>('TMS_JWT_SECRET', 's0m3r4nd0ms3cr3t'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get<string>(
          'TMS_REFRESH_TOKEN_EXPIRATION',
          '7d',
        ),
        secret: this.config.get<string>(
          'TMS_REFRESH_TOKEN_SECRET',
          'myr3fr3sht0k3ns3cr3t',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
