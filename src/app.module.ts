import { Module } from '@nestjs/common';
import { InitializationModule } from './services/initialization/initialization.module';
import { AuthModule } from './services/auth/auth.module';
import { UserModule } from './services/user/user.module';

@Module({
  imports: [InitializationModule, AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
