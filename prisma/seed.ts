import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123', // In a real app, this would be hashed
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  // Create test chatrooms
  const generalRoom = await prisma.chatroom.create({
    data: {
      title: 'General',
      roomUrl: '696fcd',
      userId: user.id,
    },
  });

  const techRoom = await prisma.chatroom.create({
    data: {
      title: 'Technology',
      roomUrl: '2zjbmc',
      userId: user.id,
    },
  });

  // Create some test messages
  // Create messages with link previews
  await prisma.message.create({
    data: {
      alias: 'Alice',
      message: 'Hello everyone! Welcome to the General chat.',
      chatroomId: generalRoom.id,
    },
  });

  const bobMessage = await prisma.message.create({
    data: {
      alias: 'Bob',
      message: 'Hey Alice! Check out this link https://yapli.chat',
      chatroomId: generalRoom.id,
    },
  });
  
  // Add a link preview to Bob's message
  await prisma.linkPreview.create({
    data: {
      messageId: bobMessage.id,
      url: 'https://yapli.chat',
      title: 'Yapli Chat',
      description: 'A low-friction chat application built with Next.js and Prisma',
      domain: 'yapli.chat',
      siteName: 'Yapli',
    },
  });

  await prisma.message.create({
    data: {
      alias: 'Charlie',
      message: 'Did you see the latest developments in AI?',
      chatroomId: techRoom.id,
    },
  });

  await prisma.message.create({
    data: {
      alias: 'Dana',
      message: 'Yes! The new models are impressive.',
      chatroomId: techRoom.id,
    },
  });

  console.log('Database seeded with test data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });