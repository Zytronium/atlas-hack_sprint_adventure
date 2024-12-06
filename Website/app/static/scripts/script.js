// Firebase setup (use the module import for Firebase v11)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

// Firebase Configuration
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const startGameButton = document.getElementById("start-game");
  const landingPage = document.getElementById("landing-page");
  const gameplayPage = document.getElementById("gameplay-page");
  const gameText = document.getElementById("game-text");
  const choicesContainer = document.getElementById("choices");

  // Fetch and display a game state
  async function loadGameState(path) {
    try {
      // Reference to the specific document in the 'stories' collection
      const docRef = doc(db, "stories", "Sci fi");
      
      // Get the document
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error("No game state document found!");
        gameText.textContent = "Game state not found!";
        return;
      }

      // Get the data from the document
      const gameStateData = docSnap.data();

      console.log(gameStateData);  // Log the game state data to see its structure

      // Check if 'events' is an object (map) before proceeding
      if (gameStateData.events && typeof gameStateData.events === 'object') {
        // Convert the events map to an array of events
        const eventsArray = Object.values(gameStateData.events);  // Get array of event objects
        
        // Find the specific game state based on path
        const gameState = eventsArray.find(event => event.path === path);

        if (!gameState) {
          console.error(`No game state found for path: ${path}`);
          gameText.textContent = "Specific game state not found!";
          return;
        }

        updateGameUI(gameState);
      } else {
        console.error("'events' is not a valid object:", gameStateData.events);
        gameText.textContent = "'events' is not a valid object!";
      }

    } catch (error) {
      console.error("Error fetching game state:", error);
      gameText.textContent = "An error occurred while loading the game state.";
    }
  }

  // Update the game UI with the given state
  function updateGameUI(gameState) {
    // Set the game text based on the event's description or text
    gameText.textContent = gameState.text || "No game text available.";

    // Update the choices UI
    choicesContainer.innerHTML = "";  // Clear previous choices
    if (gameState.choices && Array.isArray(gameState.choices)) {
      gameState.choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice.text;
        button.addEventListener("click", () => loadGameState(choice.nextEventId));
        choicesContainer.appendChild(button);
      });
    }
  }

  // Start the game when the "Start Game" button is clicked
  startGameButton.addEventListener("click", () => {
    landingPage.classList.add("hidden");
    gameplayPage.classList.remove("hidden");
    loadGameState("power:0"); // Start at the initial game state
  });
});