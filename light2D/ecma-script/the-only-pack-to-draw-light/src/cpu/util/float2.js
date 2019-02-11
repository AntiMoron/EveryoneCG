export function addf2(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
}

export function mulf2(a, b) {
    return {
        x: a.x * b,
        y: a.y * b
    };
}

export function subf2(a, b) {
    return addf2(a, mulf2(b, -1));
}

export function divf2(a, b) {
    return mulf2(a, 1.0 / b);
}
