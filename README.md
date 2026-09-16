# Melodify - Premium Free Music Streaming

![Melodify Banner](https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=Melodify+Music+Streaming)

## 🎵 Features

### Core Features
- **Unlimited Music**: Access to billions of songs via Invidious API (YouTube backend)
- **Lossless Audio Quality**: Highest quality audio streams with excellent bass
- **Synced Lyrics**: Real-time lyrics display from LRCLIB
- **Free Forever**: No subscription, no ads, completely free

### Premium UI/UX
- **Glass Morphism Design**: Beautiful frosted glass effects
- **Smooth Animations**: Fluid transitions and hover effects
- **Responsive Layout**: Works perfectly on mobile, tablet, and desktop
- **Dark Theme**: Elegant dark gradient backgrounds
- **Rounded Corners**: Modern, smooth design throughout

### User Features
- **Account System**: Sign up/login with persistent sessions
- **User Profiles**: Custom avatars and listening statistics
- **Library Management**: Save liked songs and create playlists
- **Search**: Powerful search across the entire music catalog
- **Queue System**: Add tracks to queue and manage playback

### Player Features
- **Advanced Controls**: Play, pause, skip, seek, volume control
- **Lyrics Panel**: View synced lyrics while listening
- **Volume Control**: Fine-grained volume adjustment with mute
- **Auto-play**: Automatically play next track in queue

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/melodify.git
cd melodify

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
melodify/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React contexts (Auth, Player)
│   ├── pages/            # Page components
│   ├── services/         # API services (music, lyrics)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── tailwind.config.js    # Tailwind config
```

## 🔧 Configuration

### Environment Variables
No environment variables required! The app uses public APIs.

### API Sources
- **Music**: Invidious API (YouTube alternative frontend)
- **Lyrics**: LRCLIB (free lyrics database)
- **Thumbnails**: YouTube/Invidious

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom glass morphism
- **Build Tool**: Vite (fast HMR and optimized builds)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Audio**: HTML5 Audio API

## 🌟 Key Technologies

### Invidious API
Privacy-respecting YouTube frontend that provides access to YouTube's music catalog without tracking.

### LRCLIB
Free, open-source lyrics database with synchronized lyrics support.

## 📱 Responsive Design

The app is fully responsive and works on:
- 📱 Mobile devices (iOS/Android)
- 📱 Tablets (iPad, Android tablets)
- 💻 Desktop (Windows, macOS, Linux)
- 🖥️ Large screens and TVs

## 🔐 Privacy & Legal

- No user tracking
- No cookies (except local storage for preferences)
- Uses public APIs only
- No copyrighted content hosted
- All data stored locally in browser

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Invidious team for the amazing API
- LRCLIB for free lyrics
- Tailwind CSS for the utility-first CSS framework
- Lucide for beautiful icons

---

Made with ❤️ by the Melodify Team
