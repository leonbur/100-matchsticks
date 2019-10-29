import { Match, MatchState } from './match.js';
import Screensaver from './screensaver.js';

export default async function Canvas(TOTAL_MATCHES, ALLOWED_MATCHES_PER_TURN) {

    let _params = {
        TOTAL_MATCHES,
        ALLOWED_MATCHES_PER_TURN,
        PADDING_RATIO: 0.05,
        HORIZONTAL_SPACING_RATIO: 0.05,
        VERTICAL_PADDING_RATIO: 0.03,
        MAX_WIDTH: 1000,
        MATCH_DIMENSIONS_RATIO: 1.7,
        ANIMATION_LENGTH: 800,
        SCREENSAVER_SQUARE_SIZE: 5,
        TEXT_FONT: `${Math.floor(window.innerWidth / 1920 * 150)}px Comic Sans MS`,

        assets: {
            unburnt: 'assets/images/unburnt.svg',
            burning: 'assets/images/burning.svg',
            burnt: 'assets/images/burnt.svg'
        }
    }

    const _loadAssets = async (assets) => {
        const promises = [];

        for (let matchImage in assets) {
            let srcUrl = assets[matchImage];
            const img = new Image();
            const imgPromise = new Promise(resolve => img.addEventListener('load', resolve, { once: true }));
            img.src = srcUrl;
            assets[matchImage] = img;
            promises.push(imgPromise);
        }

        return Promise.all(promises).then(() => assets);
    }

    //canvas init
    _params.images = await _loadAssets(_params.assets);
    const _canvas = document.querySelector('canvas');
    const _ctx = _canvas.getContext('2d');
    let _screensaver;

    //state
    let _matches = [];

    //mouse listeners
    const _mouse = {
        x: -1,
        y: -1,
        clickedMatchId: -1,
        lastMoved: Number.MAX_SAFE_INTEGER
    }

    _canvas.addEventListener('mousemove', (evt) => {
        const rect = _canvas.getBoundingClientRect()
        _mouse.x = evt.x - rect.left;
        _mouse.y = evt.y - rect.top;
        _mouse.lastMoved = evt.timeStamp;
        _screensaver = null;
    })

    _canvas.addEventListener('click', (evt) => {
        if (_currentlyAnimatingComputerMove.timestamp == -1) {
            const rect = _canvas.getBoundingClientRect()
            const clickedX = evt.x - rect.left;
            const clickedY = evt.y - rect.top;
            _mouse.clickedMatchId = _matches.findIndex(match => match.isMouseover(clickedX, clickedY));
        }
    })

    const getMouseoverMatchId = () => _matches.findIndex(match => match.isMouseover(_mouse.x, _mouse.y));

    const getMouseLastMovedTimestamp = () => _mouse.lastMoved;

    const getClickedMatchId = () => {
        const clickedMatchId = _mouse.clickedMatchId;
        _mouse.clickedMatchId = -1;
        return clickedMatchId;
    }

    //gameover
    const _writeGradientText = (text, color1, color2, color3, timestamp) => {
        const ts = Math.abs((timestamp % 2000) - 1000) / 1000;

        let grd = _ctx.createLinearGradient(0, 0, _canvas.width, 0);
        grd.addColorStop(0, color1);
        grd.addColorStop(ts, color2);
        grd.addColorStop(1, color3);


        _ctx.font = _params.TEXT_FONT;
        _ctx.fillStyle = grd;
        _ctx.textAlign = "center";
        _ctx.fillText(text, (_canvas.width) / 2, (_canvas.height) / 2);
    }

    const drawGameOver = (timestamp, textFunction) => {
        _ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
        textFunction(timestamp, _ctx)
    }
    const writeYouWin = (timestamp) => _writeGradientText("You WIN!", "cyan", "yellow", "green", timestamp, _ctx)

    const writeYouLose = (timestamp) => _writeGradientText("You lose...", "blue", "red", "magenta", timestamp, _ctx)

    const clearScreen = () => _ctx.clearRect(0, 0, _canvas.width, _canvas.height)

    //reset
    const _instantiate = () => {
        _matches.length = [];

        const rows = _params.TOTAL_MATCHES / _params.ALLOWED_MATCHES_PER_TURN;
        const cols = _params.ALLOWED_MATCHES_PER_TURN;

        _canvas.width = window.innerWidth;
        const paddedWidth = Math.min(_params.MAX_WIDTH, _canvas.width - 2 * _canvas.width * _params.PADDING_RATIO);
        const horizontalSpaceBetweenMatches = paddedWidth * _params.HORIZONTAL_SPACING_RATIO;
        const matchWidth = (paddedWidth - (_params.ALLOWED_MATCHES_PER_TURN - 1) * horizontalSpaceBetweenMatches) / _params.ALLOWED_MATCHES_PER_TURN;
        const leftPadding = (_canvas.width - paddedWidth) / 2;

        const matchHeight = matchWidth * _params.MATCH_DIMENSIONS_RATIO;
        const verticalSpaceBetweenMatches = matchWidth * _params.VERTICAL_PADDING_RATIO;
        _canvas.height = rows * (matchHeight + verticalSpaceBetweenMatches);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const id = row * 10 + col;
                const pos_x = col * (matchWidth + horizontalSpaceBetweenMatches) + leftPadding;
                const pos_y = row * (matchHeight + verticalSpaceBetweenMatches);

                _matches.push(new Match(_params.images, id, pos_x, pos_y, matchWidth, matchHeight));
            }
        }
    }

    window.addEventListener('resize', () => {
        _instantiate();
    })

    const _currentlyAnimatingComputerMove = {
        timestamp: -1,
        burnt: -1,
        burning: -1
    }

    const drawMatches = (timestamp, burntMatchesLastId, burningMatchesLastId = -1, animateComputerMove) => {
        if (animateComputerMove) {
            _currentlyAnimatingComputerMove.timestamp = timestamp;
            _currentlyAnimatingComputerMove.burnt = burntMatchesLastId;
            _currentlyAnimatingComputerMove.burning = burningMatchesLastId;
        }
        if (timestamp < _currentlyAnimatingComputerMove.timestamp + _params.ANIMATION_LENGTH) {
            burntMatchesLastId = _currentlyAnimatingComputerMove.burnt;
            burningMatchesLastId = _currentlyAnimatingComputerMove.burning - 1;
        } else {
            _currentlyAnimatingComputerMove.timestamp = -1;
        }

        _matches.forEach((match, idx) => {
            if (idx < burntMatchesLastId) {
                match.draw(_ctx, MatchState.BURNT);
            } else if (idx <= burningMatchesLastId) {
                match.draw(_ctx, MatchState.BURNING);
            } else {
                match.draw(_ctx, MatchState.UNBURNT);
            }
        });
    }

    const drawScreensaver = async (timestamp) => {
        if (!_screensaver) {
            _screensaver = await Screensaver(_ctx, timestamp, _canvas.width, _canvas.height, _params.SCREENSAVER_SQUARE_SIZE);
        }
        _screensaver.draw(timestamp);
    }


    _instantiate();


    return Object.freeze({
        getMouseoverMatchId,
        getMouseLastMovedTimestamp,
        getClickedMatchId,
        clearScreen,
        drawGameOver,
        writeYouWin,
        writeYouLose,
        drawMatches,
        drawScreensaver
    });
}
