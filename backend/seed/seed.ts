import { disconnectSeedClient, runSeed } from './runSeed';

runSeed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectSeedClient();
  });
