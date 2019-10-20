export class Match {
    constructor(imgs, id, pos_x, pos_y, size_x, size_y) {
        this.imgs = imgs;
        this.id = id;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.size_x = size_x;
        this.size_y = size_y;
    }

    isMouseover(mouse) {
        return mouse.x >= this.pos_x &&
            mouse.x <= this.pos_x + this.size_x &&
            mouse.y >= this.pos_y &&
            mouse.y <= this.pos_y + this.size_y;
    }

    draw(ctx, state) {
        switch(state) {
            case MatchState.UNBURNT:
                ctx.drawImage(this.imgs.unburnt, this.pos_x, this.pos_y, this.size_x, this.size_y);
                break;
            case MatchState.BURNING:
                ctx.drawImage(this.imgs.burning, this.pos_x, this.pos_y, this.size_x, this.size_y);
                break;
            case MatchState.BURNT:
                ctx.drawImage(this.imgs.burnt, this.pos_x, this.pos_y, this.size_x, this.size_y);
                break;
        }
    }
}

export const MatchState = {
    UNBURNT: 1,
    BURNING: 2,
    BURNT: 3
}
