/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Model } from 'mongoose';
import { AiRepository } from 'src/ai/ai.repository';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly aiRepository: AiRepository,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { name, price, description, category } = createProductDto;
    const dataForEmbedding = `${name || ''} ${description || ''} ${category || ''} ${price || ''}`;
    const productEmbedding =
      await this.aiRepository.generateEmbedding(dataForEmbedding);
    const productDb = { ...createProductDto, embedding: productEmbedding };
    const createdProduct = await new this.productModel(productDb);
    return createdProduct.save();
  }

  async findAll() {
    return await this.productModel.find().exec();
  }

  async findOne(id: string) {
    return await this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return await this.productModel.findByIdAndDelete(id).exec();
  }
}
