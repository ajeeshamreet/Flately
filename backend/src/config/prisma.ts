import { PrismaClient } from '@prisma/client';

class DatabaseConnection {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient();
    }
    return DatabaseConnection.instance;
  }
}

export default DatabaseConnection.getInstance();
