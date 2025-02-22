/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AiRepository } from 'src/ai/ai.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly aiRepository: AiRepository,
  ) {}

  async getSimilarProduct(query: string) {
    const queryVector = await this.aiRepository.generateEmbedding(query);
    Logger.error('failed to generate embedding of this query: ' + query);
    if (!queryVector) throw new Error('Internal Server Error');
    return this.productRepository.getSimilarProduct(queryVector);
  }

  async getSimilarProductsBatch(productNames: string[]) {
    const queryVectors = await Promise.all(
      productNames.map((name) => this.aiRepository.generateEmbedding(name)),
    );
    return await Promise.all(
      queryVectors.map((vector) =>
        this.productRepository.getSimilarProduct(vector),
      ),
    );
  }

  async create(createProductDto: CreateProductDto) {
    const { name, price, description, category } = createProductDto;
    const dataForEmbedding = `${name || ''} ${description || ''} ${category || ''} ${price || ''}`;
    const productEmbedding =
      await this.aiRepository.generateEmbedding(dataForEmbedding);
    Logger.error(
      'failed to generate embedding of this product: ' + dataForEmbedding,
    );
    if (!productEmbedding) throw new Error('Internal Server Error');
    return this.productRepository.create(createProductDto, productEmbedding);
  }

  findAll() {
    return this.productRepository.findAll();
  }

  findOne(id: string) {
    return this.productRepository.findOne(id);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: string) {
    return this.productRepository.remove(id);
  }
}
