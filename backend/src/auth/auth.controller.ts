import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/auth/guards/local-auth.guard';
import { Controller, Post, Res, UseGuards, Version } from '@nestjs/common';
import { CurrentUser } from 'decorators/current-user.decorator';
import type { Response } from 'express';
import type { AuthLoginResponse } from "./types/auth.type";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Version('1')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser() user: AuthLoginResponse,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }
}
