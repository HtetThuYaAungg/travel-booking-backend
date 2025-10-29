import { PartialType } from '@nestjs/swagger';
import { CreateFlightDto } from './create-flight.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFlightDto extends PartialType(CreateFlightDto) {
    @IsOptional()
    @IsString()
    id?: string;
}
