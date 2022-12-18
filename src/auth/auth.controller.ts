import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthResultDto } from './models/auth-result.dto';
import { SessionInfoModel } from './models/session-info.models';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { SessionInfo } from './decorators/session-info.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any): Promise<AuthResultDto> {
    return this.authService.login(req.user);
  }

  @Get('refresh')
  @Public()
  @UseGuards(RefreshTokenGuard)
  async refreshAccessToken(@Request() req: any): Promise<AuthResultDto> {
    return this.authService.refreshTokens(
      req.user.userId,
      req.user.refreshToken,
    );
  }

  @Post('logout')
  async logout(@SessionInfo() sessionInfo: SessionInfoModel): Promise<void> {
    return this.authService.logout(sessionInfo.userId);
  }
}
