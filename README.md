# 📱 Mobile Call Log Management System (Stack Engine GUI)

> **DIT University — CSN102 Data Structure (Odd Sem, 2026-2027)**  
> **Project Chosen:** Project 8 – Mobile Call Log Management System  
> **Group Members:**
> 1. **Krishna Rustagi** (SAP ID: 1000024715 • Section: BTRAI)
> 2. **Samaksh Raj** (SAP ID: 1000025730 • Section: BTME)
> 3. **Rimesh Raj** (SAP ID: 1000026934 • Section: BTME)
> 4. **Aditya Raj** (SAP ID: 1000026924 • Section: BTME)

---

## 🌟 Overview

This project is a high-performance web GUI and interactive data structure simulator that models the **call-history / "Recents" feature of a mobile phone** using an **Array-Based Stack (LIFO: Last-In-First-Out)**.

In a smartphone, users interact with their call log predominantly in two ways:
1. **Checking the most recent call** (to redial the last number).
2. **Deleting the most recent call** (clearing accidental entries).

Both operations naturally map to Stack operations:
- **PUSH** ➔ Add a new call record (`O(1)` time)
- **POP** ➔ Delete the most recent call record (`O(1)` time)
- **PEEK** ➔ View the last dialed/received call without altering the stack (`O(1)` time)
- **TRAVERSAL** ➔ View the complete call log, most recent first (`O(n)` time)

---

## 🚀 Key Features

1. **Realistic Smartphone Experience**:
   - iPhone / Flagship titanium chassis with dynamic island, live clock, signal, and battery.
   - **Keypad with DTMF Audio Synthesis**: Real audio frequencies generated dynamically with the Web Audio API.
   - **Live Active Call Screen**: Dial any number, start a simulated call with ticking stopwatch timer, and end the call to automatically push it to the stack with its recorded duration!
   - **Incoming Call Ring Simulator**: Simulates an incoming call with ringtone; accept to talk or decline to push a Missed Call (`0s`) to the stack.
   - **Recents Filters**: Filter calls by All, Missed, Outgoing, and Incoming.

2. **Interactive Stack Visualizer & Memory Engine**:
   - Visual stack cells (`calls[0..MAX-1]`, MAX = 50) displaying memory offsets (e.g. `0x7ff00100`).
   - Animated **`TOP -> index [X]`** pointer indicator with bounce & glow.
   - Particle slide-in and drop-out animations on PUSH and POP.
   - Visual laser scan traversal when viewing the complete call log.
   - Boundary condition guards: prevents **Stack Overflow** at 50 and handles **Stack Underflow** when empty.

3. **Simulated GCC C Terminal & Code Viewer**:
   - Interactive terminal running the exact console menu and prompts from the project PDF.
   - Complete `calllog.c` source code viewer matching Pages 8–11 of the submitted academic report.

4. **Persistence & Daily Mobile Use (PWA)**:
   - Saves all stack states to `localStorage` so your logs persist daily.
   - PWA support (`manifest.json` and service worker) allowing **"Add to Home Screen"** on iOS and Android phones.
   - Export call logs to **CSV** or **JSON**.

---

## 🌐 Deploying to Vercel (Instant Live Link)

### Method 1: Deploy with Vercel CLI (Fastest)

1. Open PowerShell / Command Prompt in this project directory:
   ```bash
   cd C:\Users\krishna\.gemini\antigravity-ide\scratch\call-log-stack-app
   ```
2. Run:
   ```bash
   vercel
   ```
   (If not logged in, it will open a browser to log in with your GitHub/Google account).
3. Accept the default prompts (hit `Enter`).
4. To deploy directly to production, run:
   ```bash
   vercel --prod
   ```
5. You will get a live URL:
   `https://call-log-stack-app.vercel.app` (or your chosen name) that you can open on your phone daily and share with anyone!

---

### Method 2: Deploy via GitHub (Recommended for Daily Updates)

1. Initialize Git and commit the files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Mobile Call Log Stack System"
   ```
2. Create a new repository on [github.com](https://github.com/new).
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/call-log-stack-app.git
   git branch -M main
   git push -u origin main
   ```
4. Go to [vercel.com](https://vercel.com), click **"Add New Project"**, select your GitHub repository, and click **Deploy**.
5. Vercel will automatically build and provide a permanent live HTTPS link. Every time you push changes, Vercel updates automatically!

---

## 📲 How to Use Daily on Your Phone

1. Open your live Vercel URL on your mobile phone browser (Safari on iOS or Chrome on Android).
2. Tap the **Share** button in Safari or the **Menu (three dots)** in Chrome.
3. Tap **"Add to Home Screen"**.
4. The app will now appear with an icon on your phone's home screen and open in full-screen standalone mode!
