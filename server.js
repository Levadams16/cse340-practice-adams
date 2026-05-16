import { fileURLToPath } from 'url';
import path from 'path';
import { facultyListPage, facultyDetailPage } from './src/controllers/faculty/faculty.js';

import express from 'express';

const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

const name = process.env.NAME; // <-- NEW

const app = express();
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

/**
 * Routes
 */

app.get("/", (req, res) => {
  res.render("home", { title: "Welcome Home" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About Me" });
});

app.get("/products", (req, res) => {
  res.render("products", { title: "Our Products" });
});

app.get("/student", (req, res) => {
  const student = {
    name: "Levi Adams",
    id: "12345",
    email: "levi@example.com",
    address: "Boise, Idaho"
  };

  res.render("student", student);
});

app.get('/faculty', facultyListPage);
app.get('/faculty/:facultyId', facultyDetailPage);