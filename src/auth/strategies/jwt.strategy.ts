import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../models/jwt-payload.models';
import { SessionInfoModel } from '../models/session-info.models';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['TMS_JWT_SECRET'] ?? 's0m3r4nd0ms3cr3t',
    });
  }

  async validate(payload: JwtPayload): Promise<SessionInfoModel> {
    return {
      userId: payload.sub,
    };
  }
}
