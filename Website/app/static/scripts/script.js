import {
  initializeApp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getFirestore,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

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
const clickToStart = document.getElementById('click-to-start');
const muteButton = document.getElementById('mute-button');
const soundIcon = document.getElementById('sound-icon');
const themeMusic = document.getElementById('theme-music');
let isMuted = false;

// Attempt to play music
playMusic();

// Attach mute toggle to the button
muteButton.addEventListener('click', () => {
  buttonClickSound.play();
  toggleMute();
});

// Function to toggle mute
function toggleMute () {
  isMuted = !isMuted;
  themeMusic.muted = isMuted;
  soundIcon.src = isMuted
    ? './Website/app/static/icons/sound_off.png'
    : './Website/app/static/icons/sound_on.png';
}

function playMusic () {
  themeMusic.play().then(() => {
    console.log('Background music started.');
    clickToStart.style.opacity = '1';
    clickToStart.textContent = 'Now playing: "Wormholes" by @DerekBrandonFiechter on YouTube.';

    // Fade out the "Click to start" text
    const fadeOut = setInterval(() => {
      if (clickToStart.style.opacity > 0) {
        clickToStart.style.opacity -= '0.0055';
      } else {
        clearInterval(fadeOut);
        clickToStart.style.display = 'none';
        muteButton.style.display = 'block'; // Show mute button
      }
    }, 10);
  }).catch(error => {
    console.error('Audio playback failed:', error);
  });
}

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
    removeTint(); // Remove any existing tint

    // Rickroll for specific path
    if (path === '02134') { // Y'all can't count. It's 01234, not 02134.
      // Stop the theme music
      if (themeMusic) {
        themeMusic.pause();
      }

      // Create and display the Rickroll video
      const rickrollContainer = document.createElement('div');
      rickrollContainer.style.position = 'fixed';
      rickrollContainer.style.top = '0';
      rickrollContainer.style.left = '0';
      rickrollContainer.style.width = '100%';
      rickrollContainer.style.height = '100%';
      rickrollContainer.style.backgroundColor = 'black';
      rickrollContainer.style.zIndex = '10';

      const rickrollVideo = document.createElement('video');
      rickrollVideo.src = './Website/app/static/video/rickrollshort.mp4'; // Local video path
      rickrollVideo.autoplay = true;
      rickrollVideo.controls = false;
      rickrollVideo.style.width = '100%';
      rickrollVideo.style.height = '100%';
      rickrollVideo.style.objectFit = 'cover';

      // Remove the video after it ends
      rickrollVideo.addEventListener('ended', () => {
        rickrollContainer.remove();
        playMusic();
      }
      );

      // Append the video to the container and add it to the body
      rickrollContainer.appendChild(rickrollVideo);
      document.body.appendChild(rickrollContainer);
    }

    console.log('Loading game state for path:', path);
    try {
      const docRef = doc(db, 'stories', 'Sci fi'); // Adjust Firestore path as needed
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error('No game state document found!');
        addEndingTint('Error');
        typeText({
          element: gameText,
          text: 'Error 404: Story doc not found.',
          charIntervalNormal: 12.5
        }); // Set game text to indicate 404 error.
        return;
      }

      const gameStateData = docSnap.data();
      const gameState = gameStateData.events[path];
      if (!gameState) {
        let addedText = ''; // nothing by default
        if (path === '02132') { addedText = '\n\n(Intentional Game Design)'; } // Add this to the error message for a specific path to indicate this 404 is intentional

        console.error(`No game state found for path: ${path}`); // Log error in console
        addEndingTint('Error');
        typeText({
          element: gameText,
          text: `Error 404: Story event not found.${addedText}`,
          charIntervalNormal: 2.5
        }); // Set game text to indicate 404 error.
        addEndingButtons(path);
        return;
      }

      handleGameState(gameState, path);
    } catch (error) {
      console.error('Error loading game state: ', error);
      addEndingTint('Error');
      typeText({
        element: gameText,
        text: 'An error occurred while loading the game state.',
        charIntervalNormal: 2.5
      });
      addEndingButtons(path);
    }
  }

  // Process and display the game state
  function handleGameState (gameState, currentPath) {
    // Use typewriter effect for text
    typeText({
      element: gameText,
      text: gameState.storyText,
      charIntervalNormal: 25
    });

    console.log(gameState.type);
    if (['Bad', 'Good'].includes(gameState.type)) {
      addEndingTint(gameState.type);
    }

    if (gameState.options) {
      handleOptions(gameState.options, gameState.optionPaths, currentPath);
    } else if (['BadEnding', 'GoodEnding', 'NeutralEnding', 'Error'].includes(gameState.type)) {
      handleEndings(gameState.storyText, gameState.type, currentPath);
    } else {
      addBackButton(currentPath);
    }
  }

  // Display options as buttons
  function handleOptions (options, optionPaths, currentPath) {
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
        let nextPath = `${currentPath}${index + 1}`;

        // Handle custom option paths (i.e. for the time loop in path 0213)
        if (optionPaths && optionPaths[index]) {
          nextPath = optionPaths[index].split(':')[1];
        }
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

  function addEndingButtons (path) {
    // Clear previous choices
    choicesContainer.innerHTML = '';

    // Add Main Menu Button
    addMainMenuButton();

    // Add Restart Buttton
    addRestartButton();

    // Add Back Button
    addBackButton(path);
  }

  // This function will be called when an ending is reached
  function handleEndings (text, type, path) {
    addEndingTint(type);
    addEndingButtons(path);
  }

  // Add typewriter effect for text with proper handling of interruptions
  function typeText({
                      element,
                      text,
                      charIntervalNormal = 25,
                      charIntervalFast = 5,
                      pauseTimeNormal = 250,
                      pauseTimeFast = 50,
                      pauseChar = "║",
                      typingSpeed = 1, // Default typing speed
                      autoPauseOnPunctuation = true,
                      punctuationPauseMap = {
                        ",": 50,
                        ".": 100,
                        ";": 75,
                        ":": 100,
                        "?": 115,
                        "!": 115,
                        "—": 100, // Long dash
                        "\n": 250
                      },
                      typingPath = Symbol("typingPath"),
                      typeProgress = 0
                    }) {
    // Ensure required properties are present
    if (!text || typeof text !== "string") {
      console.error(`The 'text' parameter is required and must be a string. text value: ${typeText.text}`);
      return;
    }
    if (!element || !(element instanceof HTMLElement)) {
      console.error("The 'element' parameter is required and must be a valid HTMLElement.");
      return;
    }

    // Initialize active paths if not already defined
    if (!typeText.activePaths) {
      typeText.activePaths = new Map();
    }

    // Stop if the message is fully typed or typing path changed
    if (typeProgress >= text.length || typeText.activePaths.get(element) !== typingPath) {
      typeText.activePaths.delete(element);
      return;
    }

    // Initialize the element's text content if starting from scratch
    if (typeProgress === 0) {
      element.textContent = ""; // Clear text
      typeText.activePaths.set(element, typingPath); // Register this typing path
    }

    const currentChar = text[typeProgress];
    let delay = 0;

    // Handle instant typing speed
    if (typingSpeed >= 3) {
      element.textContent = text.replace(new RegExp(pauseChar, "g"), "");
      typeText.activePaths.delete(element);
      return;
    }

    // Handle pause characters
    if (currentChar === pauseChar) {
      delay = typingSpeed === 1 ? pauseTimeNormal : pauseTimeFast;
      setTimeout(() => {
        typeText({
          element,
          text,
          charIntervalNormal,
          charIntervalFast,
          pauseTimeNormal,
          pauseTimeFast,
          pauseChar,
          typingSpeed,
          autoPauseOnPunctuation,
          punctuationPauseMap,
          typingPath,
          typeProgress: typeProgress + 1
        });
      }, delay);
      return;
    }

    // Handle normal typing intervals
    delay = typingSpeed === 1 ? charIntervalNormal : charIntervalFast;

    // Handle punctuation pauses
    if (autoPauseOnPunctuation && punctuationPauseMap[currentChar]) {
      delay += typingSpeed === 1 ? punctuationPauseMap[currentChar] : punctuationPauseMap[currentChar] / 5;
    }

    // Type the current character
    element.textContent += currentChar;

    // Schedule the next character
    setTimeout(() => {
      typeText({
        element,
        text,
        charIntervalNormal,
        charIntervalFast,
        pauseTimeNormal,
        pauseTimeFast,
        pauseChar,
        typingSpeed,
        autoPauseOnPunctuation,
        punctuationPauseMap,
        typingPath,
        typeProgress: typeProgress + 1
      });
    }, delay);
  }

  function removeTint () {
    const tint = gameplayPage.querySelector('.faint-red-tint, .faint-green-tint, .red-tint, .green-tint, .pastel-blue-tint');
    if (tint) {
      tint.remove(); // Removes the tint element from the DOM
    }
  }

  // Show ending
  function addEndingTint (type) {
    // Create the tint div
    const tint = document.createElement('div');

    // Add the appropriate class based on the ending type
    switch (type) {
      case 'Bad':
        tint.classList.add('faint-red-tint');
        break;
      case 'Good':
        tint.classList.add('faint-green-tint');
        break;
      case 'BadEnding':
      case 'Error':
        tint.classList.add('red-tint');
        break;
      case 'GoodEnding':
        tint.classList.add('green-tint');
        break;
      case 'NeutralEnding':
        tint.classList.add('pastel-blue-tint');
        break;
      default:
        // Optional: handle unknown types here
        break;
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

document.addEventListener('DOMContentLoaded', () => {
  const aboutButton = document.getElementById('about-button'); // Reference the About button
  const startButton = document.getElementById('start-game');
  const landingPage = document.getElementById('landing-page');
  const page = document.getElementById('landing-page');

  // Hide the About button when the game starts
  startButton.addEventListener('click', () => {
    if (aboutButton) {
      aboutButton.style.display = 'none'; // Hide About button
    }
  });

  // Ensure the About button is visible on the landing page
  if (landingPage.style.display !== 'none') {
    aboutButton.style.display = 'block'; // Show About button
  }

  // Play background music on hover over background (partial workaround anti-autoplay feature on most browsers)
  document.addEventListener('click', () => {
    playMusic();
  }, { once: true });

  document.addEventListener('mousemove', () => {
    playMusic();
  }, { once: true });
});
