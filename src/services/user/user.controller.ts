import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  async findMany() {
    return await this.userService.findMany();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user' })
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user' })
  @ApiBody({ type: UpdateUserDto })
  async updateOne(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateOne(id, data);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateUserDto })
  async createOne(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createOne(createUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user' })
  async deleteOne(@Param('id') id: string): Promise<User> {
    return this.userService.deleteOne(id);
  }
}
