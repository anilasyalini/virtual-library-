const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test' + Math.random() + '@example.com',
                password: 'password123',
                role: 'STUDENT'
            }
        });
        console.log('User created:', user);
    } catch (e) {
        console.error('Full Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
