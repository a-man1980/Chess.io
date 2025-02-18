
# **Chess.io** ♟️  

A real-time, multiplayer chess platform built using **Node.js, Express.js, Chess.js, and Socket.io**. Play and spectate live chess matches in your browser with smooth drag-and-drop functionality.

## 🚀 Features  
✔️ Real-time two-player chess with WebSockets  
✔️ Spectator mode for viewers  
✔️ Checkmate and draw detection  
✔️ Smooth drag-and-drop chess moves  
✔️ Automatic game reset after checkmate/stalemate  
✔️ Responsive UI with TailwindCSS  

## 🛠️ Tech Stack  
- **Backend:** Node.js, Express.js, Socket.io  
- **Frontend:** HTML, EJS, TailwindCSS  
- **Game Logic:** Chess.js  
- **Real-time Communication:** Socket.io  

## 📂 Project Structure  
```
📦 ChessTech  
 ┣ 📂 node_modules  
 ┣ 📂 public  
 ┃ ┗ 📂 javascripts  
 ┃ ┃ ┗ chessgame.js  
 ┣ 📂 views  
 ┃ ┗ index.ejs  
 ┣ 📜 app.js  
 ┣ 📜 package.json  
 ┣ 📜 package-lock.json  
 ┣ 📜 README.md  
```

## 🎮 Getting Started  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/yourusername/chesstech.git
cd chesstech
```

### 2️⃣ Install Dependencies  
```sh
npm install
```

### 3️⃣ Start the Server  
```sh
npm start
```
or for hot-reloading:  
```sh
npm run dev
```

### 4️⃣ Open in Browser  
Visit **[http://localhost:3000](http://localhost:3000)** to start playing!  

## ⚡ How It Works  
1. The first player to connect is assigned **White**.  
2. The second player to connect is assigned **Black**.  
3. Any additional players will be spectators.  
4. Moves are validated using **Chess.js**, and the game ends on **checkmate, stalemate, or draw**.  
5. After a game ends, the board resets automatically.  

## 🏆 To-Do / Future Enhancements  
🔹 Add user authentication  
🔹 Implement a ranking/leaderboard system  
🔹 Allow game room creation  
🔹 Improve UI with animations and sound effects  
