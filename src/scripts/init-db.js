import store from '../services/store/index.js';

console.log('Initializing database...');
store.initDb();
console.log('Database initialized successfully!');
store.closeDb();
