import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { Public } from 'src/common/decorators/public';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthResponseDto } from './dto/google-auth.dto';

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
      domain:
        envMode === 'production'
          ? process.env.FRONTEND_PORTAL_PROD_URL
          : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.cookie(`refresh_token_${envMode}`, refreshToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain:
        envMode === 'production'
          ? process.env.FRONTEND_PORTAL_PROD_URL
          : undefined,
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
      domain:
        envMode === 'production'
          ? process.env.FRONTEND_PORTAL_PROD_URL
          : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.clearCookie(`refresh_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain:
        envMode === 'production'
          ? process.env.FRONTEND_PORTAL_PROD_URL
          : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    return { message: 'User logged out successfully' };
  }

  @Public()
  @Post('logout-google')
  @ApiOperation({ summary: 'Logout user from Google' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out from Google successfully',
  })
  async logoutGoogle(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const envMode = process.env.NODE_ENV?.trim();

    res.clearCookie(`access_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain:
        envMode === 'production'
          ? process.env.FRONTEND_PUBLIC_PROD_URL
          : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.clearCookie(`refresh_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain:
        envMode === 'production'
          ? process.env.FRONTEND_PUBLIC_PROD_URL
          : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    return { message: 'User logged out from Google successfully' };
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Redirects to Google OAuth',
  })
  async googleAuth(@Req() req: Request) {
    // This endpoint initiates the Google OAuth flow
    // The user will be redirected to Google for authentication
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Google OAuth callback processed',
  })
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const user = req.user as any;
      const tokens = await this.authService.generateTokens(user);

      const envMode = process.env.NODE_ENV?.trim();
      const frontendUrl = process.env.FRONTEND_URL as string;

      // Set authentication cookies
      res.cookie(`access_token_${envMode}`, tokens.accessToken, {
        httpOnly: true,
        secure: envMode === 'production',
        domain:
          envMode === 'production'
            ? process.env.FRONTEND_PUBLIC_PROD_URL
            : undefined,
        sameSite: envMode === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie(`refresh_token_${envMode}`, tokens.refreshToken, {
        httpOnly: true,
        secure: envMode === 'production',
        domain:
          envMode === 'production'
            ? process.env.FRONTEND_PUBLIC_PROD_URL
            : undefined,
        sameSite: envMode === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend with success status
      res.redirect(`${frontendUrl}`);
      return { message: 'Authentication successful', user: user } as any;
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL as string;
      res.redirect(`${frontendUrl}`);
      return { message: 'Authentication failed', error: error } as any;
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile',
  })
  async getCurrentUser(@Req() req: Request): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = req.user as any;
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      provider: user.provider,
      role: user.role,
      department: user.department,
    };
  }
}
