import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [forwardRef(() => UserModule), PermissionModule],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
