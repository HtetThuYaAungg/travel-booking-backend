import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findUserByEmail(loginUserDto.email);
    await this.userService.verifyPassword(user.password, loginUserDto.password);
    const tokens = await this.userService.generateTokens(user);
    return tokens;
  }

  async validateGoogleUser(googleUserData: GoogleAuthDto): Promise<any> {
    const { googleId, email, firstName, lastName, picture } = googleUserData;

    // Check if user exists with Google ID
    let user = await this.userService.findUserByGoogleId(googleId);

    if (user) {
      // Update user info if needed
      user = await this.userService.updateGoogleUser(user.id, {
        googleId,
        email,
        firstName,
        lastName,
        picture,
      });
    } else {
      // Check if user exists with email
      const existingUser = await this.userService.findUserByGoogleEmail(email);

      if (existingUser) {
        // Link Google account to existing user
        user = await this.userService.updateGoogleUser(existingUser.id, {
          googleId,
          email,
          firstName,
          lastName,
          picture,
        });
      } else {
        // Create new user
        user = await this.userService.createGoogleUser({
          googleId,
          email,
          firstName,
          lastName,
          picture,
        });
      }
    }

    return user;
  }

  async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.userService.generateTokens(user);
  }
}
