/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  async createUser(signupDto: SignupDto) {
    return await this.databaseService.user.create({ data: signupDto });
  }

  async findByEmail(email: string) {
    return await this.databaseService.user.findUnique({
      where: { email: email },
    });
  }

  async storeRefreshToken(token: string, userId: string, expiresAt: Date) {
    await this.databaseService.refreshToken.upsert({
      where: { userId: userId },
      create: { token: token, userId: userId, expiresAt: expiresAt },
      update: { token: token, userId: userId, expiresAt: expiresAt },
    });
  }

  async findAndDeleteRefreshToken(token: string, expiresAt: Date) {
    try {
      const refreshToken = await this.databaseService.refreshToken.findUnique({
        where: { token: token, expiresAt: { gt: expiresAt } },
      });

      if (!refreshToken) {
        throw new Error(`No valid refresh token found.`);
      }

      return refreshToken;
    } catch (error) {
      console.log(error.message);
    }
  }
}
