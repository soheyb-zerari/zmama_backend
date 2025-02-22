/* eslint-disable prettier/prettier */
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class AiRepository {
  private readonly genAi: GoogleGenerativeAI;
  private readonly geminiModel: GenerativeModel;
  private readonly openai: OpenAI;

  constructor(
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {
    this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.geminiModel = this.genAi.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    this.openai = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: process.env.GIHUB_API_KEY,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!text) throw new Error('Text is required');
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (err) {
      Logger.error(err);
      return null;
    }
  }

  async askGemini(prompt: string) {
    try {
      const extractedProductsResponse =
        await this.geminiModel.generateContent(prompt);
      const extractedProductsText =
        await extractedProductsResponse.response.text();
      if (!extractedProductsText) {
        Logger.warn('No products extracted from the business idea.');
        return null;
      }

      const extractedProducts = extractedProductsText
        .split(';')
        .map((p) => p.trim());
      const similarProductsArray =
        await this.productService.getSimilarProductsBatch(extractedProducts);
      const similarProducts = similarProductsArray.flat();
      const dedupedProducts = similarProducts.filter((product, index, self) => {
        const productId = product._id.toString();
        return index === self.findIndex((p) => p._id.toString() === productId);
      });

      const productsData = dedupedProducts
        .map(
          (p) =>
            `${p.name || ''}: ${p.description || ''} ${p.price || ''} ${p.category || ''}`,
        )
        .join('\n');

      const enhancedPrompt = `
        Business Idea: ${prompt}
        [INTERNAL DATA - DO NOT REPEAT IN FINAL ANSWER]
        Products Data:
          ${productsData}
        [/INTERNAL DATA]

        Using the above internal product data as context along with your own industry knowledge, provide a comprehensive analysis of the business idea. Your response should include:
          - Key insights into the viability of the business idea.
          - A realistic estimation of the total project cost, highlighting major cost drivers.
          - An explanation that supplements the provided product data with your own expertise, if the provided data seems insufficient.

        Do not list or repeat the internal product data in your final answer.
    `;
      const finalResponse =
        await this.geminiModel.generateContent(enhancedPrompt);
      return finalResponse.response.text();
    } catch (err) {
      Logger.error(err);
      return null;
    }
  }
}
