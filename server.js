const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// SQL Config
const dbConfig = {
    user: 'YOUR_SQL_USER',
    password: 'YOUR_SQL_PASSWORD',
    server: 'PRASHAB\\SQLEXPRESS',
    database: 'ElementalNexusDB',
    options: { encrypt: false, trustServerCertificate: true }
};

// Leaderboard endpoint
app.get("/leaderboard", async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query`SELECT Name, Score FROM Players ORDER BY Score DESC`;
        res.json(result.recordset);
    } catch (err) { console.error(err); res.status(500).send(err); }
});

let waitingPlayer = null;

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-game", async (name) => {
        socket.playerName = name;

        // Add player to database if not exists
        try {
            await sql.connect(dbConfig);
            await sql.query`IF NOT EXISTS (SELECT 1 FROM Players WHERE Name = ${name}) 
                             INSERT INTO Players(Name, Score) VALUES(${name},0)`;
        } catch(err){ console.error(err); }

        if (!waitingPlayer) {
            waitingPlayer = socket;
            socket.emit("waiting", "Waiting for opponent...");
        } else {
            const player1 = waitingPlayer;
            const player2 = socket;
            waitingPlayer = null;

            player1.emit("start-game", { opponent: player2.playerName });
            player2.emit("start-game", { opponent: player1.playerName });

            // When player plays a card
            player1.on("play-card", (card) => player2.emit("opponent-card", card));
            player2.on("play-card", (card) => player1.emit("opponent-card", card));

            // For simplicity, simulate game over after 7 moves
            let movesCount = 0;
            function countMove() {
                movesCount++;
                if (movesCount >= 7) {
                    player1.emit("game-over", player1.playerName);
                    player2.emit("game-over", player2.playerName);
                    // Update score in SQL
                    sql.connect(dbConfig).then(() => {
                        sql.query`UPDATE Players SET Score = Score + 1 WHERE Name = ${player1.playerName}`;
                        sql.query`UPDATE Players SET Score = Score + 1 WHERE Name = ${player2.playerName}`;
                    });
                }
            }

            player1.on("play-card", countMove);
            player2.on("play-card", countMove);
        }
    });

    socket.on("disconnect", () => {
        if (waitingPlayer === socket) waitingPlayer = null;
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));
