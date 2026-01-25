import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            orgMemberships: user.memberships.map(m => ({ orgId: m.orgId, role: m.role }))
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                memberships: user.memberships
            }
        };
    }

    async register(data: { email: string; pass: string; name: string }) {
        const existing = await this.usersService.findOne(data.email);
        if (existing) {
            throw new ConflictException('User already exists');
        }

        const passwordHash = await bcrypt.hash(data.pass, 10);
        return this.usersService.create({
            email: data.email,
            passwordHash,
            name: data.name,
        });
    }
}
