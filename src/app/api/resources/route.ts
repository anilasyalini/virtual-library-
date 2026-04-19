import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    let query: string | null = null;
    let category: string | null = null;
    try {
        const { searchParams } = new URL(request.url);
        query = searchParams.get('q');
        category = searchParams.get('category');
        const course = searchParams.get('course');
        const specialization = searchParams.get('specialization');
        const dateRange = searchParams.get('dateRange');
        const starred = searchParams.get('starred') === 'true';
        const userId = searchParams.get('userId'); // pass userId from frontend for starred queries
        const fileType = searchParams.get('fileType');

        console.log('API FETCH: Started fetching resources', { query, category, course, specialization, dateRange, starred, userId, fileType });

        // Validate database connection check (optional but helpful)
        if (!prisma) {
            throw new Error('Database client not initialized');
        }

        let dateFilter = {};
        if (dateRange === 'today') {
            dateFilter = { createdAt: { gte: new Date(Date.now() - 86400000) } };
        } else if (dateRange === '7days') {
            dateFilter = { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } };
        } else if (dateRange === '30days') {
            dateFilter = { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } };
        } else if (dateRange === 'year') {
            dateFilter = { createdAt: { gte: new Date(Date.now() - 365 * 86400000) } };
        }

        let fileTypeFilter = {};
        if (fileType) {
            const types = fileType.split(',');
            fileTypeFilter = {
                OR: types.map(t => ({ fileType: { contains: t, mode: 'insensitive' as any } }))
            };
        }

        const resources = await prisma.resource.findMany({
            where: {
                AND: [
                    query ? {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' as any } },
                            { description: { contains: query, mode: 'insensitive' as any } },
                        ],
                    } : {},
                    category && category !== 'All' ? { category: category } : {},
                    course && course !== 'All' ? { course: course } : {},
                    specialization && specialization !== 'All' ? { specialization: specialization } : {},
                    dateFilter,
                    fileTypeFilter,
                    starred && userId ? { starredBy: { some: { id: userId } } } : {}
                ],
            },
            include: {
                starredBy: {
                    select: { id: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log(`API FETCH: Successfully retrieved ${resources.length} resources`);
        return NextResponse.json(resources);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('API FETCH ERROR:', {
            errorMsg,
            stack: error instanceof Error ? error.stack : undefined,
            query,
            category
        });

        return NextResponse.json({
            error: 'Database Service Error',
            message: errorMsg,
            details: 'This could be due to a database connection issue or an outdated Prisma client. Please check server logs for more details.'
        }, { status: 500 });
    }
}
