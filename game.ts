interface Card {
    element: string;
    value: number;
    elementIndex: number;
}

class Game {
    private playerHand: Card[] = [];
    private opponentHand: Card[] = [];
    private elements: string[] = ["Rock", "Paper", "Scissors", "Fire", "Water", "Earth", "Magic", "Lightning", "Darkness", "Plasma"];
    
    private playerHandDiv: HTMLElement;
    private opponentHandDiv: HTMLElement;
    private resultDiv: HTMLElement;

    constructor() {
        const playerDiv = document.getElementById("player-hand");
        const opponentDiv = document.getElementById("opponent-hand");
        const resultDiv = document.getElementById("result");

        if (!playerDiv || !opponentDiv || !resultDiv) {
            throw new Error("One or more required HTML elements are missing!");
        }

        this.playerHandDiv = playerDiv;
        this.opponentHandDiv = opponentDiv;
        this.resultDiv = resultDiv;

        this.initHands();
        this.renderHands();
    }

    private initHands(): void {
        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.createRandomCard());
            this.opponentHand.push(this.createRandomCard());
        }
    }

    private createRandomCard(): Card {
        const elementIndex = Math.floor(Math.random() * this.elements.length);
        return {
            element: this.elements[elementIndex],
            value: elementIndex + 1,
            elementIndex
        };
    }

    private renderHands(): void {
        this.playerHandDiv.innerHTML = "";
        this.opponentHandDiv.innerHTML = "";

        this.playerHand.forEach((card, index) => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card player-card";
            cardDiv.innerText = card.element;
            cardDiv.onclick = () => this.playTurn(index);
            this.playerHandDiv.appendChild(cardDiv);
        });

        this.opponentHand.forEach(() => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card opponent-card";
            cardDiv.innerText = "X"; // Hidden opponent card
            this.opponentHandDiv.appendChild(cardDiv);
        });
    }

    private playTurn(playerIndex: number): void {
        if (this.playerHand.length === 0 || this.opponentHand.length === 0) return;

        const playerCard = this.playerHand[playerIndex];
        const opponentIndex = Math.floor(Math.random() * this.opponentHand.length);
        const opponentCard = this.opponentHand[opponentIndex];

        const result = this.resolveBattle(playerCard, opponentCard);
        this.resultDiv.innerText = `Player: ${playerCard.element} vs Opponent: ${opponentCard.element} → ${result}`;

        // Draw logic
        if (result.includes("Player Wins")) {
            this.playerHand.push(this.createRandomCard());
        } else if (result.includes("Player Loses")) {
            this.opponentHand.push(this.createRandomCard());
        } else { // Tie
            this.playerHand.push(this.createRandomCard());
            this.opponentHand.push(this.createRandomCard());
        }

        // Remove played cards
        this.playerHand.splice(playerIndex, 1);
        this.opponentHand.splice(opponentIndex, 1);

        this.renderHands();

        // Check for game over
        if (this.playerHand.length === 0 || this.opponentHand.length === 0) {
            this.resultDiv.innerText += " | Game Over!";
        }
    }

    private resolveBattle(playerCard: Card, opponentCard: Card): string {
        const p = playerCard.element;
        const o = opponentCard.element;

        if (p === o) return "Tie!";
        if (p === "Plasma") return "Player Wins!";
        if (o === "Plasma") return "Player Loses!";

        switch (p) {
            case "Rock":
                if (["Scissors", "Darkness", "Water"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Paper":
                if (["Rock", "Darkness", "Magic"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Scissors":
                if (["Paper", "Magic", "Lightning"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Darkness":
                if (["Scissors", "Lightning", "Earth"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Magic":
                if (["Darkness", "Earth", "Fire"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Lightning":
                if (["Magic", "Fire", "Water"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Earth":
                if (["Rock", "Paper", "Water"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Fire":
                if (["Rock", "Paper", "Earth"].includes(o)) return "Player Wins!";
                return "Player Loses!";
            case "Water":
                if (["Paper", "Scissors", "Darkness", "Lightning", "Fire"].includes(o)) return "Player Wins!";
                return "Player Loses!";
        }

        return "Tie!";
    }
}

// Initialize game
const game = new Game();
