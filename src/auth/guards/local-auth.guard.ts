import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new BadRequestException('invalid credentials');
    }
    return user;
  }
}
