# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes!

### Step 1: Open Your Terminal

Navigate to the project directory:
```bash
cd west-forsyth-lost-found
```

### Step 2: Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

OR manually install:
```bash
npm install
```

### Step 3: Configure Environment (Optional for Testing)

For now, you can skip Firebase setup and test the UI:

```bash
npm run dev
```

The app will open at: **http://localhost:3000**

### Step 4: Test the Application

You can explore all pages without Firebase:
- ✅ Homepage works fully
- ✅ Browse items (with mock data)
- ✅ Report form (UI only, won't save yet)
- ✅ Location page works fully
- ✅ Contact form (UI only)

### Step 5: Add Firebase (When Ready)

1. Create Firebase project: https://console.firebase.google.com
2. Get your config values
3. Create `.env.local`:

```bash
cp .env.local.template .env.local
```

4. Edit `.env.local` with your Firebase credentials
5. Restart dev server: `npm run dev`

## 🎨 What You Can Do Right Now

Even without Firebase, you can:

1. **See the complete UI design**
   - All pages are styled and responsive
   - Test on mobile by resizing browser

2. **Customize branding**
   - Edit `tailwind.config.js` for colors
   - Modify `app/globals.css` for fonts

3. **Add your school logo**
   - Replace the "WF" placeholder in Navigation component
   - Upload logo to `/public` folder

4. **Customize content**
   - Edit text in any `.tsx` files
   - Update contact information in `/app/location/page.tsx`

## 📱 Testing on Your Phone

1. Find your computer's local IP:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet "
   
   # On Windows:
   ipconfig
   ```

2. Start dev server:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

3. On your phone, visit:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run lint
```

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# OR use different port
npm run dev -- -p 3001
```

**Module not found errors?**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Changes not showing?**
```bash
# Hard refresh in browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

## 📚 Next Steps

1. ✅ Get the UI running (you can do this now!)
2. 📝 Customize content for your school
3. 🎨 Adjust colors/branding
4. 🔥 Set up Firebase (when ready to go live)
5. 🚀 Deploy to Vercel

## 💡 Pro Tips

- Use VS Code for best development experience
- Install "ES7+ React/Redux/React-Native snippets" extension
- Use browser dev tools (F12) to test responsive design
- Test in multiple browsers (Chrome, Firefox, Safari)

## ❓ Need Help?

1. Check `README.md` for detailed instructions
2. Look at code comments in files
3. Google error messages
4. Ask your teacher/classmates

---

**Ready? Let's go! 🎓**

```bash
npm run dev
```
