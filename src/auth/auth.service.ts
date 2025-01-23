/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}
  async signup(signupDto: SignupDto) {
    const emailInUse = await this.authRepository.findByEmail(signupDto.email);
    if (emailInUse) throw new BadRequestException('email already in use');

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    signupDto.password = hashedPassword;

    return await this.authRepository.createUser(signupDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.authRepository.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('wrong credentials');

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) throw new UnauthorizedException('wrong credentials');

    return this.generateUserTokens(user.id);
  }

  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    await this.authRepository.storeRefreshToken(
      refreshToken,
      userId,
      expiresAt,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const expiresAt = new Date();
    const refreshTokenData =
      await this.authRepository.findAndDeleteRefreshToken(
        refreshToken,
        expiresAt,
      );
    if (!refreshTokenData)
      throw new UnauthorizedException('refresh token is invalid');

    return this.generateUserTokens(refreshTokenData.userId);
  }
}
