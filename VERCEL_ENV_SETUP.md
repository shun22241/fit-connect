# Vercel Environment Variables Setup

## Required Environment Variables for Production Deployment

Copy and paste these environment variables in your Vercel dashboard:
**Project Settings → Environment Variables**

### Database Configuration
```
DATABASE_URL=postgresql://postgres:Zoro146512345@db.rzbnnvgccvopjxigiisx.supabase.co:5432/postgres
```

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://rzbnnvgccvopjxigiisx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Ym5udmdjY3ZvcGp4aWdpaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjA5MDQsImV4cCI6MjA2ODM5NjkwNH0.piiyaa3Sofym3dnNfsJfAgGuCb2XXsLubQvWPNPxrIk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Ym5udmdjY3ZvcGp4aWdpaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjgyMDkwNCwiZXhwIjoyMDY4Mzk2OTA0fQ.WKztyOsB2vIonAkx-BXfLSKciZoGVKdACrL7uYnJ-DE
```

### Next.js Configuration
```
NEXTAUTH_SECRET=your-production-nextauth-secret-here
NEXTAUTH_URL=https://fit-connect-eta.vercel.app
NEXT_PUBLIC_SITE_URL=https://fit-connect-eta.vercel.app
```

### OpenAI Configuration (Optional - for AI features)
```
OPENAI_API_KEY=your-openai-api-key-here
```

### Push Notifications (Optional)
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BH5EHz6M9svH5i8ViS7WpOEEqa51PxoU5498OqfKLUIjiYc2UJ2dQz0_D6hoyXgwd6yyVDgxgQmT2UNxOCbiDw8
VAPID_PRIVATE_KEY=T7zRSUgfmOH7-qpMYt67EUTpUghKbvz-b87dyWV5ub8
VAPID_EMAIL=mailto:noreply@fitconnect.app
```

### Feature Flags
```
NEXT_PUBLIC_FEATURE_AI_COACHING=true
NEXT_PUBLIC_FEATURE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_FEATURE_OFFLINE_MODE=true
NEXT_PUBLIC_FEATURE_ANALYTICS=true
NEXT_PUBLIC_DEBUG_MODE=false
```

## Setup Instructions

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: fit-connect
3. **Go to Settings**: Click on "Settings" tab
4. **Environment Variables**: Click on "Environment Variables" in the sidebar
5. **Add each variable**: 
   - Click "Add New"
   - Enter the key name (e.g., `DATABASE_URL`)
   - Enter the value
   - Select "Production", "Preview", and "Development" environments
   - Click "Save"

## Test Deployment

After setting up all environment variables:

1. **Trigger a new deployment**:
   ```bash
   git add .
   git commit -m "Update environment configuration"
   git push
   ```

2. **Monitor the deployment** in Vercel dashboard

3. **Test the application**:
   - Visit your deployed URL
   - Test login/signup functionality
   - Test workout creation and saving
   - Test post creation

## Troubleshooting

If you encounter issues:

1. **Check Vercel deployment logs**
2. **Verify all environment variables are set correctly**
3. **Test database connection** using `/vercel-debug` endpoint
4. **Check Supabase dashboard** for authentication settings

## Database Tables Status

✅ All required tables are created and verified:
- `users` (0 records)
- `workouts` (0 records) 
- `posts` (0 records)
- `exercises`
- `likes`
- `comments`
- `follows`