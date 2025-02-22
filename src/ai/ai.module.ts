/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [forwardRef(() => ProductModule)],
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiRepository],
})
export class AiModule {}
