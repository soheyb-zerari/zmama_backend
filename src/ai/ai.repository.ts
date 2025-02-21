/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

@Injectable()
export class AiRepository {
  private readonly genAi: GoogleGenerativeAI;
  private readonly geminiModel: GenerativeModel;
  private readonly groq: Groq;
  private readonly openai: OpenAI;
  private readonly deepSeek: ReturnType<typeof ModelClient>;

  constructor() {
    this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.geminiModel = this.genAi.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.openai = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: process.env.GIHUB_API_KEY,
    });
    this.deepSeek = ModelClient(
      'https://models.inference.ai.azure.com',
      new AzureKeyCredential(process.env.GIHUB_API_KEY),
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  async askO1(prompt: string) {
    try {
      const response = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'o1',
      });

      return response.choices[0].message.content;
    } catch (err) {
      Logger.error(err);
      return null;
    }
  }

  async askO3Mini(prompt: string) {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'o3-mini',
      });

      return completion.choices[0].message.content || null;
    } catch (err) {
      Logger.error(err);
      return null;
    }
  }

  async askGemini(prompt: string) {
    try {
      const result = await this.geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      Logger.error(err);
      return null;
    }
  }

  async askGroq(prompt: string, model: string) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: model,
      });

      return (await completion.choices[0]?.message?.content) || null;
    } catch (err) {
      Logger.error(err);
      return null;
    }
  }

  async askLlama(prompt: string) {
    const model = 'llama-3.3-70b-versatile';
    return await this.askGroq(prompt, model);
  }

  async askMixtral(prompt: string) {
    const model = 'mixtral-8x7b-32768';
    return await this.askGroq(prompt, model);
  }
}
