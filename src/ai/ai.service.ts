/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async askAi(prompt: string) {
    const response = await this.aiRepository.askAi(prompt);
    if (!response) throw new Error('No response from AI'); 
    return response;
  }
}
