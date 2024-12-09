import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCNrRd5BLu25Iva2a-l2KL2EHWkvhb1lyw',
  authDomain: 'text-adventure-55f7e.firebaseapp.com',
  databaseURL: 'https://text-adventure-55f7e-default-rtdb.firebaseio.com',
  projectId: 'text-adventure-55f7e',
  storageBucket: 'text-adventure-55f7e.firebasestorage.app',
  messagingSenderId: '721830400936',
  appId: '1:721830400936:web:ef55d79e24c4024217439d',
  measurementId: 'G-Y55FLGNH5V'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-game');
  const landingPage = document.getElementById('landing-page');
  const gameplayPage = document.getElementById('gameplay-page');
  const gameText = document.getElementById('game-text');
  const choicesContainer = document.getElementById('choices');
  const themeMusic = document.getElementById('theme-music');

  // Start the game when "Enter the Adventure" is clicked
  startButton.addEventListener('click', async () => {
    landingPage.style.display = 'none'; // Hide the landing page
    gameplayPage.style.display = 'block'; // Show the gameplay page
    await loadGameState('0'); // Start with the initial game state
  });

  async function loadGameState (path) {
    const themeMusic = document.getElementById('theme-music'); // Reference the theme music element

    // Rickroll for specific paths
    if (path === '021332' || path === '021331') {
      // Stop the theme music
      if (themeMusic) {
        themeMusic.pause();
        themeMusic.currentTime = 0; // Reset the theme music
      }

      // Create and display the Rickroll video
      const rickrollContainer = document.createElement('div');
      rickrollContainer.style.position = 'fixed';
      rickrollContainer.style.top = '0';
      rickrollContainer.style.left = '0';
      rickrollContainer.style.width = '100%';
      rickrollContainer.style.height = '100%';
      rickrollContainer.style.backgroundColor = 'black';
      rickrollContainer.style.zIndex = '9999';

      const rickrollVideo = document.createElement('video');
      rickrollVideo.src = './Website/app/static/sounds/rickrollshort.mp4'; // Local video path
      rickrollVideo.autoplay = true;
      rickrollVideo.controls = false;
      rickrollVideo.style.width = '100%';
      rickrollVideo.style.height = '100%';
      rickrollVideo.style.objectFit = 'cover';

      // Remove the video after it ends
      rickrollVideo.addEventListener('ended', () => {
        rickrollContainer.remove();
        location.reload(); // Reload to restart the game
      }
      );

      // Append the video to the container and add it to the body
      rickrollContainer.appendChild(rickrollVideo);
      document.body.appendChild(rickrollContainer);

      return; // Stop further processing
    }

    console.log('Loading game state for path:', path);
    try {
      const docRef = doc(db, 'stories', 'Sci fi'); // Adjust Firestore path as needed
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error('No game state document found!');
        gameText.textContent = 'Game state not found!';
        return;
      }

      const gameStateData = docSnap.data();
      const gameState = gameStateData.events[path];
      if (!gameState) {
        console.error(`No game state found for path: ${path}`);
        gameText.textContent = 'Error 404: Story event not found.';
        return;
      }

      handleGameState(gameState, path);
    } catch (error) {
      console.error('Error loading game state: ', error);
      gameText.textContent = 'An error occurred while loading the game state.';
    }
  }

  // Process and display the game state
  function handleGameState (gameState, currentPath) {
  // Use typewriter effect for text
    typeText(gameText, gameState.storyText, 25);

    if (gameState.options) {
      handleOptions(gameState.options, currentPath);
    } else if (['BadEnding', 'GoodEnding', 'NeutralEnding', 'Error'].includes(gameState.type)) {
      handleEndings(gameState.storyText, gameState.type, currentPath);
    } else {
      addBackButton(currentPath);
    }
  }

  // Display options as buttons
  function handleOptions (options, /* optionPaths, */currentPath) {
    // Clear existing buttons
    choicesContainer.innerHTML = '';

    // Get the button click sound element
    const buttonClickSound = document.getElementById('button-click-sound');

    // Generate buttons for each option
    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.classList.add('choice-btn');
      button.textContent = option;

      // Play the click sound when the button is clicked and navigate to next story event
      button.addEventListener('click', async () => {
        buttonClickSound.play(); // Play click sound
        const nextPath = `${currentPath}${index + 1}`;
        console.log(`Navigating to path: ${nextPath}`);
        await loadGameState(nextPath); // Load the next game state
      });

      choicesContainer.appendChild(button);
    });
  }

  // Restart button function
  function restartGame () {
    // Play the click sound when the button is clicked and navigate to next story event
    console.log('Restarting game');
    loadGameState('0'); // Load the next game state
  }

  // This function will be called when an ending is reached
  function handleEndings (text, type, path) {
    addEndingTint(type);

    // Clear previous choices
    choicesContainer.innerHTML = '';

    // Add Main Menu Button
    addMainMenuButton();

    // Add Restart Buttton
    addRestartButton();

    // Add Back Button
    addBackButton(path);
  }

  // Add typewriter effect for text with proper handling of interruptions
  function typeText (element, text, speed = 40) {
    let index = 0; // Index for the current character
    element.textContent = ''; // Clear existing text
    if (window.typingInterval) {
      clearInterval(window.typingInterval); // Clear any existing typing interval
    }

    // Start typing effect
    window.typingInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text[index]; // Add next character
        index++;
      } else {
        clearInterval(window.typingInterval); // Stop once all text is displayed
        window.typingInterval = null;
      }
    }, speed);
  }

  function removeTint () {
    const tint = gameplayPage.querySelector('.red-tint, .green-tint, .pastel-blue-tint');
    if (tint) {
      tint.remove(); // Removes the tint element from the DOM
    }
  }

  // Show ending
  function addEndingTint (type) {
    // Create the tint div
    const tint = document.createElement('div');

    // Add the appropriate class based on the ending type
    if (type === 'BadEnding' || type === 'Error') {
      tint.classList.add('red-tint');
    } else if (type === 'GoodEnding') {
      tint.classList.add('green-tint');
    } else if (type === 'NeutralEnding') {
      tint.classList.add('pastel-blue-tint');
    }

    // Append the tint to the gameplay page
    gameplayPage.appendChild(tint);
  }

  // Show the main menu button
  function addMainMenuButton () {
    const mainMenuButton = document.createElement('button');
    mainMenuButton.textContent = 'Main Menu';
    mainMenuButton.classList.add('choice-btn');
    mainMenuButton.addEventListener('click', () => {
      buttonClickSound.play(); // Play click sound
      location.reload(); // Reload the page to restart the game
    });

    choicesContainer.appendChild(mainMenuButton);
  }

  // Show the restart button
  function addRestartButton () {
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.classList.add('choice-btn');
    restartButton.addEventListener('click', () => {
      buttonClickSound.play(); // Play click sound
      removeTint(); // Remove any ending tint
      restartGame();
    });

    choicesContainer.appendChild(restartButton);
  }

  // Show the back button
  function addBackButton (path) {
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Go Back';
    restartButton.classList.add('choice-btn');
    restartButton.addEventListener('click', () => {
      buttonClickSound.play(); // Play click sound
      removeTint(); // Remove any ending tint
      loadGameState(path.slice(0, -1));
    });

    choicesContainer.appendChild(restartButton);
  }
});
