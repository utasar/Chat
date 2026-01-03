// Connect to Socket.io server
const socket = io('http://localhost:3000');

// DOM Elements
const chatBox = document.getElementById('chatBox');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const typingIndicator = document.getElementById('typingIndicator');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const themeToggle = document.getElementById('themeToggle');
const gameBtn = document.getElementById('gameBtn');
const gameModal = document.getElementById('gameModal');
const closeGame = document.getElementById('closeGame');

// Current user and chat partner
let currentUser = {
    id: 'user_' + Date.now(),
    name: 'You',
    avatar: 'img.jpg'
};

let chatPartner = {
    id: 'lekhandas',
    name: 'Lekhandas (AI Assistant)',
    avatar: 'img.jpg',
    isAI: true
};

// Get chat partner from URL params or default to Lekhandas
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('user')) {
    chatPartner.id = urlParams.get('user');
    chatPartner.name = urlParams.get('name') || 'User';
    chatPartner.isAI = false;
}

document.getElementById('chatUserName').textContent = chatPartner.name;

// Theme Management
let currentTheme = localStorage.getItem('chatTheme') || 'light';
applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('chatTheme', currentTheme);
});

function applyTheme(theme) {
    document.body.className = theme + '-theme';
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Socket.io Event Handlers
socket.on('connect', () => {
    socket.emit('user-joined', currentUser);
    
    // Add welcome message from Lekhandas if chatting with AI
    if (chatPartner.isAI) {
        setTimeout(() => {
            addMessage({
                from: 'lekhandas',
                message: "Hello! I'm Lekhandas, your AI companion. I'm here to chat with you anytime! 😊",
                timestamp: new Date().toISOString()
            }, 'incoming');
        }, 500);
    }
});

socket.on('chat-message', (data) => {
    if (data.from === chatPartner.id) {
        addMessage(data, 'incoming');
        playNotificationSound();
    }
});

socket.on('typing-indicator', (data) => {
    if (data.from === chatPartner.id) {
        typingIndicator.style.display = data.typing ? 'flex' : 'none';
        if (data.typing) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
});

// Message Form Submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message) {
        // Add message to chat
        addMessage({
            from: currentUser.id,
            message: message,
            timestamp: new Date().toISOString()
        }, 'outgoing');
        
        // Emit to server
        socket.emit('chat-message', {
            to: chatPartner.id,
            from: currentUser.id,
            message: message
        });
        
        messageInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

// Typing Indicator
let typingTimeout;
messageInput.addEventListener('input', () => {
    socket.emit('typing', { to: chatPartner.id, typing: true });
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing', { to: chatPartner.id, typing: false });
    }, 1000);
});

