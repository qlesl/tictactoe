// Player Factory
const Player = (name, mark) => ({ name, mark });

// Gameboard Module
const Gameboard = (() => {
    let board = Array(9).fill("");

    const getBoard = () => board;

    const setCell = (index, mark) => {
        if (board[index] === "") {
            board[index] = mark;
            return true;
        }
        return false;
    };

    const reset = () => {
        board = Array(9).fill("");
    };

    return { getBoard, setCell, reset };
})();

// Game Controller Module
const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;
    let winnerIndex = null; // Tracks the winner's index (0 or 1)

    const startGame = (player1Name, player2Name) => {
        // Initialize players only once
        if (players.length === 0) {
            players = [
                Player(player1Name || "Player 1", "X"),
                Player(player2Name || "Player 2", "O"),
            ];
        }

        // Determine who starts based on winnerIndex
        currentPlayerIndex = winnerIndex !== null ? winnerIndex : 0;

        gameOver = false;
        winnerIndex = null; // Reset winnerIndex after determining starting player
        Gameboard.reset();
        DisplayController.updateBoard();
        DisplayController.updateStatus(`${players[currentPlayerIndex].name}'s turn`);
    };

    const playRound = (cellIndex) => {
        if (gameOver || !Gameboard.setCell(cellIndex, players[currentPlayerIndex].mark)) return;

        DisplayController.updateBoard();

        if (checkWin()) {
            gameOver = true;
            winnerIndex = currentPlayerIndex; // Set the winner for the next game
            DisplayController.updateStatus(`${players[currentPlayerIndex].name} wins!`);
        } else if (Gameboard.getBoard().every(cell => cell !== "")) {
            gameOver = true;
            winnerIndex = null; // No winner, so Player 1 starts next
            DisplayController.updateStatus("It's a tie!");
        } else {
            currentPlayerIndex = 1 - currentPlayerIndex; // Switch turn
            DisplayController.updateStatus(`${players[currentPlayerIndex].name}'s turn`);
        }
    };

    const checkWin = () => {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6],           // Diagonals
        ];

        return winningCombinations.some(combination =>
            combination.every(index => Gameboard.getBoard()[index] === players[currentPlayerIndex].mark)
        );
    };

    return { startGame, playRound };
})();

// Display Controller Module
const DisplayController = (() => {
    const boardElement = document.getElementById("gameboard");
    const statusElement = document.getElementById("status");
    const restartButton = document.getElementById("restart-btn");
    const startButton = document.getElementById("start-btn");

    const updateBoard = () => {
        boardElement.innerHTML = "";
        Gameboard.getBoard().forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            if (cell !== "") cellElement.classList.add("taken");
            cellElement.textContent = cell;
            cellElement.addEventListener("click", () => GameController.playRound(index));
            boardElement.appendChild(cellElement);
        });
    };

    const updateStatus = (message) => {
        statusElement.textContent = message;
    };

    const toggleButtons = () => {
        startButton.classList.toggle("hidden");
        restartButton.classList.toggle("hidden");
    };

    restartButton.addEventListener("click", () => {
        GameController.startGame(
            document.getElementById("player1").value,
            document.getElementById("player2").value
        );
    });

    return { updateBoard, updateStatus, toggleButtons };
})();

// Event Listeners for Starting and Restarting the Game
document.getElementById("start-btn").addEventListener("click", () => {
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;

    GameController.startGame(player1, player2);
    DisplayController.toggleButtons();
});
