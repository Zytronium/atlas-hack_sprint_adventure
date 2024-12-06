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
    console.log("Game state data:", gameStateData);  // Log the game state data to verify its structure

    // Check if 'events' is a valid map (an object with key-value pairs)
    if (gameStateData.events && typeof gameStateData.events === 'object') {
      console.log("Available paths in events:", Object.keys(gameStateData.events));  // Log all the paths in the events map

      // Directly access the specific game state from the map using the `path`
      const gameState = gameStateData.events[path];

      if (!gameState) {
        console.error(`No game state found for path: ${path}`);
        gameText.textContent = `No game state found for path: ${path}`;
        return;
      }

      // Check if the path has a nested map (like `0`) that contains options
      const pathDetails = gameState[Object.keys(gameState)[0]];  // Access the first key (e.g., `0` map)
      const options = pathDetails?.options;

      if (options) {
        console.log("Available options:", options);  // Log the available options

        // Update the game UI with the story text
        gameText.textContent = gameState.storyText;

        // Generate buttons for the available options
        handleOptions(options, path);

      } else {
        console.log("No options found for path:", path);
        // Handle special endings
        handleEndings(gameState);
      }

    } else {
      console.error("'events' is not a valid object:", gameStateData.events);
      gameText.textContent = "'events' is not a valid object!";
    }

  } catch (error) {
    console.error("Error fetching game state:", error);
    gameText.textContent = "An error occurred while loading the game state.";
  }
}

function handleOptions(options, currentPath) {
  const optionButtons = options.map((option, index) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => {
      // Construct the next path based on the current path
      const nextPath = `${currentPath.slice(0, -1)}${index + 1}`;  // Add the option index
      console.log(`Next path: ${nextPath}`);
      loadGameState(nextPath); // Load the next game state based on the constructed path
    };
    return button;
  });

  // Append the option buttons to the UI (for example, a div with id 'options')
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = ''; // Clear any previous options
  optionButtons.forEach(button => optionsDiv.appendChild(button));
}

function handleEndings(gameState) {
  // If it's a BadEnding, GoodEnding, or NeutralEnding, show the result and stop the game
  if (gameState.type === "BadEnding" || gameState.type === "GoodEnding" || gameState.type === "NeutralEnding") {
    gameText.textContent = gameState.storyText;  // Display the ending text
    // You can add any logic to stop further choices or restart the game
    const restartButton = document.createElement('button');
    restartButton.textContent = "Restart Game";
    restartButton.onclick = () => loadGameState('power:0'); // Restart from the initial path
    optionsDiv.appendChild(restartButton);
  }
}