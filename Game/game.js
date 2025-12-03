// game.js - The Mechanics

const GameEngine = {
    playerDeck: [],
    opponentDeck: [],
    playerHand: [],
    opponentHand: [],

    // The 9 Elements (Cosmic Removed)
    elementsList: ["Rock", "Paper", "Scissors", "Darkness", "Magic", "Lightning", "Earth", "Fire", "Water"],

    // BATTLE MATRIX (9x9 Grid)
    // Removed the 10th column (Cosmic interactions) from every row
    // Removed the "Cosmic" row entirely
    matrix: {
        "Rock":      ["T", "L", "W", "W", "T", "T", "L", "L", "W"], 
        "Paper":     ["W", "T", "L", "W", "W", "T", "T", "L", "L"], 
        "Scissors":  ["L", "W", "T", "L", "W", "W", "T", "T", "L"], 
        "Darkness":  ["L", "L", "W", "T", "L", "L", "W", "T", "T"], 
        "Magic":     ["T", "L", "L", "W", "T", "L", "W", "W", "T"], 
        "Lightning": ["T", "T", "L", "L", "W", "T", "L", "W", "W"], 
        "Earth":     ["W", "T", "T", "L", "L", "W", "T", "L", "W"], 
        "Fire":      ["W", "W", "T", "T", "L", "L", "W", "T", "L"], 
        "Water":     ["L", "W", "W", "T", "T", "L", "L", "W", "T"] 
    },

    // Initialize a Battle
    startBattle: function(pDeck, oDeck) {
        this.playerDeck = [...pDeck]; 
        this.opponentDeck = [...oDeck]; 
        this.playerHand = [];
        this.opponentHand = [];
        
        // Shuffle Decks
        this.shuffle(this.playerDeck);
        this.shuffle(this.opponentDeck);

        // Draw initial 5 cards (Survival Mode)
        for(let i=0; i<5; i++) {
            this.drawCard('player');
            this.drawCard('opponent');
        }

        this.render();
        this.updateHUD();
    },

    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    drawCard: function(who) {
        if(who === 'player' && this.playerDeck.length > 0) {
            this.playerHand.push(this.playerDeck.pop());
        } else if(who === 'opponent' && this.opponentDeck.length > 0) {
            this.opponentHand.push(this.opponentDeck.pop());
        }
    },

    resolveBattle: function(pCard, oCard) {
        const row = this.matrix[pCard];
        const colIndex = this.elementsList.indexOf(oCard);

        if (!row || colIndex === -1) {
            console.error("Invalid card interaction:", pCard, oCard);
            return "Tie";
        }

        const resultKey = row[colIndex];

        if (resultKey === "W") return "Win";
        if (resultKey === "L") return "Lose";
        return "Tie";
    },

    playTurn: function(handIndex) {
        if(this.playerHand.length === 0 || this.opponentHand.length === 0) return;

        // 1. Get Cards
        const pCard = this.playerHand[handIndex];
        const oppIndex = Math.floor(Math.random() * this.opponentHand.length);
        const oCard = this.opponentHand[oppIndex];

        // 2. Resolve Result
        let result = this.resolveBattle(pCard, oCard);
        
        // 3. Update Visuals
        document.getElementById("center-battle").innerText = `${pCard} vs ${oCard} -> ${result}`;

        // 4. DESTROY CARDS
        this.playerHand.splice(handIndex, 1);
        this.opponentHand.splice(oppIndex, 1);

        // 5. SURVIVAL RULES
        if (result === "Win") {
            this.drawCard('player'); 
        } 
        else if (result === "Lose") {
            this.drawCard('opponent');
        } 
        else {
            this.drawCard('player');
            this.drawCard('opponent');
        }

        this.render();
        this.updateHUD();

        // 6. GAME OVER CHECK
        setTimeout(() => {
            if(this.playerHand.length === 0) {
                StoryModule.battleOver("Lose");
            } else if(this.opponentHand.length === 0) {
                StoryModule.battleOver("Win");
            }
        }, 200);
    },

    render: function() {
        const pDiv = document.getElementById("player-hand");
        const oDiv = document.getElementById("opponent-hand");
        
        pDiv.innerHTML = "";
        oDiv.innerHTML = "";

        this.playerHand.forEach((card, i) => {
            let el = document.createElement("div");
            el.className = "card player-card";
            el.innerText = card;
            el.onclick = () => this.playTurn(i);
            pDiv.appendChild(el);
        });

        this.opponentHand.forEach(() => {
            let el = document.createElement("div");
            el.className = "card";
            el.innerText = "?";
            oDiv.appendChild(el);
        });
    },

    updateHUD: function() {
        document.getElementById("player-deck-count").innerText = this.playerDeck.length;
        document.getElementById("opp-deck-count").innerText = this.opponentDeck.length;
    }
};