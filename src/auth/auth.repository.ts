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
    await this.databaseService.refreshToken.create({
      data: { token: token, userId: userId, expiresAt: expiresAt },
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

      return await this.databaseService.refreshToken.delete({
        where: {
          id: refreshToken.id,
        },
      });
    } catch (error) {
      console.log(error.message);
    }
  }
}
