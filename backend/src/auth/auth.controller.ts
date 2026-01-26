import type { User } from '@/generated/prisma/client';
import { Controller, Post, Res, UseGuards, Version } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../decorator/current-user.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Version('1')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }
}
