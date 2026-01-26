import ingest from '../services/ingest/index.js';
import store from '../services/store/index.js';

async function main() {
  try {
    await ingest.ingestAll();
    store.closeDb();
    process.exit(0);
  } catch (error) {
    console.error('Ingestion failed:', error);
    store.closeDb();
    process.exit(1);
  }
}

main();
