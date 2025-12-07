// story.js - Handles Level Progression, Deck Building, and Backgrounds

const StoryModule = {
    currentLevel: 0,
    playerElement: "",
    
    // --- 1. DECK FACTORY (Your Groupings) ---
    generateDeck: function(mainElement) {
        let deck = [];
        const addBatch = (elementName) => { for(let i = 0; i < 10; i++) deck.push(elementName); };

        if (mainElement === "Rock") {
            // ROCK DECK: Rock, Water, Magic
            addBatch("Rock"); 
            addBatch("Water"); 
            addBatch("Magic");
        } 
        else if (mainElement === "Paper") {
            // PAPER DECK: Paper, Earth, Lightning
            addBatch("Paper"); 
            addBatch("Earth"); 
            addBatch("Lightning");
        } 
        else if (mainElement === "Scissors") {
            // SCISSORS DECK: Scissors, Fire, Darkness
            addBatch("Scissors"); 
            addBatch("Fire"); 
            addBatch("Darkness");
        }
        
        return deck;
    },

    // --- 2. USER CHOICE & UI ---
    chooseElement: function(element) {
        this.playerElement = element;
        this.currentLevel = 1;
        document.getElementById("choice-container").style.display = "none";
        document.getElementById("continue-btn").style.display = "inline-block";
        this.updateStoryText();
    },

    updateStoryText: function() {
        const txt = document.getElementById("story-text");
        const title = document.getElementById("story-title");
        const btn = document.getElementById("continue-btn");

        // --- BACKGROUND GIF TO ALL LEVELS ---
        this.updateBackground();

        // Determine specific deck list string based on selection
        let deckList = "";
        if (this.playerElement === "Rock") {
            deckList = "- 10 Rock\n- 10 Water\n- 10 Magic";
        } else if (this.playerElement === "Paper") {
            deckList = "- 10 Paper\n- 10 Earth\n- 10 Lightning";
        } else if (this.playerElement === "Scissors") {
            deckList = "- 10 Scissors\n- 10 Fire\n- 10 Darkness";
        }

        if (this.currentLevel === 1) {
            title.innerText = "Level 1: The Basics";
            let oppType = this.getWeakElement(this.playerElement);
            
            txt.innerText = `You have chosen the path of ${this.playerElement}. \n\n` +
                            `Your Deck (30 Cards): \n${deckList} \n\n` +
                            `Opponent is playing: ${oppType} Deck.\n` +
                            `SURVIVAL RULE: If your hand is empty, you lose. Win clashes to draw more cards.`;
            btn.innerText = "Start Level 1";
        } 
        else if (this.currentLevel === 2) {
            title.innerText = "Level 2: Mirror Match";
            txt.innerText = `Level 1 Complete. \n\n` +
                            `Your opponent now uses the EXACT same deck composition as you: \n` +
                            `${deckList} \n\n` +
                            `This is a battle of luck and timing.`;
            btn.innerText = "Start Level 2";
        }
        else if (this.currentLevel === 3) {
            title.innerText = "Level 3: The Counter";
            let oppType = this.getStrongElement(this.playerElement);
            
            txt.innerText = `Final Level. \n\n` +
                            `The opponent uses the ${oppType} Deck (which counters yours). \n` +
                            `They have 10 of their Main Element, and 10 of each support. Count their cards!`;
            btn.innerText = "Start Boss Fight";
        }
        else if (this.currentLevel === 4) {
             title.innerText = "Victory!";
             txt.innerText = "You have conquered all 3 levels of Story Mode.";
             btn.innerText = "Play Again";
             btn.onclick = () => location.reload();
        }
    },

    // --- 3. STARTING THE BATTLE ---
    nextLevel: function() {
        document.getElementById("story-overlay").style.display = "none";
        document.getElementById("level-indicator").innerText = this.currentLevel;

        const pDeck = this.generateDeck(this.playerElement);
        let oDeck = [];

        if(this.currentLevel === 1) {
            const weakElem = this.getWeakElement(this.playerElement);
            oDeck = this.generateDeck(weakElem);
        } else if(this.currentLevel === 2) {
            oDeck = this.generateDeck(this.playerElement);
        } else if(this.currentLevel === 3) {
            const strongElem = this.getStrongElement(this.playerElement);
            oDeck = this.generateDeck(strongElem);
        }

        GameEngine.startBattle(pDeck, oDeck);
    },

    // --- 4. GAME OVER HANDLER ---
    battleOver: function(result) {
        document.getElementById("story-overlay").style.display = "flex";
        const txt = document.getElementById("story-text");
        const title = document.getElementById("story-title");
        const btn = document.getElementById("continue-btn");

        if(result === "Win") {
            this.currentLevel++;
            this.updateStoryText();
        } else {
            title.innerText = "Defeat";
            txt.innerText = "Your hand is empty. You have been overwhelmed.";
            btn.innerText = "Retry Level";
        }
    },

    getWeakElement: function(e) {
        if(e === "Rock") return "Scissors";
        if(e === "Paper") return "Rock";
        if(e === "Scissors") return "Paper";
    },
    getStrongElement: function(e) {
        if(e === "Rock") return "Paper";
        if(e === "Paper") return "Scissors";
        if(e === "Scissors") return "Rock";
    },

    // --- NEW: FORCES THE BACKGROUND GIF ---
    updateBackground: function() {
        const wrapper = document.getElementById("game-wrapper");
        // Points to your local file
        wrapper.style.backgroundImage = "url('images/DECK.gif')";
    }
};