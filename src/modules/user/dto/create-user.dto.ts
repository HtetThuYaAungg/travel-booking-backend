import { ApiProperty } from '@nestjs/swagger';
import { Status, UserType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';




export class CreateUserDto {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'user123' })
  @IsString()
  @IsNotEmpty()
  staff_id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'securepassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'securepassword' })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.password === o.confirm_password, {
    message: 'Passwords do not match',
  })
  confirm_password: string;

  @ApiProperty({ example: 'Active', enum: Status, default: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ example: 'Maker', enum: UserType, default: UserType.MAKER })
  @IsOptional()
  @IsEnum(UserType)
  user_type: UserType;

  @ApiProperty({ example: 'dept01' })
  @IsString()
  @IsNotEmpty()
  department_code: string;

  @ApiProperty({ example: 'role01' })
  @IsString()
  @IsNotEmpty()
  role_code: string;
}

export class LoginUserDto {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'securepassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}