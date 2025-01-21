/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: Prisma.ProductCreateInput) {
    return this.databaseService.product.create({ data: createProductDto });
  }

  findAll() {
    return this.databaseService.product.findMany({});
  }

  async findOne(id: string) {
    return this.databaseService.product.findUnique({ where: { id: id } });
  }

  async update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    return this.databaseService.product.update({
      where: { id: id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.product.delete({ where: { id: id } });
  }
}
