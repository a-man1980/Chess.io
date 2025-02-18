const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;
let lastMove = null; // Tracking  the last move for visual indicators(pta chlta rhe kiski baari h)

// Render the chessboard
const renderBoard = () => {
    const board = chess.board();
    // board ko console log krke dekho sb smjh aayega 
    // board ek 2d matrix h 8 rows and 8 columns ji ek board[row][col] ya ek to piece h uske pass jiska color h and konsa element rkha uspe ya fir board[row][col]==null h for empty square
    boardElement.innerHTML = ""; // Clear the board

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
                // check pattern bnane ke liye alternate square element ko dark aur light classes de di
            );

            // Highlight last move squares
            if (lastMove) {
                // if lastmove !=NULL
                const from = parseSquare(lastMove.from);
                const to = parseSquare(lastMove.to);
                if (
                    // hm us squareelement pe khde h jiska rowindex==lastmove.from.row ke brabar(same for column)to highlight kro
                    (from.row === rowIndex && from.col === squareIndex) ||
                    (to.row === rowIndex && to.col === squareIndex) //jis square pe gya h usko bhi highlight kro
                ) {
                    squareElement.classList.add("highlight"); //highlight class add krdi us square pe
                }
            }

            //taki hm piece jb drop kre tb hmare se target square element ki row aur column ho isliye squareElement ke dataset me row or square add kr rhe
            squareElement.dataset.row = rowIndex; 
            squareElement.dataset.square = squareIndex;

            if (square) {
                // square equal to not null mtlb piece h us board[row][col] pe
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black" //jis square pe piece h uski property hoti ki white color ya black color uske acc classList add kri
                );
                pieceElement.innerText = getPieceUnicode(square); //piece ka unicode nikala aur innertext ki jgh daldiya
                pieceElement.draggable = playerRole === square.color; //agr square color is equal to the player role tbhi us piece ko draggable bnao

                pieceElement.addEventListener("dragstart", (e) => {
                    // agr dragstart ho kisi piece pe then set the value of dragged piece and soource square
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", ""); //for smooth dragging
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    // jaise hi dragend ho reset the value of dragged piece and sourcesquare
                    draggedPiece = null;
                    sourceSquare = null;
                });
                //piece ko square element me add kiya
                squareElement.appendChild(pieceElement);
            }
            // agr koi square h jispe piece hi nhi h then uspe agr dragover ho to then prevent default dragging behaviour
            squareElement.addEventListener("dragover", (e) => e.preventDefault());
            
            // jaise hi drop ho kisi square pe
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault(); //prevent default behaviour pehle to
                if (draggedPiece) {
                    // pehle target square calculate kro
                    // jis sqaure element pe drop h uske data set se row col nikalke target square me daalo
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.square),
                    };
                    // calling handleMove function with source square and target square
                    handleMove(sourceSquare, targetSquare);
                }
            });

            // append the squareelement to the boardelement

            boardElement.appendChild(squareElement);
        });
    });

    if (playerRole === "b") {
        // agr player role black h then flip the board 
        boardElement.classList.add("flipped");
    } else {
        // otherwise dont flip the board
        boardElement.classList.remove("flipped");
    }
};

// Convert row/col to algebraic notation
// row,col se chess ki bhasa me say move queen ne chla c2,a3 etc
const squareToAlgebraic = (square) => {
    return `${String.fromCharCode(97 + square.col)}${8 - square.row}`;
};

// Parse algebraic notation to row/col 
// chess notation se vapis row,col me
const parseSquare = (notation) => {
    return {
        row: 8 - parseInt(notation[1]),
        col: notation.charCodeAt(0) - 97,
    };
};

// Handle player moves
const handleMove = (source, target) => {
    const move = {
        // chess ki bhasa convert krliya sourcesquare aur target square ko
        from: squareToAlgebraic(source),
        to: squareToAlgebraic(target),
        promotion: "q", // Always promote to queen for simplicity
    };

    // Check if the move is valid locally before emitting it
    if (chess.move(move)) {
        chess.undo(); // Revert move locally since server handles the move(server pe move handle ho rhi h jb koi socket bhejega)
        socket.emit("move", move);
    } else {
        console.log("Invalid move attempted:", move);
    }
};

// Get the Unicode character for a piece
const getPieceUnicode = (piece) => {
    // unicode is nothing just chess pieces written in text form lol
    const unicodePieces = {
        p: "♙",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    };
    return unicodePieces[piece.type] || "";
};

// Socket events
socket.on("playerRole", (role) => {
    // playerRole jaise hi backend se aaye frontend pe playerrole ko set krdia and board render krvadia
    // flipping of board is handled inside the renderboard function based on playerrole
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    // agr spectator h then just render the board set playerrole to null
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    // agr peeche se move ke baad board state aaye updated vali fen notation me then load kro and render
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move); //move emit ho peeche se to frontend bhi move kro
    lastMove = move; // Track the last move for highlighting
    renderBoard(); //render board after move
});

// agr backend se emit hua gamened then result aaya hoga use alert me dalke users ko btao
socket.on("gameEnd", (result) => {
    alert(`Game Over: ${result.result}${result.winner ? `, Winner: ${result.winner}` : ""}`);//agr result.winner h that will only be in the case of checkmate then print krvao
    lastMove = null; // Clear last move 
    // ab checkmate hogya h no need to show prev move now
    renderBoard();//render the board
});

// Render the initial board
renderBoard();
