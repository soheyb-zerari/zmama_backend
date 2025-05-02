/* eslint-disable prettier/prettier */
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { AzureOpenAI } from 'openai';
import { ProductService } from 'src/product/product.service';
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";


@Injectable()
export class AiRepository {
  private readonly genAi: GoogleGenerativeAI;
  private readonly geminiModel: GenerativeModel;
  private readonly openai: AzureOpenAI;
  private readonly options: {
    apiKey: string;
    endpoint: string;
    apiVersion: string;
    deployment: string;
   
  };
  private readonly credential = new DefaultAzureCredential();
  private readonly scope = "https://cognitiveservices.azure.com/.default";
  

  constructor(
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {
    this.genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.geminiModel = this.genAi.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
     
    const apiVersion = "2024-04-01-preview";
    const deployment = "text-embedding-3-small";
    const azureADTokenProvider = getBearerTokenProvider(this.credential, this.scope);
    this.options = {
      apiKey: process.env.GIHUB_API_KEY,
      
      endpoint: 'https://openaizmama.openai.azure.com/',
      apiVersion,
      deployment,
    
    };
    this.openai = new AzureOpenAI(
      this.options
    );
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

      return err;
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
