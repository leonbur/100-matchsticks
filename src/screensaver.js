export default async function Screensaver(ctx, initTimestamp, width, height, squareSize) {
    const ts = initTimestamp;
    function _randomColor() {
        const r = Math.random() * 255
        const g = Math.random() * 255
        const b = Math.random() * 255
        return 'rgb(' + r + ',' + g + ',' + b + ')'
    }

    let x = 0;
    let y = 0;
    let dx = squareSize;
    let dy = squareSize;

    const draw = (timestamp) => {
        const amount = Math.floor((timestamp - initTimestamp) / 1000);
        const result = [];

        for (let i = 0; i < amount; i++) {
            ctx.fillStyle = _randomColor();
            ctx.fillRect(x, y, dx, dy);

            if (x > width || x < 0) {
                dx = -dx
            }
            if (y > height || y < 0) {
                dy = -dy
            }

            x += dx
            y += dy
        }

        return result;
    }

    return Object.freeze({
        draw
    });
}
