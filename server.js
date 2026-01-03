const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'CHAT')));

// Store connected users
const users = new Map();
const userPreferencesFile = path.join(__dirname, 'user-preferences.json');

// Load user preferences
async function loadUserPreferences() {
    try {
        const data = await fs.readFile(userPreferencesFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save user preferences
async function saveUserPreferences(preferences) {
    try {
        await fs.writeFile(userPreferencesFile, JSON.stringify(preferences, null, 2));
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

// API Routes
app.get('/api/preferences/:userId', async (req, res) => {
    const preferences = await loadUserPreferences();
    res.json(preferences[req.params.userId] || {});
});

app.post('/api/preferences/:userId', async (req, res) => {
    const preferences = await loadUserPreferences();
    preferences[req.params.userId] = {
        ...preferences[req.params.userId],
        ...req.body
    };
    await saveUserPreferences(preferences);
    res.json({ success: true });
});

// AI Assistant (Lekhandas) Integration
let openaiClient = null;
const conversationHistory = new Map();

// Initialize OpenAI client
function initializeOpenAI() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        try {
            const { OpenAI } = require('openai');
            openaiClient = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            console.log('OpenAI client initialized successfully');
        } catch (error) {
            console.log('OpenAI not configured, Lekhandas will use fallback responses');
        }
    } else {
        console.log('OpenAI API key not set, Lekhandas will use fallback responses');
    }
}

initializeOpenAI();

// Lekhandas personality and fallback responses
const lekhandasResponses = [
    "Hi there! I'm Lekhandas, your friendly AI companion. How can I help you today?",
    "That's an interesting point! Tell me more about what you're thinking.",
    "I'm here to chat whenever you need someone to talk to. What's on your mind?",
    "Great question! Let me think about that for a moment...",
    "I love chatting with you! What would you like to discuss?",
    "That sounds fascinating! I'd love to hear more details.",
    "I'm always learning from our conversations. Thank you for sharing!",
    "As an AI assistant, I find that topic quite intriguing!",
    "Would you like to play a game while we chat? I know a few fun ones!",
    "Remember, I'm here to make your chat experience more enjoyable!"
];

async function getLekhandasResponse(userId, message) {
    // If OpenAI is configured, use it
    if (openaiClient) {
        try {
            // Get or create conversation history
            if (!conversationHistory.has(userId)) {
                conversationHistory.set(userId, [
                    {
                        role: 'system',
                        content: 'You are Lekhandas, a friendly and helpful AI chat assistant. You remember limited user-specific information for fun interactions. Keep responses conversational, warm, and engaging. Sometimes suggest fun activities or mini-games.'
                    }
                ]);
            }

            const history = conversationHistory.get(userId);
            history.push({ role: 'user', content: message });

            // Keep only last 10 messages to manage context
            if (history.length > 11) {
                history.splice(1, history.length - 11);
            }

            const response = await openaiClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: history,
                max_tokens: 150,
                temperature: 0.8
            });

            const assistantMessage = response.choices[0].message.content;
            history.push({ role: 'assistant', content: assistantMessage });

            return assistantMessage;
        } catch (error) {
            console.error('OpenAI API error:', error.message);
            // Fall back to random responses
        }
    }

    // Fallback responses
    if (message.toLowerCase().includes('game')) {
        return "I'd love to play! Try the mini-games feature - you can play tic-tac-toe or guess the number game!";
    } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        return "Hello! I'm Lekhandas, your AI friend. I'm here to chat and keep you company!";
    } else {
        return lekhandasResponses[Math.floor(Math.random() * lekhandasResponses.length)];
    }
}

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // User joins
    socket.on('user-joined', (userData) => {
        users.set(socket.id, userData);
        socket.broadcast.emit('user-connected', userData);
        
        // Send current users list
        socket.emit('users-list', Array.from(users.values()));
    });

    // Handle chat messages
    socket.on('chat-message', async (data) => {
        const { to, message, from } = data;
        
        // If message is to Lekhandas (AI)
        if (to === 'lekhandas') {
            socket.emit('typing-indicator', { from: 'lekhandas', typing: true });
            
            const response = await getLekhandasResponse(socket.id, message);
            
            setTimeout(() => {
                socket.emit('chat-message', {
                    from: 'lekhandas',
                    message: response,
                    timestamp: new Date().toISOString()
                });
                socket.emit('typing-indicator', { from: 'lekhandas', typing: false });
            }, 1000 + Math.random() * 1000); // Random delay for realistic typing
        } else {
            // Regular user-to-user message
            io.to(to).emit('chat-message', {
                from: from,
                message: message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Typing indicator
    socket.on('typing', (data) => {
        socket.to(data.to).emit('typing-indicator', {
            from: socket.id,
            typing: data.typing
        });
    });

    // User disconnect
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        users.delete(socket.id);
        io.emit('user-disconnected', socket.id);
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Chat app available at http://localhost:${PORT}`);
});
