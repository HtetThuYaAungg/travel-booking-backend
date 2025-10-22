import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    ) { }
    
async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await this.userService.findUserByEmail(loginUserDto.email);
  await this.userService.verifyPassword(user.password, loginUserDto.password);
  const tokens = await this.userService.generateTokens(user); 
  return tokens;
}
}
