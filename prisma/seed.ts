import { PrismaClient, Role, Difficulty } from '@prisma/client';
// In a real app, use bcrypt to hash passwords.
// For seeding simplicity, we simulate a hash or you can install bcryptjs.
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

  // 2. Create Users
  // Note: Password should be hashed in real implementation.
  // Assuming 'password123' hashed string for demo.
  const passwordHash = '$2b$10$EpRnTzVlqHNP0.fKbXTnLOsyteAs.x.k.r/..f.e/..s';

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

  // 3. Create Topics
  const topicReact = await prisma.topic.create({ data: { name: 'React.js' } });
  const topicNode = await prisma.topic.create({ data: { name: 'Node.js' } });

  // 4. Create an Exam
  const exam = await prisma.exam.create({
    data: {
      title: 'Fullstack Basics',
      description: 'Test your knowledge on React and Node.',
      instructorId: instructor.id,
      durationMinutes: 45,
      isPublished: true,
      topics: {
        create: [{ topicId: topicReact.id }, { topicId: topicNode.id }],
      },
    },
  });

  // 5. Add Questions
  await prisma.question.createMany({
    data: [
      {
        examId: exam.id,
        text: 'What is a React Hook?',
        difficulty: Difficulty.EASY,
        options: [
          { text: 'A fishing tool', isCorrect: false },
          {
            text: 'A function to use state in functional components',
            isCorrect: true,
          },
          { text: 'A class method', isCorrect: false },
          { text: 'A database connector', isCorrect: false },
        ],
        explanation:
          'Hooks allow functional components to have state and lifecycle features.',
      },
      {
        examId: exam.id,
        text: 'Which module handles file paths in Node.js?',
        difficulty: Difficulty.MEDIUM,
        options: [
          { text: 'fs', isCorrect: false },
          { text: 'path', isCorrect: true },
          { text: 'http', isCorrect: false },
          { text: 'os', isCorrect: false },
        ],
        explanation:
          'The path module provides utilities for working with file and directory paths.',
      },
    ],
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
