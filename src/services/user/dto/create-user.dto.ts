import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum, RoleEnum } from '@prisma/client';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
    format: 'email',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'password123',
    description: 'Password for the user account',
    minLength: 6,
  })
  password: string;

  @IsString()
  @ApiProperty({
    example: 'johndoe',
    description: 'Username for the user account',
  })
  username: string;

  @IsEnum(RoleEnum)
  @IsOptional()
  @ApiProperty({
    example: 'USER',
    description: 'Role of the user',
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role?: RoleEnum;

  @IsEnum(GenderEnum)
  @IsOptional()
  @ApiProperty({
    example: 'MALE',
    description: 'Gender of the user',
    enum: GenderEnum,
    default: GenderEnum.UNKNOWN,
  })
  gender?: GenderEnum;
}
