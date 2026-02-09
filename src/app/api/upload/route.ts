import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const uploadSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().max(500).optional(),
    category: z.string().min(2, 'Category must be at least 2 characters').max(50),
    course: z.string().min(2).max(50),
    specialization: z.string().min(1).max(50),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
    let title: string | null = null;
    let category: string | null = null;
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        title = formData.get('title') as string;
        const description = formData.get('description') as string;
        category = formData.get('category') as string;
        const course = formData.get('course') as string;
        const specialization = formData.get('specialization') as string;

        // 1. Validate File existence and basic properties
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only PDF and images are allowed.' }, { status: 400 });
        }

        // 2. Validate metadata with Zod
        const validation = uploadSchema.safeParse({ title, description, category, course, specialization });
        if (!validation.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        // 3. Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        const resource = await prisma.resource.create({
            data: {
                title: validation.data.title,
                description: validation.data.description || '',
                fileName: file.name,
                fileUrl: blob.url,
                fileType: file.type,
                category: validation.data.category,
                course: validation.data.course,
                specialization: validation.data.specialization,
            },
        });

        return NextResponse.json({ success: true, resource });
    } catch (error) {
        console.error('Upload resource error details:', {
            error,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            title,
            category
        });
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
