import Canvas from './canvas.js';

async function Game() {
    //consts
    const TOTAL_MATCHES = 100;
    const ALLOWED_MATCHES_PER_TURN = 10;
    const SCREENSAVER_TIMEOUT_SEC = 30;

    //enums
    const GameState = {
        MENU: 0,
        IN_GAME: 1,
        GAME_OVER: 2,
        SCREENSAVER: 3
    }
    const CurrentPlayer = {
        Human: 0,
        Computer: 1
    }

    //state
    let burntMatches = 0;
    let currentPlayer = CurrentPlayer.Human;
    let gameState = GameState.IN_GAME;

    //canvas
    const canvas = await Canvas(TOTAL_MATCHES, ALLOWED_MATCHES_PER_TURN);

    //game
    const computerMove = (burntMatches) => {
        if (TOTAL_MATCHES <= burntMatches + ALLOWED_MATCHES_PER_TURN) {
            return TOTAL_MATCHES;
        }

        const closestToCurrent = (TOTAL_MATCHES - burntMatches) / (ALLOWED_MATCHES_PER_TURN + 1);
        const potentialNextPoint = TOTAL_MATCHES - ((ALLOWED_MATCHES_PER_TURN + 1) * Math.floor(closestToCurrent));
        if (!Number.isInteger(closestToCurrent) && potentialNextPoint <= burntMatches + ALLOWED_MATCHES_PER_TURN) {
            return potentialNextPoint;
        }

        return burntMatches + 1;
    }

    const isGameOver = () => burntMatches === TOTAL_MATCHES;

    const isLegalMove = (selectedMoveMatchId) => selectedMoveMatchId >= burntMatches && selectedMoveMatchId < burntMatches + ALLOWED_MATCHES_PER_TURN;

    const drawGame = (timestamp) => {
        requestAnimationFrame(drawGame);

        const lastMovedMouse = canvas.getMouseLastMovedTimestamp();

        switch (gameState) {
            case GameState.IN_GAME:
                canvas.clearScreen();
                const burningMatches = isLegalMove(canvas.getMouseoverMatchId()) ? canvas.getMouseoverMatchId() : -1;
                const selectedMatch = canvas.getClickedMatchId();

                if (currentPlayer === CurrentPlayer.Human && isLegalMove(selectedMatch)) {
                    burntMatches = selectedMatch + 1;
                    canvas.drawMatches(timestamp, burntMatches, burningMatches, false);
                    currentPlayer = CurrentPlayer.Computer;
                } else if (currentPlayer === CurrentPlayer.Computer) {
                    const newBurntMatches = computerMove(burntMatches);
                    canvas.drawMatches(timestamp, burntMatches, newBurntMatches, true);
                    burntMatches = newBurntMatches;
                    currentPlayer = CurrentPlayer.Human;
                }

                canvas.drawMatches(timestamp, burntMatches, burningMatches);

                if (isGameOver()) {
                    gameState = GameState.GAME_OVER;
                }

                if ((timestamp - lastMovedMouse) / 1000 > SCREENSAVER_TIMEOUT_SEC) {
                    gameState = GameState.SCREENSAVER;
                }
                break;

            case GameState.GAME_OVER:
                switch (currentPlayer) { //who was the previous player
                    case CurrentPlayer.Human:
                        canvas.drawGameOver(timestamp, canvas.writeYouLose);
                        break;
                    case CurrentPlayer.Computer:
                        canvas.drawGameOver(timestamp, canvas.writeYouWin);
                        break;
                }
                break;

            case GameState.SCREENSAVER:
                canvas.drawScreensaver(timestamp);
                if ((timestamp - lastMovedMouse) / 1000 < SCREENSAVER_TIMEOUT_SEC) {
                    gameState = GameState.IN_GAME;
                }
                break;
        }
    }

    drawGame();
}


Game();
