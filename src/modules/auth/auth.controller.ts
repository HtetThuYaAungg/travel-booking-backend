import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
  })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{}> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);
    const envMode = process.env.NODE_ENV?.trim();

    res.cookie(`access_token_${envMode}`, accessToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? '.example.com' : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.cookie(`refresh_token_${envMode}`, refreshToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? '.example.com' : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    return { message: 'User logged in successfully' };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const envMode = process.env.NODE_ENV?.trim();

    res.clearCookie(`access_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? '.example.com' : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.clearCookie(`refresh_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? '.example.com' : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    return { message: 'User logged out successfully' };
  }
}
