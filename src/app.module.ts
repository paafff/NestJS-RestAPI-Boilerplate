import { Module } from '@nestjs/common';
import { InitializationModule } from './services/initialization/initialization.module';
import { AuthModule } from './services/auth/auth.module';
import { UserModule } from './services/user/user.module';
import { MailModule } from './services/mail/mail.module';
import { ChatModule } from './services/chat/chat.module';
import { UploadFileModule } from './services/upload-file/upload-file.module';

@Module({
  imports: [
    InitializationModule,
    AuthModule,
    UserModule,
    MailModule,
    ChatModule,
    UploadFileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
