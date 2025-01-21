/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  create(createProductDto: Prisma.ProductCreateInput) {
    return this.productRepository.create(createProductDto);
  }

  findAll() {
    return this.productRepository.findAll();
  }

  findOne(id: string) {
    return this.productRepository.findOne(id);
  }

  update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: string) {
    return this.productRepository.remove(id);
  }
}
