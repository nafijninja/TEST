// app.js - Main application file
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const multer = require('multer'); // For file uploads
const fs = require('fs');
const SQLiteStore = require('connect-sqlite3')(session); // Correct initialization
const app = express();app.use(express.static('public', { maxAge: 86400000 })); // Cache for 1 day
const PORT = process.env.PORT || 3000;

// Environment-based cookie settings
const isProduction = process.env.NODE_ENV === 'production'; // true in production, false in development

  
// Create tables if they don't exist
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

  db.run(`
    CREATE TABLE IF NOT EXISTS variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      name TEXT,
      price REAL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      image_url TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      user_id INTEGER,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      section_name TEXT,
      section_value TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating product_specs table:', err);
    } else {
      console.log('product_specs table created or already exists.');
    }
  });
});

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

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session middleware
// Database initialization



const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database.');
  }
});

// Keep the connection alive
setInterval(() => {
  db.run('SELECT 1', (err) => {
    if (err) console.error('Database ping error:', err);
  });
}, 60 * 1000); // Ping every 60 seconds

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: isProduction, // Set to true only in production (HTTPS)
    maxAge: 1000 * 60 * 60 * 24 // 1 day (increase as needed)
  }
}));

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

function getProduct(productId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getProductImages(productId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM product_images WHERE product_id = ?', [productId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getProductVariants(productId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM variants WHERE product_id = ?', [productId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getProductReviews(productId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM reviews WHERE product_id = ?', [productId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getProductSpecs(productId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM product_specs WHERE product_id = ?', [productId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getCategory(categoryId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM categories WHERE id = ?', [categoryId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
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

// Routes

// Homepage
app.get('/', async (req, res) => {
  const categories = await getCategories();
  const products = await getProducts();
  res.render('index', { categories, products });
});

// Login route (GET)
app.get('/login', (req, res) => {
  res.render('login');
});

// Login route (POST)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'nafij' && password === 'nafijpro') {
    req.session.user = { username: 'nafij' };
    console.log('Session after login:', req.session); // Debug session
    console.log('Set-Cookie Header:', res.getHeaders()['set-cookie']); // Debug cookie
    res.redirect('/admin');
  } else {
    console.log('Invalid credentials. Redirecting to /login.'); // Debug invalid credentials
    res.redirect('/login');
  }
});

// Admin route
app.get('/admin', async (req, res) => {
  if (!req.session.user) {
    console.log('User not logged in. Redirecting to /login.'); // Debug redirect
    return res.redirect('/login');
  }

  const categories = await getCategories();
  const products = await getProducts();
  res.render('admin', { categories, products, user: req.session.user });
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

// Add Category (Admin)
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

// Delete Product (Admin)
app.post('/admin/delete-product', (req, res) => {
  const { product_id } = req.body;

  db.run('DELETE FROM products WHERE id = ?', [product_id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/admin');
    }
  });
});

// Delete Category (Admin)
app.post('/admin/delete-category', (req, res) => {
  const { category_id } = req.body;

  db.run('DELETE FROM categories WHERE id = ?', [category_id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/admin');
    }
  });
});

// Add Custom Section (Admin)
app.post('/admin/add-spec', (req, res) => {
  const { product_id, section_name, section_value } = req.body;

  db.run(
    'INSERT INTO product_specs (product_id, section_name, section_value) VALUES (?, ?, ?)',
    [product_id, section_name, section_value],
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

// Fetch product images
function getProductImages(productId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM product_images WHERE product_id = ?', [productId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
        }

// Product Detail Route
app.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await getProduct(productId);
    const productImages = await getProductImages(productId);
    const variants = await getProductVariants(productId);
    const reviews = await getProductReviews(productId);
    const specs = await getProductSpecs(productId);

    res.render('product', { product, productImages, variants, reviews, specs, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Category Detail Route
app.get('/category/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await getCategory(categoryId);
    const products = await getProductsByCategory(categoryId);

    res.render('category', { category, products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Reviews (User)
app.post('/review/add', (req, res) => {
  const { product_id, user_id, rating, comment } = req.body;

  db.run(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [product_id, user_id, rating, comment],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect(`/product/${product_id}`);
      }
    }
  );
});
    
// Logout (Admin)
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/login');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
