/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiRepository],
})
export class AiModule {}
