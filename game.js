// game.js - The Mechanics Engine (Final Strict Version)

const GameEngine = {
    playerDeck: [], opponentDeck: [],
    playerHand: [], opponentHand: [],
    graveyard: { player: [], opponent: [] },

    elementsList: ["Rock", "Paper", "Scissors", "Darkness", "Magic", "Lightning", "Earth", "Fire", "Water"],
    
    // BATTLE MATRIX (Verified against your spreadsheet image)
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

    startBattle: function(pDeck, oDeck) {
        this.playerDeck = [...pDeck]; 
        this.opponentDeck = [...oDeck]; 
        this.playerHand = []; this.opponentHand = [];
        this.graveyard = { player: [], opponent: [] }; 
        
        this.shuffle(this.playerDeck); this.shuffle(this.opponentDeck);
        // Start with 5 cards
        for(let i=0; i<5; i++) { this.drawCard('player'); this.drawCard('opponent'); }

        this.render(); this.updateHUD();
        
        // Reset Visuals
        document.getElementById("result-message").innerText = ""; 
        const pSlot = document.getElementById("player-clash-slot");
        const oSlot = document.getElementById("opp-clash-slot");
        
        // Remove revealed class to reset to dark/empty
        pSlot.classList.remove("card-revealed");
        oSlot.classList.remove("card-revealed");
        
        pSlot.innerText = "";
        oSlot.innerText = "";
    },

    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    drawCard: function(who, amount = 1) {
        for(let i=0; i<amount; i++) {
            if(who === 'player' && this.playerDeck.length > 0) this.playerHand.push(this.playerDeck.pop());
            else if(who === 'opponent' && this.opponentDeck.length > 0) this.opponentHand.push(this.opponentDeck.pop());
        }
    },

    resolveBattle: function(pCard, oCard) {
        const row = this.matrix[pCard];
        const colIndex = this.elementsList.indexOf(oCard);
        
        if (!row || colIndex === -1) {
            console.error("Matrix Error: " + pCard + " vs " + oCard);
            return "Tie";
        }
        
        const resultKey = row[colIndex];
        if (resultKey === "W") return "Win";
        if (resultKey === "L") return "Lose";
        return "Tie";
    },

    playTurn: function(handIndex) {
        // Prevent action if game is over or animation is running
        if(this.playerHand.length === 0 || this.opponentHand.length === 0) return;

        const pCard = this.playerHand[handIndex];
        const oppIndex = Math.floor(Math.random() * this.opponentHand.length);
        const oCard = this.opponentHand[oppIndex];

        // 1. INSTANT REVEAL (Text Only, No 3D Flip)
        const pSlot = document.getElementById("player-clash-slot");
        const oSlot = document.getElementById("opp-clash-slot");
        
        pSlot.innerText = pCard;
        oSlot.innerText = oCard;
        
        // Add styling class to turn background white and show text
        pSlot.classList.add("card-revealed");
        oSlot.classList.add("card-revealed");

        // 2. RESOLVE LOGIC (Small delay for visual pacing)
        setTimeout(() => {
            this.resolveTurnLogic(pCard, oCard, handIndex, oppIndex);
        }, 300);
    },

    resolveTurnLogic: function(pCard, oCard, handIndex, oppIndex) {
        // A. Resolve Outcome
        let result = this.resolveBattle(pCard, oCard);
        
        // B. Update Result Text
        const msgBox = document.getElementById("result-message");
        msgBox.innerText = `${result.toUpperCase()}!`;
        msgBox.style.color = result === "Win" ? "#00ff00" : (result === "Lose" ? "#ff4444" : "#ffff00");

        // C. Move to Graveyard
        this.graveyard.player.push(pCard); 
        this.graveyard.opponent.push(oCard);
        
        // D. Remove from Hand (Cards NEVER return to hand)
        this.playerHand.splice(handIndex, 1); 
        this.opponentHand.splice(oppIndex, 1);

        // E. APPLY DRAW RULES (Strict 1-Card Limit)
        if (result === "Win") {
            // Player Won: Player draws 1. Opponent draws 0.
            this.drawCard('player', 1);
        } 
        else if (result === "Lose") {
            // Player Lost: Player draws 0. Opponent draws 1.
            this.drawCard('opponent', 1);
        } 
        else {
            // Tie: Both draw 1.
            this.drawCard('player', 1);
            this.drawCard('opponent', 1);
        }

        // F. Render & Update HUD
        this.render(); 
        this.updateHUD();

        // G. Game Over Check
        if(this.playerHand.length === 0) StoryModule.battleOver("Lose");
        else if(this.opponentHand.length === 0) StoryModule.battleOver("Win");
    },

    // --- DISCARD MODAL LOGIC ---
    showDiscard: function() {
        const modal = document.getElementById("discard-modal");
        document.getElementById("player-graveyard-list").innerHTML = this.generateStats(this.graveyard.player);
        document.getElementById("opp-graveyard-list").innerHTML = this.generateStats(this.graveyard.opponent);
        modal.style.display = "flex";
    },

    closeDiscard: function() {
        document.getElementById("discard-modal").style.display = "none";
    },

    generateStats: function(cardList) {
        let counts = { "Rock": 0, "Paper": 0, "Scissors": 0, "Other": 0 };
        cardList.forEach(card => {
            // Count based on element groups
            if(card.includes("Rock") || card.includes("Earth") || card.includes("Magic")) counts["Rock"]++;
            else if(card.includes("Paper") || card.includes("Water") || card.includes("Darkness")) counts["Paper"]++;
            else if(card.includes("Scissors") || card.includes("Fire") || card.includes("Lightning")) counts["Scissors"]++;
            else counts["Other"]++;
        });

        return `
            <div class="stat-row"><span>Rock Types:</span> <strong>${counts["Rock"]}</strong></div>
            <div class="stat-row"><span>Paper Types:</span> <strong>${counts["Paper"]}</strong></div>
            <div class="stat-row"><span>Scissors Types:</span> <strong>${counts["Scissors"]}</strong></div>
            <hr>
            <div style="font-size: 0.8rem; color: #888; margin-top:5px;">
                Total Played: ${cardList.length}
            </div>
        `;
    },

    render: function() {
        const pDiv = document.getElementById("player-hand");
        const oDiv = document.getElementById("opponent-hand");
        pDiv.innerHTML = ""; oDiv.innerHTML = "";

        // Render Player Hand
        this.playerHand.forEach((card, i) => {
            let el = document.createElement("div");
            el.className = "card player-card";
            el.style.borderColor = "#999";
            // Simple text display
            el.innerHTML = `<span style="font-size:1.1rem; font-weight:bold;">${card}</span>`;
            el.onclick = () => this.playTurn(i);
            pDiv.appendChild(el);
        });

        // Render Opponent Hand
        this.opponentHand.forEach(() => {
            let el = document.createElement("div");
            el.className = "card";
            // Cross-hatch pattern for card back
            el.style.backgroundImage = "repeating-linear-gradient(45deg, #222 0px, #222 10px, #333 10px, #333 20px)";
            oDiv.appendChild(el);
        });
    },

    updateHUD: function() {
        document.getElementById("player-deck-count").innerText = this.playerDeck.length;
        document.getElementById("opp-deck-count").innerText = this.opponentDeck.length;
    }
};