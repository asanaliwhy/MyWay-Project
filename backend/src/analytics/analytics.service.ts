import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getStudentMastery(userId: string) {
        const attempts = await this.prisma.quizAttempt.findMany({
            where: { userId },
            include: { quiz: true },
        });

        const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
        const avgScore = attempts.length > 0 ? totalScore / attempts.length : 0;

        return {
            avgScore,
            totalAttempts: attempts.length,
            recentAttempts: attempts.slice(-5),
        };
    }

    async getTeacherCohort(courseId: string) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseId },
            include: { user: { include: { quizAttempts: true } } },
        });

        const atRisk = enrollments.filter((e) => {
            const avg = e.user.quizAttempts.length > 0
                ? e.user.quizAttempts.reduce((a, b) => a + b.score, 0) / e.user.quizAttempts.length
                : 0;
            return avg < 60; // Threshold for at-risk
        });

        return {
            totalStudents: enrollments.length,
            atRiskCount: atRisk.length,
            cohortAvgScore: 75, // Placeholder for aggregation
        };
    }

    async getOrgMetrics(orgId: string) {
        const members = await this.prisma.orgMembership.count({ where: { orgId } });
        const courses = await this.prisma.course.count({ where: { orgId } });

        return {
            dau: 12, // Placeholder
            wau: 45, // Placeholder
            totalMembers: members,
            totalCourses: courses,
            activationRate: 0.85,
        };
    }
}
