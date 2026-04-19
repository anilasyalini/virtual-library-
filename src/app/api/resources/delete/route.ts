import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { del } from '@vercel/blob';

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
        }

        // Find the resource first to get the file URL
        const resource = await prisma.resource.findUnique({ where: { id } });

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // Delete the file from Vercel Blob if it's a blob URL
        if (resource.fileUrl && resource.fileUrl.includes('blob.vercel-storage.com')) {
            try {
                await del(resource.fileUrl);
            } catch (blobErr) {
                console.error('Failed to delete blob file:', blobErr);
                // Continue with DB deletion even if blob delete fails
            }
        }

        // Delete the resource from the database
        await prisma.resource.delete({ where: { id } });

        return NextResponse.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Delete resource error:', error);
        return NextResponse.json(
            { error: 'Failed to delete resource', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
