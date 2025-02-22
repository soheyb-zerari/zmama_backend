/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async askAi(prompt: string) {
    const extractionPrompt = `From the following business idea, list the essential products or materials required to start: "${prompt}". Only list the products divided by semicolon and use it only for separation, nothing else.`;
    const geminiResponse = await this.aiRepository.askGemini(extractionPrompt);
    if (!geminiResponse) return null;
    return geminiResponse;
  }
}
