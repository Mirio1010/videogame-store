# Video Game Store

A full-stack e-commerce web application for buying physical video games.

This project is being built for CISC 3140 as a group project. The goal is to create a video game store where users can browse products, view details, create accounts, log in, manage a shopping cart, and complete a simulated checkout experience.

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express

### Database
- To be decided / added during backend setup

---

## Project Goal

The purpose of this project is to build a full-stack e-commerce website using vertical slices across the frontend, backend, and database.

Instead of splitting the work only by frontend or backend, the team will build complete features that move through the whole stack.

Examples of features include:
- product listing
- product details
- authentication
- shopping cart
- checkout
- admin product management

---

## MVP

Our MVP is a video game e-commerce website where users can:

- browse physical video games
- view product details
- create an account
- log in and log out
- add games to a cart
- update cart quantity
- remove games from the cart
- complete a simulated checkout

Admins will be able to:

- add products
- edit products
- delete products

---

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed on your computer:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)

You can verify your installations by running:
```bash
node -v
git --version
```

---

### Cloning the Repository

1. Open your terminal (Mac/Linux) or Git Bash (Windows)
2. Navigate to the folder where you want the project to live
3. Run the following command:
```bash
git clone https://github.com/Mirio1010/videogame-store.git
```

4. Move into the project folder:
```bash
cd videogame-store
```

---

### Installing Dependencies

This project uses **React + Vite**. If you've never used React before, don't worry — you won't need to understand all of it right away. Just follow these steps to get it running locally.

Install all required packages by running:
```bash
npm install
```

---

### Running the App Locally

To start the development server:
```bash
npm run dev
```

Once it's running, open your browser and go to:
```
http://localhost:5173
```

You should see the app running. Any changes you save to the code will automatically refresh in the browser.

---

### Contributing — How to Submit Your Work

We use **Pull Requests (PRs)** to review and merge each other's work. Please do **not** push directly to `main`.

Here's the workflow to follow every time you work on something:

**1. Make sure your local `main` is up to date**
```bash
git checkout main
git pull origin main
```

**2. Create a new branch for your feature**

Name it something descriptive, like `feature/product-listing` or `fix/cart-bug`:
```bash
git checkout -b feature/your-feature-name
```

**3. Make your changes, then stage and commit them**
```bash
git add .
git commit -m "Brief description of what you did"
```

**4. Push your branch to GitHub**
```bash
git push origin feature/your-feature-name
```

**5. Open a Pull Request**

- Go to the repo on GitHub: https://github.com/Mirio1010/videogame-store
- Click **"Compare & pull request"**
- Add a short description of what your PR does
- Request a teammate to review it before merging

---

### Project Structure (Quick Overview)
```
videogame-store/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI pieces (buttons, cards, etc.)
│   ├── pages/        # Full page views (Home, Product, Cart, etc.)
│   ├── App.jsx       # Root component and routing
│   └── main.jsx      # Entry point — this is what loads the app
├── index.html
├── vite.config.js
└── package.json
```

> **New to React?** A good starting point is the [official React docs](https://react.dev/learn). Focus on components, props, and state — those three concepts cover most of what you'll need for this project.
