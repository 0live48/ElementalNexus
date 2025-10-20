// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Game Constants (to be shared with the client)
const ELEMENTS = ["Rock", "Paper", "Scissors", "Fire", "Water", "Earth", "Magic", "Lightning", "Darkness", "Plasma"];

// The central game state on the server
let gameLobby = []; // Sockets waiting for a game
let activeGames = {}; // { gameId: { player1Id, player2Id, player1Hand, player2Hand, ... } }
let gameCounter = 1;

// Serve static files (like index.html and game.js)
app.use(express.static('.')); 

server.listen(PORT, () => {
    console.log(`Server listening on *:${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- Lobby/Game Matching ---
    if (gameLobby.length > 0) {
        // Start a game with the waiting player
        const opponentSocket = gameLobby.pop();
        const gameId = `game-${gameCounter++}`;
        
        // Initialize hands for both players
        const player1Hand = initHand();
        const player2Hand = initHand();
        
        // Create the game state
        activeGames[gameId] = {
            id: gameId,
            player1Id: opponentSocket.id, // The one waiting is Player 1
            player2Id: socket.id,         // The new one is Player 2
            player1Hand: player1Hand,
            player2Hand: player2Hand,
            player1PlayedCard: null,
            player2PlayedCard: null
        };
        
        // Join rooms
        socket.join(gameId);
        opponentSocket.join(gameId);
        
        console.log(`Game ${gameId} started between ${opponentSocket.id} and ${socket.id}`);
        
        // Tell players the game is starting and send initial hands
        opponentSocket.emit('gameStart', { 
            gameId: gameId, 
            isPlayerOne: true, 
            hand: player1Hand, 
            opponentHandSize: player2Hand.length 
        });
        socket.emit('gameStart', { 
            gameId: gameId, 
            isPlayerOne: false, 
            hand: player2Hand, 
            opponentHandSize: player1Hand.length 
        });

    } else {
        // Wait for an opponent
        gameLobby.push(socket);
        socket.emit('waitingForOpponent');
        console.log(`Player ${socket.id} waiting for opponent.`);
    }

    // --- Game Logic ---
    socket.on('playCard', (data) => {
        const gameId = data.gameId;
        const cardIndex = data.cardIndex;
        const game = activeGames[gameId];

        if (!game) return;

        const isPlayerOne = socket.id === game.player1Id;
        
        let playerHand, playedCardRef, opponentPlayedCardRef;

        if (isPlayerOne) {
            playerHand = game.player1Hand;
            playedCardRef = 'player1PlayedCard';
            opponentPlayedCardRef = 'player2PlayedCard';
        } else {
            playerHand = game.player2Hand;
            playedCardRef = 'player2PlayedCard';
            opponentPlayedCardRef = 'player1PlayedCard';
        }
        
        // Check if the card index is valid and not already played
        if (cardIndex < 0 || cardIndex >= playerHand.length || game[playedCardRef] !== null) {
            socket.emit('error', 'Invalid move or already played.');
            return;
        }

        const playedCard = playerHand[cardIndex];
        game[playedCardRef] = { card: playedCard, handIndex: cardIndex };
        
        // Notify both players that a move has been made (without revealing the card)
        io.to(gameId).emit('opponentPlayed');
        
        console.log(`${socket.id} played card: ${playedCard.element}`);

        // Check if both players have played their card
        if (game.player1PlayedCard && game.player2PlayedCard) {
            resolveTurn(game, gameId);
        }
    });

    // --- Disconnect Handling ---
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // Remove from lobby if waiting
        gameLobby = gameLobby.filter(s => s.id !== socket.id);

        // Find and end active game
        for (const gameId in activeGames) {
            const game = activeGames[gameId];
            if (game.player1Id === socket.id || game.player2Id === socket.id) {
                const opponentId = (game.player1Id === socket.id) ? game.player2Id : game.player1Id;
                
                // Notify the opponent that the game has ended
                io.to(opponentId).emit('opponentDisconnected', 'Your opponent disconnected. You win!');
                
                delete activeGames[gameId];
                console.log(`Game ${gameId} ended due to disconnect.`);
                break;
            }
        }
    });
});

// --- Server-Side Utility Functions ---

function initHand() {
    const hand = [];
    for (let i = 0; i < 7; i++) {
      hand.push(createRandomCard());
    }
    return hand;
}

function createRandomCard() {
    const elementIndex = Math.floor(Math.random() * ELEMENTS.length);
    return {
      element: ELEMENTS[elementIndex],
      value: elementIndex + 1,
      elementIndex: elementIndex
    };
}

function resolveBattle(playerCard, opponentCard) {
    const p = playerCard.element;
    const o = opponentCard.element;

    if (p === o) return 0; // Tie
    if (p === "Plasma") return 1; // Player Wins
    if (o === "Plasma") return -1; // Player Loses

    // Simplified Win/Loss logic check
    const winsAgainst = {
        "Rock": ["Scissors", "Darkness", "Water"],
        "Paper": ["Rock", "Darkness", "Magic"],
        "Scissors": ["Paper", "Magic", "Lightning"],
        "Darkness": ["Scissors", "Lightning", "Earth"],
        "Magic": ["Darkness", "Earth", "Fire"],
        "Lightning": ["Magic", "Fire", "Water"],
        "Earth": ["Rock", "Paper", "Water"],
        "Fire": ["Rock", "Paper", "Earth"],
        "Water": ["Paper", "Scissors", "Darkness", "Lightning", "Fire"],
    };

    if (winsAgainst[p] && winsAgainst[p].includes(o)) {
        return 1; // Player Wins
    }
    return -1; // Player Loses
}

function resolveTurn(game, gameId) {
    const p1Card = game.player1PlayedCard.card;
    const p2Card = game.player2PlayedCard.card;
    const p1Index = game.player1PlayedCard.handIndex;
    const p2Index = game.player2PlayedCard.handIndex;
    
    // Resolve for Player 1's perspective
    const resultForP1 = resolveBattle(p1Card, p2Card);
    
    let resultTextP1, resultTextP2;
    let winnerId = null;

    if (resultForP1 === 1) { // P1 Wins
        game.player1Hand.push(createRandomCard());
        resultTextP1 = `Player: ${p1Card.element} vs Opponent: ${p2Card.element} → Player Wins!`;
        resultTextP2 = `Player: ${p2Card.element} vs Opponent: ${p1Card.element} → Player Loses!`;
        winnerId = game.player1Id;
    } else if (resultForP1 === -1) { // P1 Loses (P2 Wins)
        game.player2Hand.push(createRandomCard());
        resultTextP1 = `Player: ${p1Card.element} vs Opponent: ${p2Card.element} → Player Loses!`;
        resultTextP2 = `Player: ${p2Card.element} vs Opponent: ${p1Card.element} → Player Wins!`;
        winnerId = game.player2Id;
    } else { // Tie
        game.player1Hand.push(createRandomCard());
        game.player2Hand.push(createRandomCard());
        resultTextP1 = resultTextP2 = `Player: ${p1Card.element} vs Opponent: ${p2Card.element} → Tie!`;
    }

    // Remove played cards, careful with splice order to maintain correct indices
    // Must remove the higher index first to not shift the lower index.
    const sortedIndicesP1 = [p1Index, p2Index].sort((a, b) => b - a);

    // Remove from P1's hand
    game.player1Hand.splice(p1Index, 1);
    // Remove from P2's hand
    game.player2Hand.splice(p2Index, 1);
    
    // Check for game over
    let gameOver = false;
    let finalWinnerId = null;
    if (game.player1Hand.length === 0 && game.player2Hand.length === 0) {
        gameOver = true;
        finalWinnerId = 'Tie';
    } else if (game.player1Hand.length === 0) {
        gameOver = true;
        finalWinnerId = game.player2Id;
    } else if (game.player2Hand.length === 0) {
        gameOver = true;
        finalWinnerId = game.player1Id;
    }
    
    // Send results back to clients
    io.to(game.player1Id).emit('turnResult', { 
        resultText: resultTextP1, 
        yourHand: game.player1Hand, 
        opponentHandSize: game.player2Hand.length,
        gameOver: gameOver,
        finalWinnerId: finalWinnerId
    });
    
    io.to(game.player2Id).emit('turnResult', { 
        resultText: resultTextP2, 
        yourHand: game.player2Hand, 
        opponentHandSize: game.player1Hand.length,
        gameOver: gameOver,
        finalWinnerId: finalWinnerId
    });
    
    // Reset played cards for the next turn
    game.player1PlayedCard = null;
    game.player2PlayedCard = null;
    
    // Clean up game if over
    if (gameOver) {
        delete activeGames[gameId];
    }
}