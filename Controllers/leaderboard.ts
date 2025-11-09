interface Player {
    name: string;
    score: number;
}

// API URL
const apiUrl = "https://localhost:5001/api/players"; // change port if needed

// Save player score
async function saveScore(name: string, score: number) {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score })
    });
    return await response.json();
}

// Fetch leaderboard
async function fetchLeaderboard() {
    const response = await fetch(`${apiUrl}/leaderboard`);
    const data: Player[] = await response.json();
    const leaderboardDiv = document.getElementById("leaderboard");
    if (!leaderboardDiv) return;

    leaderboardDiv.innerHTML = "<h3>Leaderboard</h3>";
    data.forEach((player, index) => {
        const entry = document.createElement("p");
        entry.textContent = `${index + 1}. ${player.name}: ${player.score}`;
        leaderboardDiv.appendChild(entry);
    });
}

// Example usage after game ends:
async function onGameEnd(playerName: string, playerScore: number) {
    await saveScore(playerName, playerScore);
    fetchLeaderboard();
}

fetchLeaderboard(); // Initial load
