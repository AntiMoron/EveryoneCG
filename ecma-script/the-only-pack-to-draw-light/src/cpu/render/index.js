import { addf2, mulf2 } from '../util/float2';

let N = 32;
let MAX_STEP = 10;
let MAX_DISTANCE = 4.0;
let EPSILON = 1e-6;
let BIAS = 1e-4;

/**
 * 接纳处理好的图形
 * @param {*} xy
 * @param {*} o
 */
function adaptSDF(xy, o) {
    const {
        _opQueue: queue
    } = o;
    let ls = o.getLightSource(xy);
    if (queue.length === 0) {
        return ls;
    }
    for (const cmd of queue) {
        const {
            t: type,
            to
        } = cmd;
        switch (type) {
            case 'u':
                ls = ls.union(adaptSDF(xy, to));
                break;
            case 'i':
                ls = ls.intersect(adaptSDF(xy, to));
                break;
            case 's':
                ls = ls.subtract(adaptSDF(xy, to));
                break;
        }
    }
    return ls;
}

function scene(xy, objs) {
    return adaptSDF(xy, objs);
}


// 说是计算法线
function gradient(xy, objs) {
    return {
        x: (scene({ x: (xy.x + EPSILON, xy.y), y: 0 }, objs).sourceDistance
            - scene({ x: (xy.x - EPSILON, xy.y), y: 0 }, objs).sourceDistance) * (0.5 / EPSILON),
        y: (scene({ x: (xy.x, xy.y + EPSILON), y: 0 }, objs).sourceDistance
            - scene({ x: (xy.x, xy.y - EPSILON), y: 0 }, objs).sourceDistance) * (0.5 / EPSILON)
    };
}

/**
 * 折射函数
 * @param {*} ixy
 * @param {*} nxy
 */
function reflect(ixy, nxy) {
    const idotn2 = (ixy.x * nxy.x + ixy.y * nxy.y) * 2.0;
    return {
        x: ixy.x - idotn2 * nxy.x,
        y: ixy.y - idotn2 * nxy.y
    };
}

/**
 * 折射函数
 * @param {*} ixy
 * @param {*} nxy
 * @param {*} eta
 */
function refract(ixy, nxy, eta) {
    const idotn = ixy.x * nxy.x + ixy.y * nxy.y;
    const k = 1.0 - eta * eta * (1.0 - idotn * idotn);
    const a = eta * idotn + Math.sqrt(k);
    return {
        x: eta * ixy.x - a * nxy.x,
        y: eta * ixy.y - a * nxy.y
    };
}

/**
 * ray tracing
 * @param {*} o
 * @param {*} d
 * @param {*} objs 要渲染的对象
 * @param {*} depth
 */
function trace(o, d, objs, depth) {
    let t = .0;
    // 判断是场景内还是外，间eta注释
    const s = scene(o, objs).sourceDistance > .0 ? 1 : -1;
    for (let i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        let xy = addf2(mulf2(d, t), o);
        const sd = scene(xy, objs);
        sd.sourceDistance *= s;
        if (sd.sourceDistance < EPSILON) {
            // 反射
            let sum = sd.emissive;
            if (depth < 3) {
                let refl = sd.reflectivity;
                if (sd.reflectivity > .0 || sd.eta > .0) {
                    let normal = gradient(xy, objs);
                    normal = mulf2(normal, s);// 在内的话，要反转法线
                    // normal = normalize(normal);
                    if (sd.eta > .0) {
                        const etaRange = refract(d, normal, s < .0 ? sd.eta : 1.0 / sd.eta);
                        sum += (1.0 - refl) * trace(xy - normal * BIAS, etaRange, objs, depth + 1);
                    }
                    if (refl > .0) {
                        const refl2 = reflect(d, normal);
                        sum += refl * trace(xy + normal * BIAS, refl2, objs, depth + 1);
                    }
                }
            }
            return sum;
        }
        t += sd.sourceDistance;
    }
    return .0;
}

/**
 * 采样(x,y)的颜色
 * jitter sampling.
 * @param {*} xy x,y像素点
 * @param {Array} objs 填入一堆SDF对象
 */
function sample(xy, objs) {
    let sum = .0;
    for (let i = 0; i < N; i++) {
        let a = Math.PI * 2.0 * (i + Math.random()) / N;
        sum += trace(xy, { x: Math.cos(a), y: Math.sin(a) }, objs, 0);
    }
    return sum / 64.0;
}


/**
 * 给一个canvas和SDF对象，画出值
 * @param {*} cv HTML canvas element
 * @param {*} objs SDF对象树
 */
export function render(cv, objs) {
    if (!cv) {
        throw new Error('canvas element not available.');
    }
    const context = cv.getContext('2d');
    if (!context) {
        throw new Error('Canvas not supported on current browser.');
    }
    const W = cv.width, H = cv.height;
    const imgData = context.createImageData(W, H);

    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const idx = i * W + j;
            const gray = Math.floor(sample({ x: 1.0 * j / W, y: 1.0 * i / H }, objs) * 255.0, 0);
            imgData.data[idx * 4] = gray;
            imgData.data[idx * 4 + 1] = gray;
            imgData.data[idx * 4 + 2] = gray;
            imgData.data[idx * 4 + 3] = 255;
        }
    }
    context.putImageData(imgData, 0, 0);
}