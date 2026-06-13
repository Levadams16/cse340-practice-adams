import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { caCert } from './src/models/db.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';
import { addLocalVariables } from './src/middleware/global.js';
import router from './src/controllers/routes.js';
import seedDatabase from './src/models/setup.js';

import { fileURLToPath } from 'url';
import path from 'path';

import express from 'express';

import flash from './src/middleware/flash.js';

const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

const name = process.env.NAME; // <-- NEW

const app = express();

// Initialize PostgreSQL session store
const pgSession = connectPgSimple(session);

// Configure session middleware
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV.includes('dev') !== true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Start automatic session cleanup
startSessionCleanup();

// Seed the database
seedDatabase();

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Global middleware (sets res.locals variables)
app.use(addLocalVariables);

// Flash message middleware (must come after session and global middleware)
app.use(flash);

// All routes from routes.js
app.use(router);