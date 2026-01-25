import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get('org/:orgId')
    async findAllByOrg(@Param('orgId') orgId: string) {
        return this.coursesService.findAllByOrg(orgId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    @Post()
    @Roles(Role.ORGANIZER, Role.TEACHER)
    async create(@Request() req, @Body() body: any) {
        return this.coursesService.create({
            ...body,
            createdBy: req.user.userId,
        });
    }

    @Post(':id/enroll')
    async enroll(@Param('id') id: string, @Request() req) {
        return this.coursesService.enroll(id, req.user.userId, 'Student');
    }
}
