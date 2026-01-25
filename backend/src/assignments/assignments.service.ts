import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) { }

    async findAllByCourse(courseId: string) {
        return this.prisma.assignment.findMany({
            where: { courseId },
            include: { submissions: true },
        });
    }

    async submit(assignmentId: string, userId: string, fileUrl: string) {
        return this.prisma.submission.create({
            data: {
                assignmentId,
                userId,
                status: 'SUBMITTED',
                fileUrl,
            },
        });
    }

    async grade(submissionId: string, grade: string, feedback: string) {
        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: 'GRADED',
                grade,
                feedback,
            },
        });
    }
}
