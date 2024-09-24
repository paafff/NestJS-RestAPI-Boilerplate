import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum, RoleEnum } from '@prisma/client';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
    format: 'email',
    required: false,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'password123',
    description: 'Password for the user account',
    minLength: 6,
    required: false,
  })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'johndoe',
    description: 'Username for the user account',
    required: false,
  })
  username?: string;

  @IsOptional()
  @IsEnum(RoleEnum)
  @ApiProperty({
    example: 'USER',
    description: 'Role of the user',
    enum: RoleEnum,
    required: false,
  })
  role?: RoleEnum;

  @IsOptional()
  @IsEnum(GenderEnum)
  @ApiProperty({
    example: 'MALE',
    description: 'Gender of the user',
    enum: GenderEnum,
    required: false,
  })
  gender?: GenderEnum;
}
