type ElementName =
  | "Rock"
  | "Paper"
  | "Scissors"
  | "Fire"
  | "Water"
  | "Earth"
  | "Magic"
  | "Lightning"
  | "Darkness"
  | "Plasma";

class Card {
  element: ElementName;
  value: number;
  constructor(element: ElementName, value: number) {
    this.element = element;
    this.value = value;
  }
}

class Player {
  hand: Card[] = [];
  constructor(public name: string) {}
}

class Game {
  elements: ElementName[] = [
    "Rock",
    "Paper",
    "Scissors",
    "Fire",
    "Water",
    "Earth",
    "Magic",
    "Lightning",
    "Darkness",
    "Plasma",
  ];
  player: Player;
  opponent: Player;
  maxHandSize = 7;

  constructor() {
    this.player = new Player("Player");
    this.opponent = new Player("Opponent");
    this.startGame();
  }

  startGame() {
    this.player.hand = this.generateHand();
    this.opponent.hand = this.generateHand();
    this.renderHands();
  }

  generateHand(): Card[] {
    const hand: Card[] = [];
    for (let i = 0; i < this.maxHandSize; i++) {
      const value = Math.floor(Math.random() * 60) + 1;
      const elementIndex = Math.floor((value - 1) / 6);
      const element = this.elements[elementIndex] || "Plasma";
      hand.push(new Card(element, value));
    }
    return hand;
  }

  renderHands() {
    const playerDiv = document.getElementById("player-hand")!;
    playerDiv.innerHTML = "";
    this.player.hand.forEach((card, index) => {
      const btn = document.createElement("button");
      btn.className = "button";
      btn.innerText = card.element;
      btn.onclick = () => this.playCard(index);
      playerDiv.appendChild(btn);
    });

    const oppDiv = document.getElementById("opponent-hand")!;
    oppDiv.innerHTML = `Opponent has ${this.opponent.hand.length} cards`;
  }

  playCard(playerIndex: number) {
    if (this.player.hand.length === 0 || this.opponent.hand.length === 0) return;

    const playerCard = this.player.hand[playerIndex];
    const opponentIndex = Math.floor(Math.random() * this.opponent.hand.length);
    const opponentCard = this.opponent.hand[opponentIndex];

    const result = this.resolveClash(playerCard.element, opponentCard.element);
    const resultDiv = document.getElementById("result")!;
    resultDiv.innerText = `You played ${playerCard.element}. Opponent played ${opponentCard.element}. ${result}`;

    // Handle drawing
    if (result.includes("Player Wins")) {
      if (this.player.hand.length < this.maxHandSize) this.player.hand.push(this.drawCard());
    } else if (result.includes("Tie")) {
      if (this.player.hand.length < this.maxHandSize) this.player.hand.push(this.drawCard());
      if (this.opponent.hand.length < this.maxHandSize) this.opponent.hand.push(this.drawCard());
    } else {
      if (this.opponent.hand.length < this.maxHandSize) this.opponent.hand.push(this.drawCard());
    }

    this.player.hand.splice(playerIndex, 1);
    this.opponent.hand.splice(opponentIndex, 1);

    if (this.player.hand.length === 0 || this.opponent.hand.length === 0) {
      resultDiv.innerText += "\nGame Over!";
    }

    this.renderHands();
  }

  drawCard(): Card {
    const value = Math.floor(Math.random() * 60) + 1;
    const elementIndex = Math.floor((value - 1) / 6);
    const element = this.elements[elementIndex] || "Plasma";
    return new Card(element, value);
  }

  resolveClash(player: ElementName, opponent: ElementName): string {
    if (player === "Plasma" && opponent === "Plasma") return "Tie!";
    if (player === "Plasma") return "Player Wins!";
    if (opponent === "Plasma") return "Player Loses!";
    if (player === opponent) return "Tie!";

    const rules: Record<ElementName, ElementName[]> = {
      Rock: ["Scissors", "Darkness", "Water"],
      Paper: ["Rock", "Darkness", "Magic"],
      Scissors: ["Paper", "Magic", "Lightning"],
      Fire: ["Rock", "Paper", "Earth"],
      Water: ["Paper", "Scissors", "Darkness", "Lightning", "Fire"],
      Earth: ["Rock", "Paper", "Water"],
      Magic: ["Darkness", "Earth", "Fire"],
      Lightning: ["Magic", "Fire", "Water"],
      Darkness: ["Scissors", "Lightning", "Earth"],
      Plasma: [],
    };

    return rules[player].includes(opponent) ? "Player Wins!" : "Player Loses!";
  }
}

// Initialize game
window.onload = () => new Game();
