
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNrRd5BLu25Iva2a-l2KL2EHWkvhb1lyw",
  authDomain: "text-adventure-55f7e.firebaseapp.com",
  projectId: "text-adventure-55f7e",
  storageBucket: "text-adventure-55f7e.firebasestorage.app",
  messagingSenderId: "721830400936",
  appId: "1:721830400936:web:ef55d79e24c4024217439d",
  measurementId: "G-Y55FLGNH5V"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const startGameButton = document.getElementById("start-game");
  const landingPage = document.getElementById("landing-page");
  const gameplayPage = document.getElementById("gameplay-page");
  const gameText = document.getElementById("game-text");
  const choiceButtons = document.querySelectorAll(".choice-btn");

  // Function to Fetch Game State
  async function loadGameState(path) {
    try {
      const gameStateQuery = query(collection(db, 'game_states'), where('path', '==', path));
      const querySnapshot = await getDocs(gameStateQuery);

      if (querySnapshot.empty) {
        console.error("No game state found!");
        gameText.textContent = "Game state not found!";
        return;
      }

      const gameState = querySnapshot.docs[0].data();
      updateGameUI(gameState);
    } catch (error) {
      console.error("Error fetching game state:", error);
      gameText.textContent = "Error loading game state.";
    }
  }

  // Function to Update Game UI
  function updateGameUI(gameState) {
    gameText.textContent = gameState.storyText;

    choiceButtons.forEach((button, index) => {
      if (gameState.options && gameState.options[index]) {
        button.textContent = gameState.options[index];
        button.onclick = () => loadGameState(gameState.path + index.toString());
        button.style.display = "block";
      } else {
        button.style.display = "none";
      }
    });

    // Handle specific endings
    if (gameState.type) {
      setTimeout(() => handleEnding(gameState.type), 2000);
    }
  }

  // Handle Game Endings
  function handleEnding(type) {
    switch (type) {
      case "GoodEnding":
        showWinPage();
        break;
      case "BadEnding":
        showLosePage();
        break;
      case "NeutralEnding":
        showNeutralPage();
        break;
      default:
        console.error("Unknown ending type:", type);
    }
  }

  // Show Win Page
  function showWinPage() {
    gameplayPage.innerHTML = `
      <h1>Congratulations!</h1>
      <p>You successfully completed your mission!</p>
      <img src="win-image.jpg" alt="You Win" />
      <button id="restart-game">Play Again</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }

  // Show Lose Page
  function showLosePage() {
    gameplayPage.innerHTML = `
      <h1>Game Over</h1>
      <p>Your adventure ends here. Try again?</p>
      <button id="restart-game">Restart</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }

  // Show Neutral Page
  function showNeutralPage() {
    gameplayPage.innerHTML = `
      <h1>Interesting Outcome!</h1>
      <p>Your story takes an unexpected turn. Try again?</p>
      <button id="restart-game">Restart</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }

  // Transition from Landing Page to Gameplay
  startGameButton.addEventListener("click", () => {
    landingPage.classList.add("hidden");
    gameplayPage.classList.remove("hidden");
    loadGameState("power:0"); // Start at the initial game state
  });
});
