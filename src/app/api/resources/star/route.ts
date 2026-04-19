import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resourceId, userId, action } = body;

        if (!resourceId || !userId || !['star', 'unstar'].includes(action)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        if (action === 'star') {
            await prisma.resource.update({
                where: { id: resourceId },
                data: {
                    starredBy: {
                        connect: { id: userId }
                    }
                }
            });
        } else {
            await prisma.resource.update({
                where: { id: resourceId },
                data: {
                    starredBy: {
                        disconnect: { id: userId }
                    }
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API STAR ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
