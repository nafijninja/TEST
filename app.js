// app.js - Main application file
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = new sqlite3.Database('./database.db');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session setup (for admin login)
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Save uploaded files in the 'public/uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});
const upload = multer({ storage });

// Routes

// Homepage
app.get('/', async (req, res) => {
    const categories = await getCategories();
    const products = await getProducts();
    res.render('index', { categories, products });
});

// Admin Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Admin Login (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') { // Hardcoded for simplicity
        req.session.admin = true;
        res.redirect('/admin');
    } else {
        res.redirect('/login');
    }
});

// Admin Panel
app.get('/admin', (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/login');
    }
    res.render('admin');
});

// Add Product (Admin)
app.post('/admin/add-product', upload.single('image'), (req, res) => {
    const { name, price, description, category_id } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : ''; // Save image path

    db.run(
        'INSERT INTO products (name, price, description, category_id, image) VALUES (?, ?, ?, ?, ?)',
        [name, price, description, category_id, image],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin');
            }
        }
    );
});

// Add Variant (Admin)
app.post('/admin/add-variant', (req, res) => {
    const { product_id, name, price } = req.body;
    db.run('INSERT INTO variants (product_id, name, price) VALUES (?, ?, ?)', [product_id, name, price], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/admin');
        }
    });
});

// Add Image (Admin)
app.post('/admin/add-image', upload.single('image_url'), (req, res) => {
    const { product_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : ''; // Save image path

    db.run('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [product_id, image_url], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/admin');
        }
    });
});

// Wishlist (User)
app.post('/wishlist/add', (req, res) => {
    const { user_id, product_id } = req.body;
    db.run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [user_id, product_id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
});

// Reviews (User)
app.post('/review/add', (req, res) => {
    const { product_id, user_id, rating, comment } = req.body;
    db.run('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [product_id, user_id, rating, comment], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect(`/product/${product_id}`);
        }
    });
});

// Notifications (Admin)
app.post('/notification/send', (req, res) => {
    const { user_id, message } = req.body;
    db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [user_id, message], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/admin');
        }
    });
});

// Analytics Dashboard (Admin Only)
app.get('/analytics', async (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/login');
    }

    const data = await new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                (SELECT COUNT(*) FROM products) AS product_count,
                (SELECT COUNT(*) FROM categories) AS category_count,
                (SELECT COUNT(*) FROM orders) AS order_count,
                (SELECT COUNT(*) FROM users) AS user_count
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows[0]);
        });
    });

    res.render('analytics', { data });
});

// Helper functions
function getCategories() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM categories', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getProducts() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
