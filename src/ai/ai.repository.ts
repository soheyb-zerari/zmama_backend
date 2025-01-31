/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiRepository {
    private readonly genAi: GoogleGenerativeAI;
    private readonly model: GenerativeModel;

    constructor() {
        this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async askAi(prompt: string) {
        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            Logger.error(err);
            return null;
        }
    }
}
