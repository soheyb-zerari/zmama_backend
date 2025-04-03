/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Model } from 'mongoose';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getUniqueCategories(): Promise<string[]> {
    try {
        const categories = await this.productModel.distinct('category').exec();
        return categories.filter(category => category !== null && category !== undefined);
    } catch(err) {
        throw new Error(`err: ${err}`);
        return [];
    }
    
  }

}


