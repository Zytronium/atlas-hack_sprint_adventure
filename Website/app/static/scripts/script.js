import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Wrap the entire script in an async IIFE (Immediately Invoked Function Expression)
(async () => {
  // Wait for the DOM to be fully loaded
  await new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });

  const startButton = document.getElementById('start-game');
  const landingPage = document.getElementById('landing-page');
  const gameplayPage = document.getElementById('gameplay-page');
  const gameText = document.getElementById('game-text');

  // Add a click listener to the "Enter the Adventure" button
  startButton.addEventListener('click', async () => {
    // Hide the landing page
    landingPage.style.display = 'none';  // Use style to hide the landing page
    
    // Show the gameplay page
    gameplayPage.style.display = 'block';  // Use style to show the gameplay page
    
    // Start the game by loading the initial game state (using path "0")
    await loadGameState('0'); // Starting point as '0'
  });

  // Function to load the game state from Firebase
  async function loadGameState(path) {
    console.log('Loading game state for path:', path);
    try {
      // Reference to the 'Sci fi' document in the 'stories' collection
      const docRef = doc(db, "stories", "Sci fi");
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error("No game state document found!");
        
        // Retrieve all collections in the Firestore database
        const collectionRef = collection(db, "stories");
        const snapshot = await getDocs(collectionRef);
        const collections = snapshot.docs.map(doc => doc.id);
        
        console.log("Available collections:", collections);
        gameText.textContent = "Game state not found!";
        return;
      }
      
      const gameStateData = docSnap.data();
      console.log("Full game state data:", JSON.stringify(gameStateData, null, 2));
      
      // Check if the 'events' field exists and is an object
      if (gameStateData.events && typeof gameStateData.events === 'object') {
        console.log("Available events paths:", Object.keys(gameStateData.events));
        
        // Attempt to access the game state based on the path
        const gameState = gameStateData.events[path];
        if (!gameState) {
          console.error(`No game state found for path: ${path}`);
          gameText.textContent = `No game state found for path: ${path}`;
          return;
        }
        
        // Continue processing the game state, e.g., handling options and endings
        handleGameState(gameState, path);
      } else {
        console.error("'events' is not a valid object:", gameStateData.events);
        gameText.textContent = "'events' is not a valid object!";
      }
    } catch (error) {
      console.error("Detailed error fetching game state:", error);
      gameText.textContent = "An error occurred while loading the game state.";
    }
  }

  // Function to handle the game state
  function handleGameState(gameState, currentPath) {
    // Check if the game state has options
    if (gameState.options) {
      console.log("Available options:", gameState.options);
      gameText.textContent = gameState.storyText;
      handleOptions(gameState.options, currentPath);
    } else {
      console.log("No options found for path:", currentPath);
      handleEndings(gameState);
    }
  }

  // Function to handle option buttons (choices)
  function handleOptions(options, currentPath) {
    const optionButtons = options.map((option, index) => {
      const button = document.createElement('button');
      button.classList.add('choice-btn');
      button.textContent = option; // Option text (e.g., "Look around", "Take a step forward")
      button.onclick = async () => {
        // Construct the next path by appending the option index
        const nextPath = `${currentPath}${index + 1}`; // Append the option index to the current path
        console.log(`Next path: ${nextPath}`);
        await loadGameState(nextPath); // Load the next game state based on the constructed path
      };
      return button;
    });

    const optionsDiv = document.getElementById('choices');
    optionsDiv.innerHTML = ''; // Clear any previous options
    optionButtons.forEach(button => optionsDiv.appendChild(button));
  }

  // Function to handle game endings (e.g., BadEnding, GoodEnding)
  function handleEndings(gameState) {
    if (gameState.type === "BadEnding" || gameState.type === "GoodEnding" || gameState.type === "NeutralEnding") {
      gameText.textContent = gameState.storyText; // Display the ending text
      const restartButton = document.createElement('button');
      restartButton.textContent = "Restart Game";
      restartButton.onclick = async () => await loadGameState('0'); // Restart the game from path '0'
      const optionsDiv = document.getElementById('choices');
      optionsDiv.appendChild(restartButton);
    }
  }
})();