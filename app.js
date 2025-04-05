const express = require("express");
const http = require("http");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const port = 3000;

const server = http.createServer(app);
const io = socket(server);

// Initialize Chess.js instance
let chess = new Chess();

// Player and Spectator Management
let players = { white: null, black: null };
let spectators = new Set();
let currentPlayer = "w"; // Track current turn ('w' for white, 'b' for black)

// Setting view engine and static folder
app.set("view engine", "ejs");
app.use(express.static(path.resolve("./public")));

// Route for serving the homepage
app.get("/", (req, res) => {
  res.render("index", { title: "Chess.Com" });
});

// Socket.io connection handling
io.on("connection", (socket) => {
//   ye socket vo h jisne backend pe request bheji h
  console.log(`New User Connected: ${socket.id}`);

  // Assign roles to players or add as spectator
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
    console.log(`Player assigned to White: ${socket.id}`);
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
    console.log(`Player assigned to Black: ${socket.id}`);

    // ✅ Both players are now connected — notify both to start the game
    io.to(players.white).emit("startGame");
    io.to(players.black).emit("startGame");
  } else {
    spectators.add(socket.id);
    socket.emit("spectatorRole");
    socket.emit("boardState", chess.fen());
    console.log(`Spectator connected: ${socket.id}`);
  }


  // Notify all clients about the updated roles
  io.emit("playerUpdate", players);

  // Handle moves from players  

  //agr kisi socket se move emit hui to ye function chalo
  socket.on("move", (move) => {
    try {
      // Validate that the correct player is making the move
      if (
        (chess.turn() === "w" && socket.id !== players.white) || //turn white ki h pr jo socket move req bhej rha h uski id!=white.id
        (chess.turn() === "b" && socket.id !== players.black)
      ) {
        console.log(`Invalid turn attempt by: ${socket.id}`);
        return; // Ignore moves from incorrect players
      }
  
      const result = chess.move(move); // Process the move agr move valid to move chlo
  
      if (result) {
        currentPlayer = chess.turn(); // Update current player,kis player ki turn h use bdlo
        io.emit("move", move); //move ko broadcast so that it can be handled on frontend
        io.emit("boardState", chess.fen()); // Broadcast the updated board state in fen notation taki board dobare se render ho ske
  
        // Check for game-ending conditions 
        if (chess.isCheckmate()) { 
          const winner = chess.turn() === "w" ? "b" : "w"; //say white ne checkmate kra to uske baad chess.turn update hoke black ho gyi hogi isliye ulta h
          io.emit("gameEnd", { result: "Checkmate", winner });
          console.log(`Game Over: Checkmate! Winner: ${winner}`);
          resetGame();
        } else if (chess.isDraw()) { // Corrected method name
          io.emit("gameEnd", { result: "Draw" });
          console.log("Game Over: Draw!");
          resetGame();
        } else if (chess.isStalemate()) { // Corrected method name
          io.emit("gameEnd", { result: "Stalemate" });
          console.log("Game Over: Stalemate!");
          resetGame();
        }
      } else {
        console.log("Invalid Move: ", move);
        socket.emit("invalidMove", move);
      }
    } catch (error) {
      console.error("Error processing move: ", error);
      socket.emit("invalidMove", move);
    }
  });
  
  // Handle disconnections
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);

    // Remove the player or spectator
    if (socket.id === players.white) {
      players.white = null;
      console.log("White player disconnected.");
    } else if (socket.id === players.black) {
      players.black = null;
      console.log("Black player disconnected.");
    } else {
      spectators.delete(socket.id);
      console.log("Spectator disconnected.");
    }

    // Notify everyone about the updated roles
    io.emit("playerUpdate", players); //playerupdate abhi frontend pe handle nhi kra h as of now
  });
});

// Reset the game state
function resetGame() {
  chess = new Chess(); // Reset the chess board
  currentPlayer = "w"; // Reset turn
  players = { white: null, black: null }; // Reset players
  spectators.clear(); // Clear spectators
  console.log("Game has been reset.");
  io.emit("gameReset"); // Notify clients that the game has been reset(ye abhi frontend pe handle nhi kra h)
  io.emit("boardState", chess.fen()); // Send the reset board state
}

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
