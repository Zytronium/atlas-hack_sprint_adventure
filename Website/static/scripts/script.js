// script.js

document.addEventListener("DOMContentLoaded", () => {
    const startGameButton = document.getElementById("start-game");
    const landingPage = document.getElementById("landing-page");
    const gameplayPage = document.getElementById("gameplay-page");
    const gameText = document.getElementById("game-text");
    const choiceButtons = document.querySelectorAll(".choice-btn");

    // Placeholder game data
    const gameData = {
        start: {
            text: "You are on a starship in deep space. A distress signal is detected. What do you do?",
            options: [
                { text: "Investigate the signal", next: "investigate" },
                { text: "Ignore it and continue", next: "ignore" },
                { text: "Contact headquarters", next: "contact" },
            ],
        },
        investigate: {
            text: "You find an abandoned ship with signs of battle. What do you do?",
            options: [
                { text: "Board the ship", next: "board" },
                { text: "Report back to base", next: "report" },
                { text: "Scan the area for danger", next: "scan" },
            ],
        },
        ignore: {
            text: "You ignore the signal and continue your mission. However, the signal was a trap, and your ship is ambushed! You lose.",
            options: [],
            end: "lose",
        },
        contact: {
            text: "Headquarters advises caution. They send reinforcements to investigate. You survive this encounter!",
            options: [],
            end: "win",
        },
        // Add more states as needed
    };

    // Transition from landing page to gameplay
    startGameButton.addEventListener("click", () => {
        landingPage.classList.add("hidden");
        gameplayPage.classList.remove("hidden");
        loadGameState("start");
    });

    // Load a specific game state
    function loadGameState(state) {
        const currentState = gameData[state];
        if (!currentState) return;

        // Update game text
        gameText.textContent = currentState.text;

        // Update buttons
        choiceButtons.forEach((button, index) => {
            if (currentState.options[index]) {
                button.textContent = currentState.options[index].text;
                button.onclick = () => loadGameState(currentState.options[index].next);
                button.style.display = "inline-block";
            } else {
                button.style.display = "none";
            }
        });

        // Handle win/lose states
        if (currentState.end) {
            setTimeout(() => {
                if (currentState.end === "win") {
                    showWinPage();
                } else if (currentState.end === "lose") {
                    showLosePage();
                }
            }, 2000); // Delay to let the player read the message
        }
    }

    // Show win page
    function showWinPage() {
        gameplayPage.innerHTML = `
            <h1>Congratulations!</h1>
            <p>You successfully completed your mission!</p>
            <img src="win-image.jpg" alt="You Win" />
        `;
    }

    // Show lose page
    function showLosePage() {
        gameplayPage.innerHTML = `
            <h1>Game Over</h1>
            <p>Your adventure ends here. Try again?</p>
            <button id="restart-game">Restart</button>
        `;
        document.getElementById("restart-game").addEventListener("click", () => {
            location.reload(); // Reload the game
        });
    }
});
