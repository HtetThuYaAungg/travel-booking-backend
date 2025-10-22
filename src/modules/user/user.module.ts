import { forwardRef, Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleModule } from '../role/role.module';
import { DepartmentModule } from '../department/department.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [forwardRef(() => RoleModule), forwardRef(() => DepartmentModule), PermissionModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
  
export class UserModule {}
