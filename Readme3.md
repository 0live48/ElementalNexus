# Elemental Nexus – Data Integration Update

## Overview
The *Elemental Nexus* project is a simplified single-player browser-based game designed to demonstrate how game data can be captured and stored in a structured way.  
Instead of a full online server, this version focuses on saving player stats and game outcomes into an Excel sheet, which can later be integrated or imported into a local SQL database (e.g., **PRASHAB\SQLEXPRESS**).  

The main goal of this project is to practice **data persistence**, **file handling**, and **database linking** in a simple, understandable way without requiring a full backend setup.  
When the player enters game information, it is saved locally into an Excel file (`game_data.xlsx`). This file can then be used as a relational data source to reflect the player’s stats and history.

[**Software Demo Video**](https://youtu.be/vxabXXS0_Vc)

---

## Relational Database
The relational database is represented in two stages:
1. **Excel Layer:** The game data (player name, score, and round outcome) is stored in an Excel sheet.
2. **SQL Layer:** The Excel data can be imported into a SQL table called `Players` for further management.

**Table Structure Example:**

| Column Name | Data Type | Description |
|--------------|------------|-------------|
| PlayerID | INT | Unique identifier for each player |
| PlayerName | NVARCHAR(50) | Name of the player |
| Element | NVARCHAR(50) | Element chosen in the round |
| Score | INT | Player’s total score |
| DatePlayed | DATETIME | Timestamp of the game session |

---

## Development Environment
- **Code Editor:** Visual Studio Code  
- **Languages Used:** HTML, CSS, JavaScript, Python (for Excel writing)  
- **Tools Used:**  
  - `openpyxl` for Excel file handling  
  - Microsoft SQL Server Express for optional database integration  
  - Local file storage to simulate persistent data  
- **Environment:** Localhost (no internet/server required)

---

## Useful Websites
- [W3Schools JavaScript Reference](https://www.w3schools.com/js/) – Basics of handling user input  
- [openpyxl Documentation](https://openpyxl.readthedocs.io/en/stable/) – Python Excel file handling  
- [Microsoft SQL Server Docs](https://learn.microsoft.com/en-us/sql/sql-server/) – Managing local SQL databases  
- [MDN Web Docs](https://developer.mozilla.org/en-US/) – HTML and JavaScript structure references  

---

## Future Work
- Direct integration between the game UI and SQL database  
- Add player authentication (name saving and session recall)  
- Create visual graphs from stored game data  
- Implement leaderboard based on scores  
- Add export/import tools for transferring Excel data to SQL automatically  
