/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async askAi(prompt: string) {
    const o3Response = await this.aiRepository.askO3Mini(prompt);
    if (o3Response) return o3Response;

    const o1Response = await this.aiRepository.askO1(prompt);
    if (o1Response) return o1Response;

    const llamaResponse = await this.aiRepository.askLlama(prompt);
    if (llamaResponse) return llamaResponse;

    const mixtralResponse = await this.aiRepository.askMixtral(prompt);
    if (mixtralResponse) return mixtralResponse;

    const geminiResponse = await this.aiRepository.askGemini(prompt);
    if (!geminiResponse) return null;
    return geminiResponse;
  }
}
