import { Match, MatchState } from './match.js';

//consts
const TOTAL_MATCHES = 100;
const ALLOWED_MATCHES_PER_TURN = 10;

const MATCH_WIDTH = 30;
const MATCH_HEIGHT = 60;
const SPACE_BETWEEN_MATCHES = window.innerWidth * 0.01;
const LEFT_PADDING_TO_CENTRALIZE = (window.innerWidth / 2) - (ALLOWED_MATCHES_PER_TURN * MATCH_WIDTH / 2) - SPACE_BETWEEN_MATCHES;



//canvas init
const canvas = document.querySelector('canvas');
// canvas.width = ALLOWED_MATCHES_PER_TURN * (MATCH_WIDTH  + SPACE_BETWEEN_MATCHES); //TODO try to centralize the canvas in CSS
canvas.width = window.innerWidth;
canvas.height = TOTAL_MATCHES / ALLOWED_MATCHES_PER_TURN * (MATCH_HEIGHT + SPACE_BETWEEN_MATCHES) + SPACE_BETWEEN_MATCHES;
const ctx = canvas.getContext('2d');



//state
let burntMatches = 0;
let lastPlayerWasHuman = true;
const matches = [];
const mouse = {
    x: 0,
    y: 0,
    lastMoved: Number.MAX_SAFE_INTEGER
}
const GameState = {
    MENU: 0,
    IN_GAME: 1,
    GAME_OVER: 2,
    SCREENSAVER: 3
}
let gameState = GameState.IN_GAME;

//mouse helper functions
canvas.addEventListener('mousemove', (evt) => {
    mouse.x = evt.x;
    mouse.y = evt.y;
    mouse.lastMoved = evt.timeStamp;
})

canvas.addEventListener('click', (evt) => { //TODO: consider refactoring this
    const clickedMatchId = getMouseoverMatchId();
    if (clickedMatchId >= burntMatches && clickedMatchId < burntMatches + ALLOWED_MATCHES_PER_TURN) {
        burntMatches = clickedMatchId + 1;
        lastPlayerWasHuman = true;

        //TODO: REMOVE
        if (!isGameOver()) {
            lastPlayerWasHuman = false;
            const c_move = computerMove(burntMatches);
            console.log(c_move);
            burntMatches = c_move;
        }
    }
})

const getMouseoverMatchId = () => matches.findIndex(match => match.isMouseover(mouse));

//game
const reset = (imgs) => {
    for (let row = 0; row < TOTAL_MATCHES/ALLOWED_MATCHES_PER_TURN; row++ ) {
        for (let col = 0; col < ALLOWED_MATCHES_PER_TURN; col++) {
            const id = row * 10 + col;
            const pos_x = col * (MATCH_WIDTH) + LEFT_PADDING_TO_CENTRALIZE;
            const pos_y = row * (MATCH_HEIGHT + SPACE_BETWEEN_MATCHES) + SPACE_BETWEEN_MATCHES;

            matches.push(new Match(imgs, id, pos_x, pos_y, MATCH_WIDTH, MATCH_HEIGHT));
        }
    }
}

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

const writeGradientText = (text, color1, color2, color3, timestamp, ctx) => {
    const ts = Math.abs((timestamp % 2000) - 1000) / 1000

    let grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grd.addColorStop(0, color1);
    grd.addColorStop(ts, color2);
    grd.addColorStop(1, color3);

    ctx.font = "150px Comic Sans MS";
    ctx.fillStyle = grd;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width/2, canvas.height/2); 
}

const writeYouWin = (timestamp, ctx) => writeGradientText("You WIN!", "cyan", "yellow", "green", timestamp, ctx)

const writeYouLose = (timestamp, ctx) => writeGradientText("You lose...", "blue", "red", "magenta", timestamp, ctx)

const drawGame = (timestamp) => {
    requestAnimationFrame(drawGame);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const selectedMatchId = getMouseoverMatchId();

    matches.forEach((match, idx) => {
        if (idx < burntMatches) {
            match.draw(ctx, MatchState.BURNT);
        } else if (idx <= selectedMatchId && selectedMatchId >= burntMatches && selectedMatchId < burntMatches + ALLOWED_MATCHES_PER_TURN) {
            match.draw(ctx, MatchState.BURNING);
        } else {
            match.draw(ctx, MatchState.UNBURNT);
        }
    });

    if (isGameOver()) {
        // gameState = GameState.GAME_OVER;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (lastPlayerWasHuman) {
            writeYouWin(timestamp, ctx);
        } else {
            writeYouLose(timestamp, ctx);
        }
    }
}

//TODO image loading:
// const imgPromise = img => new Promise(resolve => img.addEventListener('load', resolve, { once: true }))

const loadAssets = async () => {
    const unburnt = new Image();
    const burning = new Image();
    const burnt = new Image();

    unburnt.src = 'assets/images/unburnt.svg';
    burning.src = 'assets/images/burning.svg';
    burnt.src = 'assets/images/burnt.svg';

    return {
        unburnt,
        burning,
        burnt
    };
}

const start = async () => {
    const imgs = await loadAssets();
    reset(imgs);
    drawGame();
}

start();
