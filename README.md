
# 🛡️ Sentinel AI - Enterprise Scam Defense

> **A Local-First, Privacy-Focused Threat Intelligence Engine.**

Sentinel AI is an advanced cybersecurity tool designed to detect digital fraud, social engineering attacks, and malicious network entities (IPs/URLs) in real-time.

![Sentinel AI Banner](https://i.imgur.com/your-banner-placeholder.png)

## 🚀 Features

- **🧠 Neural Message Scanner**: specialized AI analyzes WhatsApp/SMS text for cognitive manipulation patterns (Urgency, Authority, Emotional triggers).
- **🕵️ Threat Hunter**: Unified interface to scan IP Addresses (via AbuseIPDB) and URLs (via VirusTotal).
- **🔒 Privacy-First Architecture**: Message analysis runs 100% locally in the browser. No text data leaves your device.
- **📱 Responsive Glassmorphism UI**: Premium "Liquid Glass" aesthetic optimized for Mobile, Tablet, and Desktop.
- **⚡ Enterprise Performance**: Zero-lag animations, 60fps canvas particle effects, and instant results.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express (Proxy for API keys)
- **APIs**: VirusTotal v3, AbuseIPDB v2
- **Animations**: Custom CSS Keyframes, HTML5 Canvas

## 📦 Installation

This project uses a **Monorepo** structure (Frontend + Backend in one).

### Prerequisites
- Node.js (v16 or higher)
- npm

### Quick Start (One Command)

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sentinel-ai.git
   cd sentinel-ai
   ```

2. **Install & Start**
   Run this single command to install dependencies for Root, Frontend, and Backend, and start them simultaneously:
   ```bash
   npm run install-all
   npm start
   ```

3. **Access the App**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:10000`

## 🌍 Deployment Guide (Render.com)

You do **not** need `vercel.json` for Render. You can delete that file.

### Step 1: Deploy Backend (Web Service)

1. Create a New **Web Service**.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. **Environment Variables**:
   - `VT_API_KEY`: Your VirusTotal API Key
   - `ABUSE_IP_KEY`: Your AbuseIPDB API Key

### Step 2: Deploy Frontend (Static Site)

1. Create a New **Static Site**.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `build`
5. **Environment Variables**:
   - `REACT_APP_BACKEND_URL`: The URL of your deployed Backend (e.g., `https://sentinel-backend.onrender.com`)

### ⚠️ CRITICAL: Fix Page Refresh (404 Errors)

Since this is a Single Page App (SPA), you must tell Render to redirect all traffic to `index.html` so React can handle the routing.

1. Go to your Frontend **Static Site** in the Render Dashboard.
2. Click on **Redirects/Rewrites**.
3. Add a new rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
4. Save Changes.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Created by Rajarshi Chakraborty*
