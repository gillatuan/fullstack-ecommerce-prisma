import { Injectable } from '@nestjs/common';
import { Prisma } from "generated/prisma/client";

@Injectable()
export class PostsService {
  create(createPostDto: Prisma.PostCreateInput) {
    return 'This action adds a new post';
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: Prisma.PostUpdateInput) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
