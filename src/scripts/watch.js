import watcher from '../services/watcher/index.js';
import store from '../services/store/index.js';

async function main() {
  try {
    store.initDb();

    const args = process.argv.slice(2);
    const useSimulated = args.includes('--simulated') || args.includes('-s');

    console.log('Starting provider update watcher...');
    console.log(`Mode: ${useSimulated ? 'Simulated' : 'Live'}\n`);

    const updates = await watcher.fetchAllUpdates({ useSimulated });

    if (updates.length > 0) {
      console.log('\nNew updates:');
      updates.forEach(u => {
        console.log(`  - [${u.provider}] ${u.title}`);
      });
    }

    store.closeDb();
    process.exit(0);
  } catch (error) {
    console.error('Watcher failed:', error);
    store.closeDb();
    process.exit(1);
  }
}

main();
