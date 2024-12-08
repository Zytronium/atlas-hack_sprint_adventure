import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNrRd5BLu25Iva2a-l2KL2EHWkvhb1lyw",
  authDomain: "text-adventure-55f7e.firebaseapp.com",
  databaseURL: "https://text-adventure-55f7e-default-rtdb.firebaseio.com",
  projectId: "text-adventure-55f7e",
  storageBucket: "text-adventure-55f7e.firebasestorage.app",
  messagingSenderId: "721830400936",
  appId: "1:721830400936:web:ef55d79e24c4024217439d",
  measurementId: "G-Y55FLGNH5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-game");
  const landingPage = document.getElementById("landing-page");
  const gameplayPage = document.getElementById("gameplay-page");
  const gameText = document.getElementById("game-text");
  const choicesContainer = document.getElementById("choices");

  // Start the game when "Enter the Adventure" is clicked
  startButton.addEventListener("click", async () => {
    landingPage.style.display = "none"; // Hide the landing page
    gameplayPage.style.display = "block"; // Show the gameplay page
    await loadGameState("0"); // Start with the initial game state
  });

  // Load a game state from Firestore
  async function loadGameState(path) {
    // Rickroll for specific paths
    if (path === "power:021332" || path === "power:021331") {
      window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rickroll
      return;
    }

    console.log("Loading game state for path:", path);
    try {
      const docRef = doc(db, "stories", "Sci fi"); // Adjust Firestore path as needed
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error("No game state document found!");
        gameText.textContent = "Game state not found!";
        return;
      }

      const gameStateData = docSnap.data();
      const gameState = gameStateData.events[path];
      if (!gameState) {
        console.error(`No game state found for path: ${path}`);
        gameText.textContent = `Error 404: Story event not found.`;
        return;
      }

      handleGameState(gameState, path);
    } catch (error) {
      console.error("Error loading game state: ", error);
      gameText.textContent = "An error occurred while loading the game state.";
    }
  }

  // Process and display the game state
  function handleGameState(gameState, currentPath) {
    typeText(gameText, gameState.storyText, 25); // Use typewriter effect for text

    if (gameState.options) {
      handleOptions(gameState.options, gameState.optionPaths, currentPath);
    } else {
      handleEndings(gameState);
    }
  }

  // Display options as buttons
  function handleOptions(options, optionPaths, currentPath) {
    // Clear existing buttons
    choicesContainer.innerHTML = "";

    // Get the button click sound element
    const buttonClickSound = document.getElementById("button-click-sound");

    // Generate buttons for each option
    options.forEach((option, index) => {
      const button = document.createElement("button");
      button.classList.add("choice-btn");
      button.textContent = option;

      // Play the click sound when the button is clicked and navigate to next story event
      button.addEventListener("click", async () => {
        buttonClickSound.play(); // Play click sound
        const nextPath = `${currentPath}${index + 1}`;
        console.log(`Navigating to path: ${nextPath}`);
        await loadGameState(nextPath); // Load the next game state
      });

      choicesContainer.appendChild(button);
    });
  }

  // Handle game endings
  function handleEndings(gameState) {
    if (gameState.type === "BadEnding") {
      showBadEnding(gameState.storyText, "bad-ending.gif");
    } else if (gameState.type === "GoodEnding") {
      showGoodEnding(gameState.storyText, "good-ending.gif");
    } else if (gameState.type === "NeutralEnding") {
      showNeutralEnding(gameState.storyText, "neutral-ending.gif");
    } else {
      gameText.textContent = gameState.storyText;
      showRestartButton();  // Show the restart button when no options exist
    }
  }

  // Add typewriter effect for text
  function typeText(element, text, speed = 10) {
    let index = 0;
    element.textContent = ""; // Clear existing text
    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
      } else {
        clearInterval(interval); // Stop once all text is displayed
      }
    }, speed);
  }

  // Show bad ending with red tint and a GIF
  function showBadEnding(storyText, gifSrc) {
    gameplayPage.innerHTML = `
      <div class="red-tint"></div>
      <h1>Game Over. You got a bad ending.</h1>
      <p>${storyText}</p>
      <img src="${gifSrc}" alt="Bad Ending" />
    `;
    showRestartButton();  // Show restart button after game over
  }

  // Show win page with a GIF
  function showGoodEnding(storyText, gifSrc) {
    gameplayPage.innerHTML = `
      <div class="green-tint"></div>
      <h1>Congratulations! You got a good ending.</h1>
      <p>${storyText}</p>
      <img src="${gifSrc}" alt="Good Ending" />
    `;
    showRestartButton();  // Show restart button after winning
  }

  // Show win page with a GIF
  function showNeutralEnding(storyText, gifSrc) {
    gameplayPage.innerHTML = `
      <div class="pastel-blue-tint"></div>
      <h1>The End. You got a neutral ending.</h1>
      <p>${storyText}</p>
      <img src="${gifSrc}" alt="Neutral Ending" />
    `;
    showRestartButton();  // Show restart button after winning
  }

  // Show the restart button
  function showRestartButton() {
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart Game";
    restartButton.classList.add("restart-btn");
    restartButton.addEventListener("click", () => {
      location.reload(); // Reload the page to restart the game
    });

    choicesContainer.innerHTML = ""; // Clear any other buttons
    choicesContainer.appendChild(restartButton);
  }
});
