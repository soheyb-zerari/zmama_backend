/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { PromptAiDto } from './dto/prompt-ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  askAi(@Body() prompt: PromptAiDto) {
    return this.aiService.askAi(prompt.message);
  }
}
