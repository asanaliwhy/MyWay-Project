import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.organization.findMany({
            where: {
                memberships: {
                    some: { userId },
                },
            },
        });
    }

    async create(userId: string, name: string) {
        const org = await this.prisma.organization.create({
            data: {
                name,
                memberships: {
                    create: {
                        userId,
                        role: Role.ORGANIZER,
                    },
                },
            },
        });
        return org;
    }

    async getMembers(orgId: string) {
        return this.prisma.orgMembership.findMany({
            where: { orgId },
            include: { user: true },
        });
    }
}
