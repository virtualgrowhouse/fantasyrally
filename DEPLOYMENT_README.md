# Fantasy Rally Hub

A comprehensive 3D car collection and racing hub with integrated AI image generation capabilities.

## Features

### 🎮 Racing Hub
- **Interactive Bubble Interface** - Navigate through 11 main modules
- **3D Car Viewer** - Explore car models in real-time 3D
- **User Authentication** - Sign up/login system with profiles
- **Social Features** - Friends, groups, and community integration

### 🎨 AI Image Generator
- **Interior Design Generator** - Create stunning interior visualizations
- **Architecture Generator** - Design architectural concepts
- **Interactive Word Bubbles** - 1200+ design terms to enhance prompts
- **HD Output** - High-resolution image generation

### 🎲 Car Randomizer
- **Perchance Integration** - Generate random car specifications
- **Multiple Car Types** - Sedan, Coupe, Truck, Go-Kart, Motorcycle
- **JSON Export** - Save car data for Unity integration

### 🏗️ Additional Modules
- **Market** - Buy/sell cars, auctions, dealerships
- **Garage** - Customize, paint, and manage car collection
- **Tune** - Engine, suspension, tires, ECU modifications
- **Workshop** - Custom parts and livery editor
- **Career** - Story mode and challenges
- **Events** - Special events and leaderboards

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Engine**: Three.js for 3D model rendering
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express (deployed on Railway)
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Quick Start

1. **Visit the live app**: [fantasy-rally-hub.vercel.app](https://fantasy-rally-hub.vercel.app)
2. **Sign up** using the green "Sign Up" button in the header
3. **Explore modules** by hovering over bubble icons
4. **Try AI Generator** - Click the AI Gen bubble (🎨)
5. **Generate cars** - Click Perchance bubble (🎲)

## Development

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

## Authentication

The app includes a complete authentication system:
- **Sign Up**: Create new accounts with username, email, display name
- **Login**: Secure JWT-based authentication
- **Profiles**: User stats, credits, level system
- **Session Management**: Persistent login with localStorage

## AI Integration

- **Prompt Building**: Click word bubbles to build AI prompts
- **Dual Generators**: Separate interior and architecture tools
- **Random Ideas**: Built-in inspiration generators
- **HD Output**: High-resolution image generation

---

🚗 **Fantasy Rally Hub** - Where car dreams become reality!