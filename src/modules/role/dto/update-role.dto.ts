import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateRoleDto } from "./create-role.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @IsOptional()
    @IsString()
    id?: string;
}