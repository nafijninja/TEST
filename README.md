# E-Commerce Website with Admin Panel

Welcome to the **E-Commerce Website** project! This is a fully functional e-commerce platform built with **Node.js**, **Express.js**, **SQLite**, and **EJS**. The project includes an **Admin Panel** for managing products and categories, as well as **User Authentication** for a personalized shopping experience.

---

## **Project Overview**

This project is designed and developed by **ÑÄFĪJ**. It is a simple yet powerful e-commerce website that allows admins to add products and categories, while users can browse products, log in, and register.

### **Key Features**
- **Admin Panel**:
  - Add new categories.
  - Add new products with details (name, price, description, image, and category).
- **User Authentication**:
  - Login and registration system.
  - Secure password hashing using **bcryptjs**.
- **Product Browsing**:
  - View products by category.
  - Responsive and user-friendly design.
- **Database**:
  - Uses **SQLite** for storing products, categories, and user data.

---

## **Technologies Used**

- **Backend**:
  - Node.js
  - Express.js
  - SQLite (Database)
- **Frontend**:
  - EJS (Embedded JavaScript Templates)
  - HTML, CSS, JavaScript
- **Authentication**:
  - bcryptjs (Password Hashing)
  - express-session (Session Management)

---

## **File Structure*

## Environment Configuration

This project uses environment variables to manage configuration settings for different environments (development and production). The environment variables are stored in a `.env` file.

### Setting Up Environment Variables

1. **Create a `.env` file:**
   Create a `.env` file in the root directory of your project.

2. **Add the following variables:**

   #### For Development:
   ```env
   NODE_ENV=development

### Setting Up Environment Variables

1. **Create a `.env` file:**
   Create a `.env` file in the root directory of your project.

2. **Add the following variables:**

   #### For Production:
   ```env
   NODE_ENV=production
