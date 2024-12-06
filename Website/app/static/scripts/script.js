// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Firebase initialized:", firebase.apps.length > 0);

  // Test Firestore connection
  db.collection("game_states")
    .get()
    .then(snapshot => {
      console.log("Connected to Firestore:", snapshot.size, "documents found");
    })
    .catch(error => {
      console.error("Error connecting to Firestore:", error);
    });

  const startGameButton = document.getElementById("start-game");
  const landingPage = document.getElementById("landing-page");
  const gameplayPage = document.getElementById("gameplay-page");
  const gameText = document.getElementById("game-text");
  const choicesContainer = document.getElementById("choices");

  // Fetch and display a game state
  async function loadGameState(path) {
    try {
      const querySnapshot = await db.collection("game_states").where("path", "==", path).get();

      if (querySnapshot.empty) {
        console.error("No game state found!");
        gameText.textContent = "Game state not found!";
        return;
      }

      const gameState = querySnapshot.docs[0].data();
      updateGameUI(gameState);
    } catch (error) {
      console.error("Error fetching game state:", error);
      gameText.textContent = "An error occurred while loading the game state.";
    }
  }

  // Update the UI with the game state
  function updateGameUI(gameState) {
    gameText.textContent = gameState.storyText;

    // Clear previous buttons
    choicesContainer.innerHTML = "";

    // Dynamically create buttons for choices
    if (gameState.options) {
      gameState.options.forEach(option => {
        const button = document.createElement("button");
        button.classList.add("choice-btn");
        button.textContent = option.text;
        button.onclick = () => loadGameState(option.next_state);
        choicesContainer.appendChild(button);
      });
    }

    // Handle endings
    if (gameState.type) {
      setTimeout(() => handleEnding(gameState.type), 2000);
    }
  }

  // Handle different endings
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

  // Display the win page
  function showWinPage() {
    gameplayPage.innerHTML = `
      <h1>Congratulations!</h1>
      <p>You successfully completed your mission!</p>
      <img src="win-image.jpg" alt="You Win" />
      <button id="restart-game">Play Again</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }

  // Display the lose page
  function showLosePage() {
    gameplayPage.innerHTML = `
      <h1>Game Over</h1>
      <p>Your adventure ends here. Try again?</p>
      <button id="restart-game">Restart</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }

  // Display the neutral ending page
  function showNeutralPage() {
    gameplayPage.innerHTML = `
      <h1>Interesting Outcome!</h1>
      <p>Your story takes an unexpected turn. Try again?</p>
      <button id="restart-game">Restart</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }

  // Start the game when the "Start Game" button is clicked
  startGameButton.addEventListener("click", () => {
    landingPage.classList.add("hidden");
    gameplayPage.classList.remove("hidden");
    loadGameState("power:0"); // Start at the initial game state
  });
});
