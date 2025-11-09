# Elemental Nexus – Sprint 2 (Multiplayer Update)

## Overview
The *Elemental Nexus* Game is an online multiplayer browser-based card game built to expand upon the original single-player demo from Sprint 1. This version introduces real-time gameplay between two connected users, demonstrating how to integrate multiplayer features into a web-based TypeScript/JavaScript game.

The purpose of this sprint was to learn about **client-server communication**, **synchronizing game states**, and **handling user interactions across different devices**. Players can now log in, connect to a shared game session, and compete by selecting elemental cards against each other. Each round determines a winner based on predefined elemental strengths and weaknesses, with the server ensuring fairness and turn-based synchronization.

This sprint focused on enhancing gameplay interactivity, creating a persistent online experience, and gaining hands-on practice with JavaScript networking and multiplayer architecture.

[**Software Demo Video**](https://youtu.be/Az_0t8LhGHw)

---

## Development Environment
- **Code Editor:** Visual Studio Code  
- **Web Browser:** Google Chrome / Firefox for testing  
- **Languages Used:** TypeScript (compiled to JavaScript), HTML5, CSS3  
- **Libraries & Tools:**  
  - Node.js for running the multiplayer server  
  - Socket.IO for real-time communication between players  
  - Live Server extension in VS Code for front-end preview  
- **Version Control:** GitHub (project repository hosted at [Elemental Nexus Repo](https://github.com/0live48/ElementalNexus))

---

## Useful Websites
- [MDN Web Docs](https://developer.mozilla.org/en-US/) – Reference for JavaScript, TypeScript, and WebSockets  
- [Socket.IO Documentation](https://socket.io/docs/v4/) – Implementing real-time multiplayer functionality  
- [TypeScript Official Docs](https://www.typescriptlang.org/docs/) – Language features and setup  
- [Stack Overflow](https://stackoverflow.com/) – Debugging and peer solutions for multiplayer logic  
- [CSS-Tricks](https://css-tricks.com/) – UI/UX styling for interactive elements  

---

## Future Work
- Add player authentication and persistent logins  
- Implement a leaderboard system to track online wins and scores  
- Include deck-building features for custom player strategies  
- Add animations and sound effects for multiplayer interactions  
- Deploy the server online for public matchmaking and play  
