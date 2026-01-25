import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
    constructor(private prisma: PrismaService) { }

    async generateStudyPack(materialId: string, userId: string) {
        const material = await this.prisma.material.findUnique({ where: { id: materialId } });
        if (!material) throw new Error('Material not found');

        // MOCK: In production, this would call OpenAI/Gemini
        const studyPack = await this.prisma.studyPack.create({
            data: {
                materialId,
                createdBy: userId,
                status: 'GENERATED',
                publishedAt: new Date(),
                summary: {
                    create: {
                        content: {
                            bullets: ['Key concept 1', 'Key concept 2'],
                            summary: 'This is a mocked AI summary of the content.',
                        },
                    },
                },
                quizzes: {
                    create: {
                        metadata: { difficulty: 'Medium' },
                        questions: {
                            create: [
                                {
                                    type: 'MCQ',
                                    prompt: 'What is the primary topic?',
                                    options: ['Topic A', 'Topic B', 'Topic C'],
                                    answerKey: 'Topic A',
                                    explanation: 'Topic A is explained in section 1.',
                                },
                            ],
                        },
                    },
                },
                flashcards: {
                    create: [
                        { front: 'Question 1', back: 'Answer 1' },
                        { front: 'Question 2', back: 'Answer 2' },
                    ],
                },
            },
        });

        return studyPack;
    }

    async tutorChat(courseId: string, query: string) {
        // MOCK: RAG logic
        return {
            answer: "I am your AI tutor. Based on the course materials, the answer to your query is...",
            sourceReferences: ['Module 1, Lesson 2'],
        };
    }
}
