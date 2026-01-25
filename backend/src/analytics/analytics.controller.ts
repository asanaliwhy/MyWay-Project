import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('me')
    async getStudentMastery(@Request() req) {
        return this.analyticsService.getStudentMastery(req.user.userId);
    }

    @Get('teacher/:courseId')
    @Roles(Role.TEACHER, Role.ORGANIZER)
    async getTeacherCohort(@Param('courseId') courseId: string) {
        return this.analyticsService.getTeacherCohort(courseId);
    }

    @Get('org/:orgId')
    @Roles(Role.ORGANIZER)
    async getOrgMetrics(@Param('orgId') orgId: string) {
        return this.analyticsService.getOrgMetrics(orgId);
    }
}
