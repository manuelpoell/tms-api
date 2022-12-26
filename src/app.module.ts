import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('TMS_MONGODB_URI', 'mongodb://localhost:27017'),
        user: config.get<string>('TMS_MONGODB_USER', 'tms'),
        pass: config.get<string>('TMS_MONGODB_PASSWORD', 'tms'),
        dbName: config.get<string>('TMS_MONGODB_DBNAME', 'tms'),
        authSource: config.get<string>('TMS_MONGODB_DBNAME', 'tms'),
      }),
      inject: [ConfigService],
    }),
    CoreModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
