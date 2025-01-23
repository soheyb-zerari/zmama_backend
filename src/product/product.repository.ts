/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: CreateProductDto) {
    return this.databaseService.product.create({ data: createProductDto });
  }

  findAll() {
    return this.databaseService.product.findMany({});
  }

  async findOne(id: string) {
    return this.databaseService.product.findUnique({ where: { id: id } });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.databaseService.product.update({
      where: { id: id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.product.delete({ where: { id: id } });
  }
}
