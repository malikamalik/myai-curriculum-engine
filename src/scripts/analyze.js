import analyzer from '../services/analyzer/index.js';
import store from '../services/store/index.js';

async function main() {
  try {
    store.initDb();

    console.log('Analyzing unprocessed updates...\n');

    const reports = await analyzer.analyzeAllUnprocessed();

    if (reports.length > 0) {
      console.log('\nGenerated impact reports:');
      reports.forEach(r => {
        console.log(`  - [${r.severity}] ${r.provider}: ${r.recommended_action}`);
        console.log(`    Affected lessons: ${r.affected_lessons.length}`);
      });
    } else {
      console.log('No unprocessed updates to analyze.');
    }

    // Show stats
    const stats = analyzer.getStats();
    console.log('\nCurrent stats:');
    console.log(`  Total reports: ${stats.total}`);
    console.log(`  By status: new=${stats.by_status.new}, approved=${stats.by_status.approved}, rejected=${stats.by_status.rejected}`);

    store.closeDb();
    process.exit(0);
  } catch (error) {
    console.error('Analysis failed:', error);
    store.closeDb();
    process.exit(1);
  }
}

main();
