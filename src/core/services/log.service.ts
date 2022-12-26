import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';

@Injectable()
export class LogService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  /**
   * Log messages will be transported to console.
   * Additional transport to file in production.
   * @param message
   */
  log(message: any): void {
    this.logger.log('info', message);
  }

  /**
   * Debug messages will be transported to console in development only.
   * @param message
   */
  debug(message: any): void {
    this.logger.log('debug', message);
  }
}
