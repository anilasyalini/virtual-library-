import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                specializations: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { type, name, courseId } = await request.json();

        if (type === 'course') {
            const course = await prisma.course.create({
                data: { name },
            });
            return NextResponse.json(course);
        } else if (type === 'specialization') {
            const specialization = await prisma.specialization.create({
                data: {
                    name,
                    courseId,
                },
            });
            return NextResponse.json(specialization);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}
