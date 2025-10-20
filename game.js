// game.js
const socket = io(); // Connects to the server running on the same host/port

class MultiplayerGame {
    constructor() {
        this.socket = socket;
        this.gameId = null;
        this.playerHand = [];
        this.isPlayerTurn = false;
        this.hasPlayed = false;

        this.playerHandDiv = document.getElementById("player-hand");
        this.opponentHandDiv = document.getElementById("opponent-hand");
        this.resultDiv = document.getElementById("result");

        this.setupSocketListeners();
        this.renderHands(); // Render initial waiting state
    }

    setupSocketListeners() {
        this.socket.on('waitingForOpponent', () => {
            this.resultDiv.innerText = "Waiting for an opponent...";
        });

        this.socket.on('gameStart', (data) => {
            this.gameId = data.gameId;
            this.playerHand = data.hand;
            this.isPlayerOne = data.isPlayerOne;
            this.resultDiv.innerText = `Game started! You are ${this.isPlayerOne ? 'Player 1' : 'Player 2'}. Choose a card.`;
            this.renderHands(data.opponentHandSize);
        });

        this.socket.on('opponentPlayed', () => {
            this.resultDiv.innerText = "Opponent has played their card. Waiting for your move...";
        });
        
        this.socket.on('turnResult', (data) => {
            this.playerHand = data.yourHand;
            this.hasPlayed = false; // Reset for next turn
            
            this.resultDiv.innerText = data.resultText;
            this.renderHands(data.opponentHandSize);
            
            if (data.gameOver) {
                let finalResult = "Game Over! ";
                if (data.finalWinnerId === this.socket.id) {
                    finalResult += "YOU WIN!";
                } else if (data.finalWinnerId === 'Tie') {
                    finalResult += "IT'S A TIE!";
                } else {
                    finalResult += "You lose.";
                }
                this.resultDiv.innerText = finalResult;
                // Disable playing
                this.playerHandDiv.querySelectorAll('.player-card').forEach(card => card.onclick = null);
            }
        });
        
        this.socket.on('opponentDisconnected', (message) => {
            this.resultDiv.innerText = message;
            // Disable playing
            this.playerHandDiv.querySelectorAll('.player-card').forEach(card => card.onclick = null);
        });
        
        this.socket.on('error', (message) => {
            console.error(message);
            this.resultDiv.innerText = `Error: ${message}`;
            this.hasPlayed = false; // Allow another attempt
            this.renderHands(this.opponentHandDiv.children.length);
        });
    }

    renderHands(opponentHandSize = 0) {
        this.playerHandDiv.innerHTML = "";
        this.opponentHandDiv.innerHTML = "";

        // Player Hand
        this.playerHand.forEach((card, index) => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card player-card";
            cardDiv.innerText = card.element;
            
            // Only allow clicking if you haven't played this turn
            if (!this.hasPlayed) {
                cardDiv.onclick = () => this.playCard(index);
                cardDiv.title = "Click to play";
            } else {
                cardDiv.style.opacity = '0.5';
                cardDiv.style.cursor = 'default';
                cardDiv.title = "Waiting for opponent...";
            }
            
            this.playerHandDiv.appendChild(cardDiv);
        });

        // Opponent Hand (only show the count)
        for (let i = 0; i < opponentHandSize; i++) {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card opponent-card";
            cardDiv.innerText = "?";
            this.opponentHandDiv.appendChild(cardDiv);
        }
        
        // Use the saved card size preference for styling
        this.playerHandDiv.querySelectorAll('.card').forEach(card => {
            card.style.width = '2.5in'; // Use your saved preference
            card.style.height = '3.5in'; // Use your saved preference
        });
        this.opponentHandDiv.querySelectorAll('.card').forEach(card => {
            card.style.width = '2.5in'; // Use your saved preference
            card.style.height = '3.5in'; // Use your saved preference
        });
    }

    playCard(cardIndex) {
        if (!this.gameId) {
            this.resultDiv.innerText = "Game not started yet.";
            return;
        }
        if (this.hasPlayed) {
            this.resultDiv.innerText = "You have already played a card this turn. Waiting for opponent.";
            return;
        }

        this.hasPlayed = true; // Mark as played locally
        this.resultDiv.innerText = `You played ${this.playerHand[cardIndex].element}. Waiting for opponent...`;
        this.renderHands(this.opponentHandDiv.children.length); // Rerender to disable clicks
        
        // Send the move to the server
        this.socket.emit('playCard', { 
            gameId: this.gameId, 
            cardIndex: cardIndex 
        });
    }
}

// Initialize game
const game = new MultiplayerGame();