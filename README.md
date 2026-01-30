# Site Comics - Comic Reading Platform

A full-stack comic reading platform built with Next.js, NestJS, and React.

## Project Structure

- **backend/** - NestJS API server with MongoDB
- **frontend/** - Next.js user-facing website
- **cms/** - React admin dashboard

## Tech Stack

### Backend
- NestJS
- Prisma ORM
- MongoDB
- JWT Authentication
- Redis (optional)

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query

### CMS
- React
- TypeScript
- Vite
- Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Kim-Thu/site-comics.git
cd site-comics
```

2. Install dependencies for each project
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# CMS
cd ../cms
npm install
```

3. Set up environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection string

# Frontend
cp frontend/.env.example frontend/.env

# CMS
cp cms/.env.example cms/.env
```

4. Run the development servers

```bash
# Backend (port 3001)
cd backend
npm run start:dev

# Frontend (port 3000)
cd frontend
npm run dev

# CMS (port 5173)
cd cms
npm run dev
```

## Features

- 📚 Comic reading with chapter management
- 🎨 Modern, responsive UI
- 🔐 User authentication & authorization
- 👤 User profiles and reading history
- 🏷️ Categories and tags
- 🔍 Search functionality
- 📱 Mobile-friendly design
- ⚙️ Admin dashboard for content management
- 🎯 Dynamic header/footer builder
- 📋 Menu management system

## License

MIT
