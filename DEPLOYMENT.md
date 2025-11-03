# Deployment Guide

## Vercel Deployment

### Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. The project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel will auto-detect the Vite framework
5. Click "Deploy"

Vercel will automatically:
- Detect the build command (`npm run build`)
- Set output directory to `dist`
- Configure SPA routing

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project directory:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Environment Variables

If you need to configure Firebase with environment variables (recommended for production):

1. In Vercel Dashboard, go to Project Settings > Environment Variables
2. Add the following variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Update `src/Firebase.js` to use environment variables:
```javascript
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test GPS broadcasting on mobile devices
- [ ] Check that map markers update in real-time
- [ ] Verify Firebase authentication works
- [ ] Test on different browsers and devices
- [ ] Ensure HTTPS is enabled (required for geolocation)

## Firebase Hosting (Alternative)

To deploy to Firebase Hosting instead:

```bash
npm run deploy
```

This will:
1. Build the project (`npm run build`)
2. Deploy to Firebase Hosting (`firebase deploy --only hosting`)

## Troubleshooting

### Build Fails on Vercel
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (use Node 18+)
- Check build logs for specific errors

### Geolocation Not Working
- Ensure the site is served over HTTPS
- Check browser permissions for location access
- Test on mobile devices with GPS enabled

### Firebase Connection Issues
- Verify Firebase config is correct
- Check Firestore security rules are deployed
- Ensure Anonymous authentication is enabled in Firebase Console

## Custom Domain

To add a custom domain in Vercel:
1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## Performance Optimization

For better performance:
- Enable Vercel Analytics
- Consider code splitting for large dependencies
- Optimize images and assets
- Use Vercel Edge Network for faster delivery

## Monitoring

- Check Vercel Analytics for usage metrics
- Monitor Firebase Console for Firestore usage
- Set up error tracking (Sentry, LogRocket, etc.)
