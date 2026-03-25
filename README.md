# Mockio - Professional Logo Mockup Generator

A modern SaaS web application for generating professional logo mockups. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Sign up/login with email or Google OAuth
- **Logo Upload**: Drag & drop or click to upload PNG, JPG, or SVG logos
- **Mockup Categories**: Browse templates across multiple categories
- **Premium Templates**: Free and Pro tier mockup templates
- **Generated Mockups**: View, preview, and download your mockups
- **User Dashboard**: Track usage and manage mockups
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Main dashboard
│   │   ├── upload/           # Logo upload page
│   │   ├── mockups/          # Mockup library
│   │   ├── generated/        # User's generated mockups
│   │   └── settings/         # Account settings
│   ├── auth/                 # Auth callback routes
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── pricing/              # Pricing page
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── spinner.tsx
│   │   └── avatar.tsx
│   ├── layout/               # Layout components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   ├── mockup-card.tsx
│   ├── file-upload.tsx
│   ├── pricing-card.tsx
│   └── category-card.tsx
├── lib/
│   ├── supabase/             # Supabase client configuration
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── actions/              # Server actions
│   │   ├── auth.ts
│   │   └── mockups.ts
│   └── utils.ts              # Utility functions
├── types/
│   └── index.ts              # TypeScript type definitions
└── middleware.ts             # Next.js middleware
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mockio.git
cd mockio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Set up the database:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase/schema.sql`

6. Create storage buckets:
   - Go to Storage in Supabase dashboard
   - Create buckets named `logos` and `mockups`
   - Set appropriate policies for authenticated users

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) For admin operations |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production version:
```bash
npm run build
npm start
```

## Pages

- **Landing Page** (`/`) - Marketing homepage with features and CTA
- **Pricing** (`/pricing`) - Pricing plans with comparison table
- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - User registration
- **Dashboard** (`/dashboard`) - User dashboard with quick actions and stats
- **Upload** (`/upload`) - Multi-step logo upload flow
- **Mockup Library** (`/mockups`) - Browse all mockup categories
- **Category View** (`/mockups/[category]`) - Browse templates in a category
- **Generated Mockups** (`/generated`) - View and manage generated mockups
- **Settings** (`/settings`) - Account settings and preferences

## License

MIT License - feel free to use this project for personal or commercial purposes.
