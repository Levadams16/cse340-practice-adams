import db from './db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedDatabase = async () => {
    try {
        // Always run practice.sql to ensure tables exist
        const practicePath = join(__dirname, 'sql', 'practice.sql');
        if (fs.existsSync(practicePath)) {
            const practiceSQL = fs.readFileSync(practicePath, 'utf8');
            await db.query(practiceSQL);
            console.log('Practice database tables initialized');
        }

        // Run seed.sql to ensure core tables exist
        const seedPath = join(__dirname, 'sql', 'seed.sql');
        if (fs.existsSync(seedPath)) {
            const seedSQL = fs.readFileSync(seedPath, 'utf8');
            await db.query(seedSQL);
            console.log('Database seeded successfully');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

export default seedDatabase;