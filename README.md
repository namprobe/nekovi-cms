This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Environment Setup

First, create environment configuration files:

**Create `.env.local` file in the root directory:**

```bash
# Copy from template and update values
cp .env.example .env.local

# Or create manually:
```

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_CMS_API_PREFIX=/api/cms
NEXT_PUBLIC_COMMON_API_PREFIX=/api/common

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_TOKEN_EXPIRY=3600

# Application
NEXT_PUBLIC_APP_NAME=NekoVi CMS
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

> 💡 **Tip:** Use `.env.example` as a template for your environment configuration.

**Environment Variables Explanation:**

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | ✅ | `http://localhost:5000` |
| `NEXT_PUBLIC_CMS_API_PREFIX` | CMS API prefix path | ✅ | `/api/cms` |
| `NEXT_PUBLIC_COMMON_API_PREFIX` | Common API prefix path | ✅ | `/api/common` |
| `NEXT_PUBLIC_JWT_SECRET` | JWT secret for token validation | ✅ | - |
| `NEXT_PUBLIC_TOKEN_EXPIRY` | Token expiry time in seconds | ❌ | `3600` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | ❌ | `NekoVi CMS` |

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Backend Setup

Make sure your backend API is running on the configured URL (default: `http://localhost:5000`).

**Required Backend Endpoints:**
- `POST /api/cms/auth/login` - User authentication
- `POST /api/cms/auth/logout` - User logout  
- `POST /api/cms/auth/refresh-token` - Token refresh
- `GET /api/cms/auth/profile` - Get user profile
- Other CMS endpoints for CRUD operations

### 5. Development Notes

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses:
- [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font)
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Features

### 🔐 Authentication System
- **Secure Login/Logout** with JWT tokens
- **Auto Token Refresh** to maintain sessions
- **Route Protection** with AuthGuard
- **Role-based Access Control** (RBAC)
- **Persistent Sessions** across browser reloads

### 🎨 UI/UX
- **Dark/Light Mode** toggle
- **Responsive Design** for all devices
- **Modern UI Components** with shadcn/ui
- **Tailwind CSS** for consistent styling
- **Loading States** and error handling

### ⚡ Performance
- **Zustand State Management** for optimal re-renders
- **Next.js App Router** for fast navigation
- **TypeScript** for type safety
- **Clean Architecture** for maintainability

### 📱 CMS Features
- **User Management** - CRUD operations for users
- **Product Management** - Product catalog with categories
- **Order Management** - Order tracking and processing  
- **Marketing Tools** - Coupons, badges, and promotions
- **Blog System** - Content management for articles
- **Event Management** - Event creation and scheduling

## Environment Variables

For production deployment, make sure to set these environment variables:

```bash
# Production API
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_CMS_API_PREFIX=/api/cms
NEXT_PUBLIC_COMMON_API_PREFIX=/api/common

# Security (generate strong secrets)
NEXT_PUBLIC_JWT_SECRET=your-super-secure-jwt-secret-key

# Application
NEXT_PUBLIC_APP_NAME=NekoVi CMS
NODE_ENV=production
```

## Documentation

📚 **Additional Documentation:**
- [Authentication Flow Guide](./docs/AUTHENTICATION_FLOW_GUIDE.md) - Complete auth implementation
- [Next.js Clean Architecture Guide](./docs/NEXT-JS-CLEAN-ARCHITECT-GUIDE.md) - Project structure
- [Cheat Sheet](./docs/cheet-sheet.md) - Quick reference

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment variables not loading**
   ```bash
   # Make sure .env.local exists and has correct format
   # Restart development server after changes
   ```

3. **Authentication stuck at loading**
   ```bash
   # Clear browser localStorage
   localStorage.clear()
   # Or specific auth store
   localStorage.removeItem('auth-store')
   ```

4. **Backend connection issues**
   ```bash
   # Check if backend is running on correct port
   # Verify CORS settings in backend
   # Check network tab in browser DevTools
   ```

## Architecture
📁 src/
├── 📁 app/                  # Next.js App Router (pages only)
├── 📁 shared/               # Shared components, utils, types
│   ├── 📁 ui/              # Pure UI components
│   ├── 📁 hooks/           # Generic hooks  
│   ├── 📁 utils/           # Utilities
│   └── 📁 types/           # Shared types
├── 📁 entities/             # Domain layer (business logic)
│   ├── 📁 auth/
│   ├── 📁 products/
│   ├── 📁 orders/
│   └── 📁 users/
├── 📁 features/             # Feature modules (UI + Logic)
│   ├── 📁 auth/
│   ├── 📁 dashboard/
│   ├── 📁 products/
│   ├── 📁 orders/
│   └── 📁 marketing/
├── 📁 core/                 # Infrastructure layer
│   ├── 📁 config/          # Configuration
│   ├── 📁 lib/             # External libraries
│   └── 📁 providers/       # App providers
└── 📁 widgets/              # Composite components
    ├── 📁 layout/
    └── 📁 feedback/
