const elements = ["Rock", "Paper", "Scissors", "Fire", "Water", "Earth", "Magic", "Lightning", "Darkness", "Plasma"];
let playerHand = [];
let opponentHand = [];
let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

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
    renderLeaderboard();
};

document.getElementById("play-again").onclick = () => {
    initHands();
    renderHands();
    resultDiv.innerText = "New game started!";
};

document.getElementById("download-csv").onclick = () => {
    if (leaderboard.length === 0) return alert("No leaderboard data!");
    let csv = "Name,Score\n";
    leaderboard.forEach(p => csv += `${p.name},${p.score}\n`);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leaderboard.csv"; a.click();
    URL.revokeObjectURL(url);
};

function initHands() {
    playerHand = Array.from({length:7}, () => randomCard());
    opponentHand = Array.from({length:7}, () => randomCard());
}

function randomCard() {
    const index = Math.floor(Math.random() * elements.length);
    return { element: elements[index], value: index+1 };
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

    playerHand.splice(idx,1);
    opponentHand.splice(opponentIdx,1);

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

function saveScore(name, score) {
    leaderboard.push({name, score});
    leaderboard.sort((a,b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
}

function renderLeaderboard() {
    leaderboardDiv.innerHTML = "";
    leaderboard.forEach(p => {
        const div = document.createElement("div");
        div.innerText = `${p.name}: ${p.score}`;
        leaderboardDiv.appendChild(div);
    });
}
