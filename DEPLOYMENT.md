# Deployment Guide for Vercel

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure your project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 3. Set Environment Variables

In Vercel's project settings, add these environment variables:

#### Required Variables:
```
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

#### Optional (add at least one search provider):
```
BRAVE_SEARCH_API_KEY=your_brave_api_key
SEARXNG_URL=your_searxng_url
EXA_API_KEY=your_exa_api_key
```

#### Clerk URLs (add these exactly as shown):
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 4. Deploy
Click "Deploy" and Vercel will:
1. Install dependencies
2. Run database migrations (via postinstall script)
3. Build your application
4. Deploy to production

## Database Setup Options

### Option 1: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### Option 2: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Copy connection string from dashboard

### Option 3: Vercel Postgres
1. In your Vercel project dashboard
2. Go to Storage tab
3. Create a Postgres database
4. It will automatically add the DATABASE_URL

## Post-Deployment Steps

### 1. Update Clerk Settings
In your Clerk dashboard:
1. Add your Vercel domain to allowed origins
2. Update redirect URLs to include your production domain

### 2. Test Your Deployment
1. Visit your-app.vercel.app
2. Sign up/sign in
3. Try a search query
4. Test vocabulary features

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is properly formatted
- Check if your database allows connections from Vercel IPs
- For Supabase: Enable "Direct connections" in settings

### Build Failures
- Check build logs in Vercel dashboard
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Database migration failures

### Runtime Errors
- Check Function logs in Vercel dashboard
- Ensure all API keys are valid
- Verify Clerk configuration

## Custom Domain

To add a custom domain:
1. Go to your Vercel project settings
2. Navigate to Domains
3. Add your domain
4. Follow DNS configuration instructions

## Performance Optimization

Vercel automatically provides:
- Edge caching
- Image optimization
- Automatic HTTPS
- Global CDN

For best performance:
1. Ensure your database is in the same region as your Vercel deployment
2. Use Vercel Analytics to monitor performance
3. Enable Turbopack in production (already configured)

## Monitoring

1. Enable Vercel Analytics:
   ```bash
   npm i @vercel/analytics
   ```

2. Add to your root layout:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

## Security Considerations

1. Never commit `.env` files
2. Use Vercel's environment variable UI
3. Rotate API keys regularly
4. Enable 2FA on all services

## Cost Considerations

Free tiers usually include:
- Vercel: 100GB bandwidth, unlimited deployments
- Supabase: 500MB database, 2GB bandwidth
- Clerk: 5,000 monthly active users
- Google Gemini: Generous free tier

Monitor usage in each service's dashboard.

---

Need help? Check the [Vercel Documentation](https://vercel.com/docs) or open an issue in the repository.