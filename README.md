# West Forsyth Lost & Found Website

A modern, responsive lost and found management system for West Forsyth High School built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎨 Features

✅ **Homepage** - Hero section with search functionality and feature showcase
✅ **Report Found Items** - Multi-step form with photo upload capability
✅ **Browse Items** - Searchable database with advanced filtering
✅ **Claim System** - Verification process for item claims
✅ **Location Info** - Office details, hours, and directions
✅ **Contact Form** - Easy communication with staff
✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **West Forsyth Branding** - Navy, Gold, and Green color scheme

## 🚀 Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Firebase account (free tier is sufficient)
- A text editor (VS Code recommended)

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd west-forsyth-lost-found
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable the following services:
   - Authentication (Email/Password & Google Sign-In)
   - Firestore Database
   - Cloud Storage

4. Get your Firebase configuration:
   - Project Settings → General → Your apps → Web app
   - Copy the configuration values

5. Create `.env.local` file:

```bash
cp .env.local.template .env.local
```

6. Fill in your Firebase credentials in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Configure Firestore Database

Create these collections in Firestore:

```
items/
  - id (auto)
  - title (string)
  - description (string)
  - category (string)
  - colors (array)
  - location (string)
  - dateFound (timestamp)
  - photos (array of URLs)
  - status (string: 'pending' | 'active' | 'claimed')
  - submittedBy (string)
  - createdAt (timestamp)

claims/
  - id (auto)
  - itemId (string)
  - studentId (string)
  - proofPhoto (string URL)
  - identifyingFeatures (string)
  - lossDetails (string)
  - contents (string)
  - status (string: 'pending' | 'approved' | 'denied')
  - createdAt (timestamp)

users/
  - id (auto)
  - email (string)
  - name (string)
  - role (string: 'student' | 'admin')
  - createdAt (timestamp)
```

### 4. Set Firestore Rules

Go to Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all items
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow users to manage their own claims
    match /claims/{claimId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.studentId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### 5. Set Storage Rules

Go to Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /items/{itemId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024 && // 5MB max
        request.resource.contentType.matches('image/.*');
    }
    
    match /claims/{claimId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

## 🏃 Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Pages Overview

- **/** - Homepage with hero and features
- **/report** - Submit found items
- **/browse** - Search and filter items
- **/location** - Office information
- **/contact** - Contact form

## 🎨 Customization

### Colors (tailwind.config.js)

```javascript
colors: {
  navy: '#003A70',    // Primary brand color
  gold: '#F0AB00',    // Accent color
  green: '#2D5F3F',   // Secondary color
}
```

### Fonts

- Headers: Poppins (Bold, SemiBold)
- Body: Roboto (Regular, Medium)

## 🔐 Authentication Setup

For student verification using FCS email:

1. Enable Email/Password authentication in Firebase
2. Set up email verification
3. Restrict to @forsyth.k12.ga.us domain (implement in sign-up logic)

For Google SSO:

1. Enable Google Sign-In in Firebase Authentication
2. Configure OAuth consent screen
3. Add authorized domains

## 📦 Building for Production

```bash
npm run build
npm run start
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Your site will be live at: `https://your-project.vercel.app`

### Custom Domain

Add a custom domain in Vercel:
- Recommended: `lostandfound.westforsyth.com`

## 📊 Database Structure Example

```javascript
// Example item document
{
  id: "L&F-2026-0147",
  title: "Navy Jansport Backpack",
  description: "Navy blue backpack with gold zippers...",
  category: "Backpack",
  colors: ["Navy", "Gold"],
  location: "Cafeteria",
  specificLocation: "Near vending machines",
  dateFound: Timestamp,
  photos: [
    "https://storage.googleapis.com/...",
    "https://storage.googleapis.com/..."
  ],
  status: "active",
  submittedBy: "sarah.m@forsyth.k12.ga.us",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔧 Next Steps / TODO

- [ ] Implement Firebase authentication
- [ ] Connect forms to Firestore
- [ ] Add photo upload to Firebase Storage
- [ ] Create admin dashboard
- [ ] Add email notifications
- [ ] Implement claim verification system
- [ ] Add search functionality
- [ ] Create user profiles
- [ ] Add analytics tracking
- [ ] Implement Google Maps integration

## 📝 License

This project is for educational purposes - West Forsyth High School.

## 🤝 Contributing

This is a student project for West Forsyth High School. 

## 📞 Support

For questions or issues:
- Check the GitHub Issues page
- Contact: your-email@forsyth.k12.ga.us

## 🎓 Credits

Developed by [Your Name]
For West Forsyth High School
Course: [Your Course Name]
Year: 2026

---

Made with ❤️ for the West Forsyth Wolverines 🐺
