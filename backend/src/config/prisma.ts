import { PrismaClient } from '@prisma/client';

class DatabaseConnection {
  private static instance: PrismaClient | null = null;
  private static isShuttingDown = false;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      });

      // Handle graceful shutdown
      DatabaseConnection.setupShutdown();
    }
    return DatabaseConnection.instance;
  }

  private static setupShutdown(): void {
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, DatabaseConnection.shutdown);
    });
  }

  private static async shutdown(): Promise<void> {
    if (DatabaseConnection.isShuttingDown) return;
    DatabaseConnection.isShuttingDown = true;

    console.log('Shutting down database connection...');
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
    }
    process.exit(0);
  }
}

export default DatabaseConnection.getInstance();
