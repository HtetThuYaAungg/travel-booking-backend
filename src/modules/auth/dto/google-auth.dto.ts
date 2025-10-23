import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google user ID' })
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @ApiProperty({ description: 'User email from Google' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'User profile picture URL', required: false })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty({ description: 'Google access token' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'Google refresh token', required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class GoogleAuthResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    provider: string;
  };

  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}
