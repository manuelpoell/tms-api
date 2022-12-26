import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule, utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import { LogInterceptor } from './interceptors/log.interceptor';
import { LogService } from './services/log.service';
import { redactJson } from './utils/redact-json';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        level:
          config.get<string>('NODE_ENV', 'development') === 'development'
            ? 'debug'
            : 'info',
        format:
          config.get<string>('NODE_ENV', 'development') === 'development'
            ? winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonUtilities.format.nestLike(),
              )
            : winston.format.printf((message) =>
                JSON.stringify(redactJson(message)),
              ),
        transports:
          config.get<string>('NODE_ENV', 'development') === 'development'
            ? [new winston.transports.Console()]
            : [
                new winston.transports.File({
                  filename: config.get<string>(
                    'TMS_LOG_FILE',
                    '/var/log/tms-api.log',
                  ),
                }),
              ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    LogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
  ],
  exports: [LogService],
})
export class CoreModule {}
