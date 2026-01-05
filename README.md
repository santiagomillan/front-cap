# CAP - Transaction Management System# Step 1: Clone the repository using the project's Git URL.

A modern transaction management system built with React, TypeScript, and FastAPI.git clone <YOUR_GIT_URL>

## Features# Step 2: Navigate to the project directory.

- 🔐 Role-based authentication (Operator & Approver)cd <YOUR_PROJECT_NAME>

- 💼 Transaction creation and management

- ✅ Multi-level approval workflow# Step 3: Install the necessary dependencies.

- 📊 Real-time transaction tracking

- 🎨 Modern UI with Tailwind CSS and shadcn/uinpm i

## Tech Stack# Step 4: Start the development server with auto-reloading and an instant preview.

**Frontend:**npm run dev

- Vite

- TypeScript```

- React

- React RouterThis project is built with:

- shadcn/ui

- Tailwind CSS- Vite

- Axios- TypeScript

- React Query- React

- shadcn-ui

**Backend:**- Tailwind CSS

- FastAPI (Railway)```

- PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd front-cap

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, etc.)
├── hooks/          # Custom React hooks
├── lib/            # Utilities and API client
├── pages/          # Page components
└── types/          # TypeScript type definitions
```

## API Configuration

The app connects to the backend API at:

```
https://fastapi-capv1-production.up.railway.app
```

API versions:

- **v1**: Public endpoints (authentication)
- **v2**: Protected endpoints (transactions, approvals)

## Author

Santiago Millan

## License

Private
