import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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

      // Find the specific game state based on path
      const gameState = gameStateData.states.find(state => state.path === path);

      if (!gameState) {
        console.error(`No game state found for path: ${path}`);
        gameText.textContent = "Specific game state not found!";
        return;
      }

      updateGameUI(gameState);
    } catch (error) {
      console.error("Error fetching game state:", error);
      gameText.textContent = "An error occurred while loading the game state.";
    }
  }

  // Start the game when the "Start Game" button is clicked
  startGameButton.addEventListener("click", () => {
    landingPage.classList.add("hidden");
    gameplayPage.classList.remove("hidden");
    loadGameState("power:0"); // Start at the initial game state
  });
});