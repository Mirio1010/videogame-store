# Video Game Store

A full-stack e-commerce web application for buying physical video games, built for CISC 3140 as a group project.

Users can browse products, view details, create accounts, log in, manage a shopping cart, and complete a simulated checkout experience.

Team members: 	Miguel Ortega, Yuchen Jiang, Celia Cen Huang, Lejla Lukacevic, Almina Tsedenova.

## Live 🚀

[Visit Pixel Pit Stop](https://pixel-pit-stop.onrender.com)

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express

### Database
- Supabase, PostgreSQL

---

## Project Goal

The goal is to build a full-stack e-commerce website using **vertical slices** across the frontend, backend, and database — meaning each feature moves through the entire stack rather than splitting work purely by frontend or backend.

Examples of features include:
- Product listing
- Product details
- Authentication
- Shopping cart
- Checkout
- Admin product management

---

## MVP

### Users can:
- Browse physical video games
- View product details
- Create an account
- Log in and log out
- Add games to a cart
- Update cart quantity
- Remove games from the cart
- Complete a simulated checkout

### Admins can:
- Add products
- Edit products
- Delete products

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)

Verify your installations:
```bash
node -v
git --version
```

### Cloning the Repository

```bash
git clone https://github.com/Mirio1010/videogame-store.git
cd videogame-store
```

### Installing Dependencies

Install frontend dependencies:
```bash
cd frontend
npm install
```

### Set up API URL for Frontend

Before running the frontend server, create a file called `.env` inside the `frontend` folder with the following content:

```
VITE_API_URL=http://localhost:3001
```

Install backend dependencies (open a new terminal):
```bash
cd backend
npm install
```

---

## Running the Project

You need to run the frontend and backend separately.

**Frontend** — from the `frontend` folder:
```bash
npm run dev
```

**Backend** — from the `backend` folder:
```bash
npm run dev
```

Each folder has its own `package.json` and `node_modules`.

---

## Project Structure

```
videogame-store/
├── frontend/
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable UI pieces (buttons, cards, etc.)
│       ├── pages/        # Full page views (Home, Product, Cart, etc.)
│       ├── App.jsx       # Root component and routing
│       └── main.jsx      # Entry point
├── backend/
└── README.md
```

> **New to React?** Check out the [official React docs](https://react.dev/learn). Focus on components, props, and state — those three concepts cover most of what you'll need for this project.

---

## Contributing — How to Submit Your Work

We use **Pull Requests (PRs)** to review and merge work. Please do **not** push directly to `main`.

**1. Make sure your local `main` is up to date**
```bash
git checkout main
git pull origin main
```

**2. Create a new branch for your feature**
```bash
git checkout -b feature/your-feature-name
```
Name it something descriptive, like `feature/product-listing` or `fix/cart-bug`.

**3. Stage and commit your changes**
```bash
git add .
git commit -m "Brief description of what you did"
```

**4. Push your branch to GitHub**
```bash
git push origin feature/your-feature-name
```

**5. Open a Pull Request**
- Go to the repo: https://github.com/Mirio1010/videogame-store
- Click **"Compare & pull request"**
- Add a short description of what your PR does
- Request a teammate to review it before merging

> **New to React?** A good starting point is the [official React docs](https://react.dev/learn). Focus on components, props, and state — those three concepts cover most of what you'll need for this project.
