import { Status, User, UserType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  email: string;
  staff_id: string;
  full_name: string;
  user_type: UserType;
  @Exclude()
  password: string;
  status: Status;
  id: string;
  role_id: string;
  department_id: string;
  created_by_id: string | null;
  updated_by_id: string | null;
  deleted_by_id: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
