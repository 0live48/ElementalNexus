const elements = ["Rock","Paper","Scissors","Fire","Water","Earth","Magic","Lightning","Darkness","Plasma"];
let playerHand = [];
let opponentHand = [];
let playerName = "";
// <-- YOUR NEW URL IS HERE
const API_URL = "https://script.google.com/macros/s/AKfycbyJ6gI4TlrEBc_kF9CC-sjRF3GXOtcUo084uO8YtbXEpRe9DXlL0IwRmyejBZvTdke5ow/exec";

const playerHandDiv = document.getElementById("player-hand");
const opponentHandDiv = document.getElementById("opponent-hand");
const resultDiv = document.getElementById("result");
const leaderboardDiv = document.getElementById("leaderboard");
const gameArea = document.getElementById("game-area");

document.getElementById("start-game").onclick = () => {
    const nameInput = document.getElementById("player-name");
    if (!nameInput.value) return alert("Enter your name!");
    playerName = nameInput.value;
    document.getElementById("setup").style.display = "none";
    gameArea.style.display = "block";
    initHands();
    renderHands();
    loadLeaderboard();
};

document.getElementById("play-again").onclick = () => {
    initHands();
    renderHands();
    resultDiv.innerText = "New game started!";
};

function initHands() {
    playerHand = Array.from({length:7}, () => randomCard());
    opponentHand = Array.from({length:7}, () => randomCard());
}

function randomCard() {
    const index = Math.floor(Math.random() * elements.length);
    return { element: elements[index], value: index + 1 };
}

function renderHands() {
    playerHandDiv.innerHTML = "";
    opponentHandDiv.innerHTML = "";
    playerHand.forEach((card, idx) => {
        const div = document.createElement("div");
        div.className = "card player-card";
        div.innerText = card.element;
        div.onclick = () => playTurn(idx);
        playerHandDiv.appendChild(div);
    });
    opponentHand.forEach(() => {
        const div = document.createElement("div");
        div.className = "card opponent-card";
        div.innerText = "X";
        opponentHandDiv.appendChild(div);
    });
}

function playTurn(idx) {
    const playerCard = playerHand[idx];
    const opponentIdx = Math.floor(Math.random() * opponentHand.length);
    const opponentCard = opponentHand[opponentIdx];

    const result = resolveBattle(playerCard, opponentCard);
    resultDiv.innerText = `Player: ${playerCard.element} vs Opponent: ${opponentCard.element} → ${result}`;

    if (result.includes("Win")) playerHand.push(randomCard());
    if (result.includes("Lose")) opponentHand.push(randomCard());

    playerHand.splice(idx, 1);
    opponentHand.splice(opponentIdx, 1);

    renderHands();

    if (playerHand.length === 0 || opponentHand.length === 0) {
        resultDiv.innerText += " | Game Over!";
        const score = playerHand.length;
        saveScore(playerName, score);
    }
}

function resolveBattle(playerCard, opponentCard) {
    if (playerCard.element === opponentCard.element) return "Tie!";
    if (playerCard.element === "Plasma") return "Player Wins!";
    if (opponentCard.element === "Plasma") return "Player Loses!";
    return playerCard.value > opponentCard.value ? "Player Wins!" : "Player Loses!";
}

async function saveScore(name, score) {
    try {
        const params = new URLSearchParams();
        params.append("action", "add");
        params.append("name", name);
        params.append("score", score);

        await fetch(`${API_URL}?${params.toString()}`);
        loadLeaderboard();
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

async function loadLeaderboard() {
    try {
        const res = await fetch(`${API_URL}?action=get`);
        const data = await res.json();
        leaderboardDiv.innerHTML = "";
        data.forEach(player => {
            const div = document.createElement("div");
            div.innerText = `${player.name}: ${player.score}`;
            leaderboardDiv.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}