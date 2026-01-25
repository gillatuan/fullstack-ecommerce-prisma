import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersLetterDto } from './create-users_letter.dto';

export class UpdateUsersLetterDto extends PartialType(CreateUsersLetterDto) {}
