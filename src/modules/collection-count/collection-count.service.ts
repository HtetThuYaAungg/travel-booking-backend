import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class CollectionCountService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAllCounts() {
    const [roles, departments, users] = await Promise.all([
      this.prisma.role.count(),
      this.prisma.department.count(),
      this.prisma.user.count({
        where: {
          status: Status.ACTIVE,
        },
      }),
    ]);

    return {
      roles,
      departments,
      users,
    };
  }
}