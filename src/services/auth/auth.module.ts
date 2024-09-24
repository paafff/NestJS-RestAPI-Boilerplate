import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local-strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshJwtStrategy } from './strategies/refreshToken.strategy';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  providers: [
    AuthService,
    // UserService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
  controllers: [AuthController],
  imports: [
    UserModule,
    PrismaModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      // this is access token expiration time
      signOptions: { expiresIn: '60s' },
    }),
  ],
})
export class AuthModule {}
