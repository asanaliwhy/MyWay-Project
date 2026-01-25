import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate/:materialId')
    async generate(@Param('materialId') materialId: string, @Request() req) {
        return this.aiService.generateStudyPack(materialId, req.user.userId);
    }

    @Post('tutor')
    async tutor(@Body() body: { courseId: string; query: string }) {
        return this.aiService.tutorChat(body.courseId, body.query);
    }
}
