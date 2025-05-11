/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { PromptAiDto } from './dto/prompt-ai.dto';
import { log } from 'console';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("ask")
  askAi(@Body() prompt: PromptAiDto) {
    console.log("askAi called with prompt:", prompt);
    return this.aiService.askAi(prompt.message); // Assuming 'text' is the string property in PromptAiDto
  }
}
