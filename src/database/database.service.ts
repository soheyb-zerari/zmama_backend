/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  constructor(private readonly configService: ConfigService) {}

  getMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get<string>('DATABASE_URL'), // Ensure your .env has this variable
    };
  }
}
