import { Role, Status } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { Exclude } from 'class-transformer';

export class RoleEntity implements Role {
  id: string;
  role_code: string;
  role_name: string;
  permissions: JsonValue;
  created_by_id: string | null;
  updated_by_id: string | null;
  @Exclude()
  deleted_by_id: string | null;
  status: Status;
  created_at: Date;
  updated_at: Date;
  @Exclude()
  deleted_at: Date | null;

  constructor(partial: Partial<RoleEntity>) {
    Object.assign(this, partial);
  }
}
