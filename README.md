<div align="center">

# 👗 Fashivo

**A full-stack fashion e-commerce platform**

> CT313H: Web Technologies and Services · Semester 3, Academic Year 2024–2025 · Class M02

[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## Overview

Fashivo is a full-stack fashion e-commerce web application where customers can browse products by category, manage their shopping cart, and handle their account — while administrators have a dedicated panel to manage products and categories. The backend exposes a fully documented REST API with OpenAPI/Swagger.

---

## Tech Stack

**Frontend**

| Technology | Purpose |
|---|---|
| [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) | UI framework & build tool |
| [Pinia](https://pinia.vuejs.org/) | State management |
| [Vue Router 4](https://router.vuejs.org/) | Client-side routing |
| [TanStack Vue Query](https://tanstack.com/query/latest) | Server state & data caching |
| [Vee-Validate](https://vee-validate.logaretm.com/) + [Zod](https://zod.dev/) | Form validation |
| [Bootstrap 5](https://getbootstrap.com/) | UI component library |
| [Font Awesome](https://fontawesome.com/) | Icon set |

**Backend**

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) | REST API server |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Knex.js](https://knexjs.org/) | SQL query builder & migrations |
| [Prisma](https://www.prisma.io/) | ORM for type-safe queries |
| [JWT](https://jwt.io/) | Stateless authentication |
| [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [Multer](https://github.com/expressjs/multer) | File & image uploads |
| [Zod](https://zod.dev/) | Request body validation |
| [Swagger UI](https://swagger.io/tools/swagger-ui/) | Interactive API documentation |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Rate limiting |

---

## Features

**Customer**
- Browse and filter products by category
- View detailed product pages
- Add to cart, update quantities, and remove items
- User registration, login, and profile management
- Password update and account settings

**Admin**
- Add, edit, and manage products
- Manage product categories
- Upload product images

---

## Project Structure

```
Fashivo/
├── backend-api/
│   ├── src/
│   │   ├── controllers/        # Route handlers — auth, product, category, cart, user
│   │   ├── services/           # Business logic layer
│   │   ├── routes/             # Express route definitions
│   │   ├── middlewares/        # Auth guard, error handler, rate limiter
│   │   ├── schema/             # Zod validation schemas
│   │   └── config/             # Database & app configuration
│   ├── migrations/             # Knex database migrations
│   ├── seeds/                  # Database seed data
│   ├── docs/                   # OpenAPI specification (openapiSpec.json)
│   ├── public/                 # Uploaded images (avatars, products)
│   └── server.js               # Express app entry point
└── frontend-spa/
    └── src/
        ├── views/              # Pages — Home, Product, Cart, Login, Register, Admin...
        ├── components/         # Reusable UI components
        ├── store/              # Pinia stores
        ├── services/           # Axios API service layer
        ├── composables/        # Vue composables
        └── router/             # Route definitions & guards
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL 14+

### Backend

```bash
cd backend-api
npm install
```

Create a `.env` file in `backend-api/`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=clothing_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

Run migrations and seed the database, then start the server:

```bash
npx knex migrate:latest
npx knex seed:run
npm start
```

Interactive API docs will be available at `http://localhost:3000/api-docs`.

### Frontend

```bash
cd frontend-spa
npm install
```

Create a `.env` file in `frontend-spa/`:

```env
VITE_TARGET=http://localhost:3000
```

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register a new user |
| `POST` | `/api/v1/auth/login` | Authenticate and receive token |
| `GET` | `/api/v1/auth/me` | Get current authenticated user |
| `PATCH` | `/api/v1/auth/update-password` | Update user password |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `PATCH` | `/api/v1/auth/reset-password/:token` | Reset password via token |
| `GET` | `/api/v1/product` | List all products |
| `GET` | `/api/v1/product/:id` | Get product details |
| `POST` | `/api/v1/product` | Create product (admin) |
| `PUT` | `/api/v1/product/:id` | Update product (admin) |
| `DELETE` | `/api/v1/product/:id` | Delete product (admin) |
| `GET` | `/api/v1/category` | List all categories |
| `GET` | `/api/v1/cart` | Get current user's cart |
| `POST` | `/api/v1/cart` | Add item to cart |
| `PUT` | `/api/v1/cart/:id` | Update cart item quantity |
| `DELETE` | `/api/v1/cart/:id` | Remove item from cart |

Full specification available in [`backend-api/docs/openapiSpec.json`](./backend-api/docs/openapiSpec.json).

---

## References

- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html)
- [Pinia Documentation](https://pinia.vuejs.org/introduction.html)
- [TanStack Query for Vue](https://tanstack.com/query/latest/docs/framework/vue/overview)
- [Vee-Validate Documentation](https://vee-validate.logaretm.com/v4/)
- [Express.js Documentation](https://expressjs.com/)
- [Knex.js Documentation](https://knexjs.org/guide/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev/)
- [JWT Introduction](https://jwt.io/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

---

## Acknowledgements

We would like to sincerely thank:

- Our lecturer and teaching assistants of **CT313H — Web Technologies and Services** at **Can Tho University** for their invaluable guidance, feedback, and support throughout the semester.
- The open-source community behind Vue, Express, Prisma, Knex, and every library that powered this project.
- Our classmates in class **M02** for the collaborative discussions and peer support.

---

<div align="center">

Made with ❤️ · Can Tho University · 2025

</div>
