import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscussionsService {
    constructor(private prisma: PrismaService) { }

    async findAllByCourse(courseId: string) {
        return this.prisma.thread.findMany({
            where: { courseId },
            include: {
                creator: true,
                replies: { include: { creator: true } },
            },
        });
    }

    async createThread(courseId: string, userId: string, title: string, body: string) {
        return this.prisma.thread.create({
            data: {
                courseId,
                createdBy: userId,
                title,
                body,
            },
        });
    }

    async reply(threadId: string, userId: string, body: string) {
        return this.prisma.reply.create({
            data: {
                threadId,
                createdBy: userId,
                body,
            },
        });
    }
}
