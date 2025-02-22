const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite ডাটাবেস কানেকশন
const db = new sqlite3.Database('./database.db');

// সেশন সেটআপ
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// মিডলওয়্যার
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// প্রোডাক্ট এবং ক্যাটাগরি টেবিল তৈরি করুন
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL,
            description TEXT,
            category_id INTEGER,
            image TEXT,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);
});

// রুটস
app.get('/', async (req, res) => {
    const categories = await getCategories();
    res.render('index', { categories, user: req.session.user });
});

app.get('/admin', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const categories = await getCategories();
    res.render('admin', { categories });
});

app.post('/admin/add-category', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO categories (name) VALUES (?)', [name], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/admin');
        }
    });
});

app.post('/admin/add-product', (req, res) => {
    const { name, price, description, category_id, image } = req.body;
    db.run(
        'INSERT INTO products (name, price, description, category_id, image) VALUES (?, ?, ?, ?, ?)',
        [name, price, description, category_id, image],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/');
            }
        }
    );
});

app.get('/category/:id', async (req, res) => {
    const categoryId = req.params.id;
    const products = await getProductsByCategory(categoryId);
    const categories = await getCategories();
    res.render('category', { products, categories, user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.send('Invalid username or password');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// হেল্পার ফাংশন
function getCategories() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM categories', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getProductsByCategory(categoryId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products WHERE category_id = ?', [categoryId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// সার্ভার শুরু করুন
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