// Add Message to Chat
function addMessage(data, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat ${type} message-animate`;
    
    if (type === 'incoming') {
        messageDiv.innerHTML = `
            <img src="${chatPartner.avatar}" alt="">
            <div class="details">
                <p>${escapeHtml(data.message)}</p>
                <div class="message-actions">
                    <button class="emoji-react" data-emoji="❤️">❤️</button>
                    <button class="emoji-react" data-emoji="👍">👍</button>
                    <button class="emoji-react" data-emoji="😂">😂</button>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="details">
                <p>${escapeHtml(data.message)}</p>
            </div>
        `;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Add click handlers for emoji reactions
    messageDiv.querySelectorAll('.emoji-react').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const emoji = e.target.dataset.emoji;
            showEmojiReaction(messageDiv, emoji);
        });
    });
}

// Show Emoji Reaction
function showEmojiReaction(messageDiv, emoji) {
    const reaction = document.createElement('span');
    reaction.className = 'reaction-popup';
    reaction.textContent = emoji;
    messageDiv.querySelector('.details').appendChild(reaction);
    
    setTimeout(() => reaction.remove(), 2000);
}

// Emoji Picker
emojiBtn.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

emojiPicker.addEventListener('click', (e) => {
    if (e.target.matches('.emoji-grid')) return;
    
    const emoji = e.target.textContent.trim();
    if (emoji) {
        messageInput.value += emoji;
        messageInput.focus();
    }
});

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-btn')) {
        emojiPicker.style.display = 'none';
    }
});

// Mini-Games
gameBtn.addEventListener('click', () => {
    gameModal.style.display = 'flex';
});

closeGame.addEventListener('click', () => {
    gameModal.style.display = 'none';
});

document.querySelectorAll('.game-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const game = e.currentTarget.dataset.game;
        loadGame(game);
    });
});

function loadGame(gameType) {
    const gameArea = document.getElementById('gameArea');
    
    if (gameType === 'tictactoe') {
        gameArea.innerHTML = `
            <div class="tictactoe-game">
                <h4>Tic Tac Toe</h4>
                <div class="tictactoe-board">
                    ${Array(9).fill().map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
                </div>
                <button class="reset-game">Reset Game</button>
            </div>
        `;
        initTicTacToe();
    } else if (gameType === 'guess') {
        gameArea.innerHTML = `
            <div class="guess-game">
                <h4>Guess the Number (1-100)</h4>
                <p>I'm thinking of a number between 1 and 100!</p>
                <input type="number" id="guessInput" min="1" max="100" placeholder="Enter your guess">
                <button id="guessBtn">Guess</button>
                <p id="guessResult"></p>
                <p id="guessAttempts">Attempts: 0</p>
            </div>
        `;
        initGuessGame();
    }
}

// Tic Tac Toe Game
function initTicTacToe() {
    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;
    
    const cells = document.querySelectorAll('.cell');
    const resetBtn = document.querySelector('.reset-game');
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const index = cell.dataset.index;
            
            if (board[index] === '' && gameActive) {
                board[index] = currentPlayer;
                cell.textContent = currentPlayer;
                cell.classList.add(currentPlayer);
                
                if (checkWin()) {
                    setTimeout(() => alert(`${currentPlayer} wins!`), 100);
                    gameActive = false;
                } else if (board.every(cell => cell !== '')) {
                    setTimeout(() => alert("It's a draw!"), 100);
                    gameActive = false;
                } else {
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                }
            }
        });
    });
    
    resetBtn.addEventListener('click', () => {
        board = Array(9).fill('');
        currentPlayer = 'X';
        gameActive = true;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('X', 'O');
        });
    });
    
    function checkWin() {
        return winningConditions.some(condition => {
            return condition.every(index => board[index] === currentPlayer);
        });
    }
}

// Guess the Number Game
function initGuessGame() {
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    
    const guessInput = document.getElementById('guessInput');
    const guessBtn = document.getElementById('guessBtn');
    const result = document.getElementById('guessResult');
    const attemptsDisplay = document.getElementById('guessAttempts');
    
    guessBtn.addEventListener('click', () => {
        const guess = parseInt(guessInput.value);
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
            result.textContent = 'Please enter a valid number between 1 and 100!';
            result.style.color = '#f44336';
            return;
        }
        
        attempts++;
        attemptsDisplay.textContent = `Attempts: ${attempts}`;
        
        if (guess === targetNumber) {
            result.textContent = `🎉 Correct! You found it in ${attempts} attempts!`;
            result.style.color = '#4CAF50';
            guessBtn.disabled = true;
        } else if (guess < targetNumber) {
            result.textContent = '📈 Too low! Try a higher number.';
            result.style.color = '#FF9800';
        } else {
            result.textContent = '📉 Too high! Try a lower number.';
            result.style.color = '#FF9800';
        }
        
        guessInput.value = '';
        guessInput.focus();
    });
    
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            guessBtn.click();
        }
    });
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function playNotificationSound() {
    // Simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Load user preferences
fetch(`/api/preferences/${currentUser.id}`)
    .then(res => res.json())
    .then(prefs => {
        if (prefs.theme) {
            currentTheme = prefs.theme;
            applyTheme(currentTheme);
        }
    })
    .catch(err => console.log('No saved preferences'));
