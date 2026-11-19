let PrismaClient: any;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  // In test environments the client may not be generated; fall back to a noop object which tests can mock
  PrismaClient = null;
}

declare global {
  namespace NodeJS {
    interface Global {}
  }
}

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: any;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const isTest = process.env.NODE_ENV === 'test';
const prisma = global.prisma || (PrismaClient && !isTest ? new PrismaClient() : {});

if (!isTest && process.env.NODE_ENV === 'development' && PrismaClient) {
  global.prisma = prisma;
}

export default prisma;
