import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'OTRFG2zNEXaV4hZv2ysP1Uzs+8PoN13CNCS1A+3bMk8=', // TODO, use environment variables
      signOptions: { expiresIn: '1h' },
    }),
    FirebaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {} 