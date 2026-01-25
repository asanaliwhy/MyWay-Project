import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                memberships: {
                    include: { organization: true },
                },
            },
        });
    }

    async create(data: { email: string; passwordHash: string; name: string }) {
        return this.prisma.user.create({
            data,
        });
    }

    async getUsersInOrg(orgId: string) {
        return this.prisma.user.findMany({
            where: {
                memberships: {
                    some: { orgId },
                },
            },
        });
    }
}
