/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from 'src/schemas/refreshToken.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}
  async createUser(signupDto: SignupDto) {
    const createdUser = await new this.userModel(signupDto);
    return await createdUser.save();
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async storeRefreshToken(token: string, userId: string, expiresAt: Date) {
    return await this.refreshTokenModel
      .findOneAndUpdate(
        { userId },
        { token, userId, expiresAt },
        { upsert: true, new: true },
      )
      .exec();
  }

  async findAndDeleteRefreshToken(token: string, expiresAt: Date) {
    try {
      const refreshToken = await this.refreshTokenModel
        .findOneAndDelete({
          token,
          expiresAt: { $gt: expiresAt },
        })
        .exec();

      if (!refreshToken) {
        throw new Error('No valid refresh token found.');
      }
      return refreshToken;
    } catch (error) {
      console.log(error.message);
    }
  }
}
