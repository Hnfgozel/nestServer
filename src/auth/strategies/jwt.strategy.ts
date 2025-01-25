import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'OTRFG2zNEXaV4hZv2ysP1Uzs+8PoN13CNCS1A+3bMk8=', // TODO, use environment variables
    });
  }

  async validate(payload: JwtPayload) {
    await Promise.resolve(); 
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
} 