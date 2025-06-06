import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma;

if (!prisma) {
  throw new Error("Failed to initialize Prisma client");
}

export default prisma;
