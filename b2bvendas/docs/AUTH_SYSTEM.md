# NextAuth.js Authentication System - B2B Marketplace

Complete authentication system implementation for the B2B Marketplace using NextAuth.js with credentials provider.

## 🔐 Features

- ✅ User authentication with email and password
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT-based sessions (30 days expiration)
- ✅ Role-based access control (CLIENT, FORNECEDOR, ADMIN)
- ✅ Protected routes with middleware
- ✅ Automatic user profile creation (Cliente/Fornecedor) based on role
- ✅ Inactive user handling
- ✅ Type-safe session with TypeScript
- ✅ Server-side and client-side session management

## 📁 File Structure

```
b2bvendas/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts           # NextAuth API route handler
│   │       └── register/
│   │           └── route.ts           # User registration endpoint
│   ├── login/
│   │   └── page.tsx                   # Login page
│   ├── register/
│   │   └── page.tsx                   # Registration page
│   ├── dashboard/
│   │   └── page.tsx                   # Protected dashboard
│   └── layout.tsx                     # Root layout with AuthProvider
├── src/
│   ├── lib/
│   │   ├── authOptions.ts             # NextAuth configuration
│   │   ├── auth.ts                    # Auth helper functions
│   │   └── prisma.ts                  # Prisma client
│   ├── types/
│   │   └── next-auth.d.ts             # NextAuth type extensions
│   └── components/
│       └── AuthProvider.tsx           # Session provider wrapper
├── middleware.ts                      # Route protection middleware
└── .env                               # Environment variables
```

## 🚀 Setup

### 1. Environment Variables

Already configured in `.env`:

```env
DATABASE_URL="your_database_url"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars-change-in-production
```

⚠️ **Important**: Change `NEXTAUTH_SECRET` in production to a secure random string (min 32 characters)

### 2. Dependencies

All required packages are already installed:
- `next-auth@^4.24.13`
- `bcryptjs@^3.0.3`
- `@types/bcryptjs@^2.4.6`
- `zod@^4.3.5`
- `@prisma/client@^7.2.0`

## 🔑 Authentication Flow

### Registration

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "nome": "John Doe",
  "email": "john@example.com",
  "senha": "password123",
  "role": "CLIENT" // or "FORNECEDOR" or "ADMIN"
}
```

**Validations**:
- Nome: Required
- Email: Valid email format, must be unique
- Senha: Minimum 6 characters
- Role: Must be one of CLIENT, FORNECEDOR, ADMIN

**Response** (201 Created):
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "cuid...",
    "nome": "John Doe",
    "email": "john@example.com",
    "role": "CLIENT"
  }
}
```

**Automatic Profile Creation**:
- **FORNECEDOR**: Creates a `Fornecedor` record with basic info (temporary CNPJ, slug from email)
- **CLIENT**: Creates a `Cliente` record with basic info (temporary CNPJ)
- **ADMIN**: Only creates the user record

### Login

**Page**: `/login`

**Process**:
1. User enters email and password
2. Credentials are verified against database
3. Password is compared using bcrypt
4. Checks if user is active (`ativo = true`)
5. JWT token is created with user info
6. Session is stored and user is redirected to dashboard

### Session Management

**Session includes**:
```typescript
{
  user: {
    id: string
    email: string
    nome: string
    role: Role // "CLIENT" | "FORNECEDOR" | "ADMIN"
  }
}
```

**JWT Strategy**: 
- 30-day expiration
- Stored in secure HTTP-only cookie
- Contains: id, email, nome, role

## 🛡️ Protected Routes

### Middleware Configuration

The middleware protects routes based on user role:

| Route Pattern | Required Role | Description |
|---------------|---------------|-------------|
| `/dashboard/fornecedor/*` | FORNECEDOR, ADMIN | Supplier dashboard |
| `/dashboard/cliente/*` | CLIENT, ADMIN | Client dashboard |
| `/admin/*` | ADMIN | Admin panel |

