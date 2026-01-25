import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Get()
    async findAll(@Request() req) {
        return this.organizationsService.findAll(req.user.userId);
    }

    @Post()
    async create(@Request() req, @Body() body: { name: string }) {
        return this.organizationsService.create(req.user.userId, body.name);
    }
}
