import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    async findAllByOrg(orgId: string) {
        return this.prisma.course.findMany({
            where: { orgId },
            include: {
                modules: {
                    include: { materials: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: { materials: true },
                },
            },
        });
    }

    async create(data: { orgId: string; code: string; title: string; description: string; createdBy: string }) {
        return this.prisma.course.create({
            data,
        });
    }

    async enroll(courseId: string, userId: string, role: string) {
        return this.prisma.enrollment.create({
            data: {
                courseId,
                userId,
                role,
            },
        });
    }
}
