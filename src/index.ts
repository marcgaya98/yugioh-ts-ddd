import app from './app';
import { authenticateDatabase } from './infrastructure/config/database.config';

const DEFAULT_PORT = 3001;

async function bootstrapServer(): Promise<void> {
  const port = Number(process.env.PORT || DEFAULT_PORT);

  await authenticateDatabase();
  app.listen(port, (error?: Error) => {
    if (error) {
      console.error(`Failed to bind server on port ${port}:`, error.message);
      process.exit(1);
    }
    console.log(`Server running on port ${port}`);
  });
}

if (require.main === module) {
  bootstrapServer().catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
}

export default app;
