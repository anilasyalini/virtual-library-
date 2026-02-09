const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COURSES = {
    'B.Tech': ['CSE', 'ECE', 'ME', 'CE', 'EE'],
    'MCA': ['Cloud Computing', 'AI', 'Data Science', 'Cyber Security'],
    'M.Tech': ['CSE', 'VLSI', 'Power Systems'],
    'BCA': ['General', 'AI', 'Data Science'],
};

async function main() {
    for (const [courseName, specializations] of Object.entries(COURSES)) {
        const course = await prisma.course.upsert({
            where: { name: courseName },
            update: {},
            create: { name: courseName },
        });

        for (const specName of specializations) {
            await prisma.specialization.upsert({
                where: {
                    name_courseId: {
                        name: specName,
                        courseId: course.id,
                    },
                },
                update: {},
                create: {
                    name: specName,
                    courseId: course.id,
                },
            });
        }
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
