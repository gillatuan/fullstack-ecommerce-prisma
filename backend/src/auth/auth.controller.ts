import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/auth/guards/local-auth.guard';
import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'decorators/current-user.decorator';
import type { Response } from 'express';
import type { AuthLoginResponse } from './types/auth.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser() user: AuthLoginResponse,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @UseGuards(AuthGuard('jwt-refresh')) // Sử dụng strategy refresh vừa tạo
  @Post('refresh')
  async refresh(@CurrentUser() user: any, @Res() res: Response) {
    const userId = user.id;
    const refreshToken = user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken, res);
  }
}