**Public Routes** (no authentication required):
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/fornecedores` - Public suppliers list
- `/catalogo-publico` - Public catalog

**Protected Routes** (authentication required):
- Everything else not listed as public

## 🔧 Helper Functions

### Server-Side (src/lib/auth.ts)

```typescript
import { getServerSession, requireAuth, requireRole } from '@/src/lib/auth'
import { Role } from '@prisma/client'

// Get current session (can be null)
const session = await getServerSession()

// Require authentication (throws if not authenticated)
const session = await requireAuth()

// Require specific role (throws if role doesn't match)
const session = await requireRole(Role.FORNECEDOR)

// Require multiple roles (any of them)
const session = await requireRole([Role.FORNECEDOR, Role.ADMIN])
```

### Client-Side

```typescript
import { useSession, signIn, signOut } from 'next-auth/react'

// In a component
const { data: session, status } = useSession()

// Login
await signIn('credentials', {
  email: 'user@example.com',
  senha: 'password',
  redirect: false
})

// Logout
await signOut({ callbackUrl: '/login' })
```

## 📝 Usage Examples

### Protecting a Server Component

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/src/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  try {
    const session = await requireAuth()
    
    return (
      <div>
        <h1>Welcome, {session.user.nome}</h1>
        <p>Role: {session.user.role}</p>
      </div>
    )
  } catch {
    redirect('/login')
  }
}
```

### Protecting an API Route

```typescript
// app/api/fornecedor/route.ts
import { requireRole } from '@/src/lib/auth'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await requireRole(Role.FORNECEDOR)
    
    // Your logic here
    return NextResponse.json({ data: 'success' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
```

### Client Component with Session

```typescript
'use client'

import { useSession } from 'next-auth/react'

export default function ProfileComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not logged in</div>
  
  return (
    <div>
      <p>Name: {session.user.nome}</p>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

## 🔒 Security Features

1. **Password Hashing**: Bcrypt with 10 salt rounds
2. **HTTP-Only Cookies**: Session stored in secure cookies
3. **JWT Tokens**: Signed tokens with secret key
4. **Role-Based Access**: Middleware enforces role requirements
5. **Inactive User Check**: Prevents login if user is deactivated
6. **Input Validation**: Zod schema validation on registration
7. **Email Uniqueness**: Prevents duplicate accounts

## 🧪 Testing the System

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test User",
    "email": "test@example.com",
    "senha": "password123",
    "role": "CLIENT"
  }'
```

### 2. Login via UI

1. Navigate to http://localhost:3000/login
2. Enter credentials
3. Click "Entrar"
4. Redirected to /dashboard on success

### 3. Access Protected Route

Navigate to http://localhost:3000/dashboard (requires authentication)

## 📊 Database Models

### Usuario (User)
```prisma
model Usuario {
  id            String    @id @default(cuid())
  nome          String
  email         String    @unique
  senha         String    // bcrypt hash
  role          Role      @default(CLIENT)
  ativo         Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Role Enum
```prisma
enum Role {
  ADMIN
  FORNECEDOR  // Supplier
  CLIENT      // Customer
}
```

## 🐛 Error Handling

### Registration Errors

| Error | Status | Message |
|-------|--------|---------|
| Invalid input | 400 | Specific validation message |
| Email exists | 409 | "Email já cadastrado" |
| Server error | 500 | "Erro ao criar usuário. Tente novamente." |

### Login Errors

| Error | Cause |
|-------|-------|
| "Email e senha são obrigatórios" | Missing credentials |
| "Credenciais inválidas" | Wrong email or password |
| "Usuário inativo..." | User account is deactivated |

## 🎨 UI Components

Both login and register pages include:
- Clean, responsive forms
- Error message display
- Loading states
- Links between pages
- Tailwind CSS styling

## 📝 Notes

- The middleware uses Next.js 16 features
- All passwords are hashed before storage
- Sessions are refreshed automatically
- Type safety throughout with TypeScript
- Compatible with Prisma 7.x with Accelerate

## 🚀 Next Steps

To extend this system:
1. Add password reset functionality
2. Implement email verification
3. Add OAuth providers (Google, GitHub, etc.)
4. Add two-factor authentication
5. Add password strength requirements
6. Add session management UI
7. Add audit logging for authentication events

## 📚 References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js 16 App Router](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
