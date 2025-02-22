/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
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

  async create(createProductDto: CreateProductDto) {
    const { name, price, description, category } = createProductDto;
    const dataForEmbedding = `${name || ''} ${description || ''} ${category || ''} ${price || ''}`;
    const productEmbedding =
      await this.aiRepository.generateEmbedding(dataForEmbedding);
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
