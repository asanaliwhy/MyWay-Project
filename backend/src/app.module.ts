import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CoursesModule } from './courses/courses.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { DiscussionsModule } from './discussions/discussions.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, OrganizationsModule, CoursesModule, AnalyticsModule, AiModule, AssignmentsModule, DiscussionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
