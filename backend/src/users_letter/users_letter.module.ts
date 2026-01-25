import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersLetterController } from './users_letter.controller';
import { UsersLetterService } from './users_letter.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersLetterController],
  providers: [UsersLetterService],
})
export class UsersLetterModule {}
