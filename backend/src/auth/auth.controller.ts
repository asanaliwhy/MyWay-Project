import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: { email: string; pass: string; name: string }) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: { email: string; pass: string }) {
        const user = await this.authService.validateUser(body.email, body.pass);
        if (!user) {
            throw new Error('Invalid credentials'); // Use proper UnauthorizedException in real build
        }
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
