import sqlite3 from 'sqlite3';

const verbose = sqlite3.verbose();
export const db = new verbose.Database(':memory:');
