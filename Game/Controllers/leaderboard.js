const leaderboardDiv = document.getElementById("leaderboard");

// Fetch leaderboard from backend
async function loadLeaderboard() {
    const response = await fetch("https://localhost:5001/api/Players/leaderboard");
    const data = await response.json();

    leaderboardDiv.innerHTML = data.map(p => 
        `<div>${p.name} - ${p.score}</div>`).join("");
}

// Call this after each match
async function updateScore(name, score) {
    await fetch("https://localhost:5001/api/Players/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, score: score })
    });

    loadLeaderboard();
}
