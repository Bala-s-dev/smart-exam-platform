import { PrismaClient, Role, Difficulty, QuestionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Clean up existing data
  await prisma.answer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.examTopic.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash the password correctly
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@edtech.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const instructor = await prisma.user.create({
    data: {
      name: 'Dr. Instructor',
      email: 'instructor@edtech.com',
      password: passwordHash,
      role: Role.INSTRUCTOR,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Jane Student',
      email: 'student@edtech.com',
      password: passwordHash,
      role: Role.STUDENT,
    },
  });

  // 4. Create Topics
  const topicReact = await prisma.topic.create({ data: { name: 'React.js' } });
  const topicNode = await prisma.topic.create({ data: { name: 'Node.js' } });
  const topicCyber = await prisma.topic.create({
    data: { name: 'Cybersecurity' },
  });

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
