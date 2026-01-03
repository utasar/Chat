# Chat

A modern, feature-rich real-time chat application with AI assistant integration.

## Features

### 🤖 AI Assistant (Lekhandas)
- AI-powered chatbot using OpenAI API for natural language conversations
- Remembers limited user-specific information for personalized interactions
- Always available when no human users are online
- Fallback responses when OpenAI API is not configured

### 🎨 Modern User Interface
- Beautiful gradient-based design with smooth animations
- Dark/Light theme toggle with persistent preferences
- Typing indicators showing when someone is typing
- Message animations (slide-in, fade-in effects)
- Profile pictures with hover effects
- Smooth scrolling and transitions

### 🎮 Engaging Features
- **Emoji Picker**: Easy emoji selection for messages
- **Emoji Reactions**: React to messages with quick emoji buttons (❤️, 👍, 😂)
- **Customizable Themes**: Toggle between light and dark modes
- **Mini-Games**: 
  - Tic-Tac-Toe: Classic two-player game
  - Guess the Number: Fun number guessing game (1-100)

### ⚡ Backend & Real-time Features
- Node.js + Express backend server
- WebSocket integration using Socket.io for real-time messaging
- User preferences storage (JSON-based)
- Scalable architecture for multiple simultaneous connections
- Typing indicators and online status

## Installation

1. Clone the repository:
```bash
git clone https://github.com/utasar/Chat.git
cd Chat
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. (Optional) Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Note: The AI assistant (Lekhandas) will work with fallback responses even without an OpenAI API key.

5. Start the server:
```bash
npm start
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Sign Up/Login**: Start by creating an account or logging in
2. **Select Chat Partner**: Choose a user or chat with Lekhandas (AI Assistant)
3. **Send Messages**: Type and send messages with real-time delivery
4. **Use Emojis**: Click the emoji button to add emojis to your messages
5. **React to Messages**: Hover over incoming messages to see reaction options
6. **Play Games**: Click the game button to access mini-games
7. **Toggle Theme**: Use the theme toggle button to switch between light and dark modes

## Project Structure

```
Chat/
├── CHAT/
│   ├── chat.html          # Main chat interface
│   ├── users.html         # User selection page
│   ├── index.html         # Sign up page
│   ├── login.html         # Login page
│   ├── style.css          # Enhanced styles with themes
│   ├── img.jpg            # Default avatar image
│   └── javascript/
│       ├── chat.js        # Chat functionality with WebSocket
│       └── javascript/
│           ├── users.js   # User list functionality
│           └── pass-show-hide.js  # Password visibility toggle
├── server.js              # Node.js server with Socket.io and OpenAI
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
└── README.md             # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.io (WebSocket)
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Styling**: Custom CSS with CSS Variables, Gradients, Animations
- **Icons**: Font Awesome

## Features in Detail

### Theme System
The application supports both light and dark themes:
- Preferences are saved to localStorage
- Smooth transitions between themes
- All components adapt to the selected theme

### AI Assistant
Lekhandas provides:
- Natural conversation using OpenAI GPT-3.5-turbo
- Context-aware responses (remembers last 10 messages)
- Personality: Friendly, helpful, and engaging
- Suggests activities and games
- Works with fallback responses if API is not configured

### Mini-Games
Interactive games to keep users engaged:
- **Tic-Tac-Toe**: Classic strategy game
- **Guess the Number**: Try to guess the random number with hints

## Development

For development with auto-reload:
```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

