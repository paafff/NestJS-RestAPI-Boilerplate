import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 201, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Request() req) {
    console.log('🚀 ~ AuthController ~ login ~ req:', req);
    return await this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateUserDto })
  async registerUser(@Body() userCreateArgs: CreateUserDto) {
    return await this.userService.createOne(userCreateArgs);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 201, description: 'Token successfully refreshed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshToken(@Request() req) {
    console.log('🚀 ~ AuthController ~ refreshToken ~ req:', req);
    return this.authService.refreshToken(req.user);
  }
}
