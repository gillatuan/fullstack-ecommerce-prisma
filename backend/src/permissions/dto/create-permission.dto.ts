import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  module: string;
  @IsNotEmpty()
  method: string;
  @IsNotEmpty()
  apiPath: string;
}
