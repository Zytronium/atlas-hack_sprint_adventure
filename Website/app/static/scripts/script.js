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

// Initialize the audio for button click
const buttonClickSound = new Audio('sounds/button_click.mp3');
buttonClickSound.preload = "auto"; // Preload the audio for better performance

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-game");
  const landingPage = document.getElementById("landing-page");
  const gameplayPage = document.getElementById("gameplay-page");
  const gameText = document.getElementById("game-text");
  const choicesContainer = document.getElementById("choices");

  // Play the button click sound on any button click
  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      buttonClickSound.play();
    });
  });

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
      const docRef = doc(db, "stories", "Sci fi");
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
        gameText.textContent = `No game state found for path: ${path}`;
        return;
      }

      handleGameState(gameState, path);
    } catch (error) {
      console.error("Error loading game state:", error);
      gameText.textContent = "An error occurred while loading the game state.";
    }
  }

  // Process and display the game state
  function handleGameState(gameState, currentPath) {
    typeText(gameText, gameState.storyText, 25); // Use typewriter effect for text

    if (gameState.options) {
      handleOptions(gameState.options, currentPath);
    } else {
      handleEndings(gameState);
    }
  }

  // Display options as buttons
  function handleOptions(options, currentPath) {
    choicesContainer.innerHTML = ""; // Clear existing buttons

    options.forEach((option, index) => {
      const button = document.createElement("button");
      button.classList.add("choice-btn");
      button.textContent = option;
      button.onclick = async () => {
        const nextPath = `${currentPath}${index + 1}`;
        console.log(`Navigating to path: ${nextPath}`);
        await loadGameState(nextPath);
      };
      choicesContainer.appendChild(button);
    });
  }

  // Handle game endings
  function handleEndings(gameState) {
    if (gameState.type === "BadEnding") {
      showBadEnding(gameState.storyText, "bad-ending.gif");
    } else if (gameState.type === "GoodEnding") {
      showWinPage(gameState.storyText, "win-image.gif");
    } else {
      gameText.textContent = gameState.storyText;
      const restartButton = document.createElement("button");
      restartButton.textContent = "Restart Game";
      restartButton.onclick = async () => await loadGameState("0"); // Restart the game
      choicesContainer.innerHTML = ""; // Clear existing buttons
      choicesContainer.appendChild(restartButton);
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

  // Display a bad ending with red tint and a GIF
  function showBadEnding(storyText, gifSrc) {
    gameplayPage.innerHTML = `
      <div class="red-tint"></div>
      <h1>Game Over</h1>
      <p>${storyText}</p>
      <img src="${gifSrc}" alt="Bad Ending" />
      <button id="restart-game">Restart</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }

  // Display a win page with a GIF
  function showWinPage(storyText, gifSrc) {
    gameplayPage.innerHTML = `
      <h1>Congratulations!</h1>
      <p>${storyText}</p>
      <img src="${gifSrc}" alt="You Win" />
      <button id="restart-game">Play Again</button>
    `;
    document.getElementById("restart-game").addEventListener("click", () => location.reload());
  }
});