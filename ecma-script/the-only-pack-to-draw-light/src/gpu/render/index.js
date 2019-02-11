import { Scene } from '../util/scene'
import vs from '../shader/draw/v';
import fs from '../shader/draw/f';
import { VERT_POS } from '../util/program';

/**
 * 给一个canvas和SDF对象，画出值
 * @param {*} cv HTML canvas element
 * @param {*} objs SDF对象树
 * @param {object} opts 属性
 */
export function render(cv, objs, opts) {
    if (!cv) {
        throw new Error('canvas element not available.');
    }
    const context = cv.getContext('webgl');
    if (!context) {
        throw new Error('Webgl not supported on current browser.');
    }

    let elements = new Set();
    const flattenTree = (objs) => {
        if (!objs) { return; }
        elements.add(objs);
        const {
            _opQueue: queue
        } = objs;
        for (const cmd of queue) {
            const {
                t: type,
                to
            } = cmd;
            switch (type) {
                case 'u':
                    flattenTree(to);
                    break;
                case 'i':
                    flattenTree(to);
                    break;
                case 's':
                    flattenTree(to);
                    break;
            }
        }
    };
    // 平铺所有元素
    flattenTree(objs);
    elements = [...elements];
    // 提前返回
    if (elements.length === 0) {
        return;
    }

    // let sdfs = [];
    // let ops = [];

    // 找到组合顺序
    // const adaptSDF = (o) => {
    // if (!o) { return; }
    // const {
    //     _opQueue: queue
    // } = o;
    // const elemIdx = elements.findIndex(_ => _ === o);
    // if (elemIdx < 0) { return; }
    // // 补齐16个float表示一个sdf
    // const desc = o.gpuDesc;
    // for (let i = desc.length; i < 16; i++) {
    //     desc.push(0);
    // }

    // sdfs[elemIdx] = desc;
    // if (queue.length === 0) {
    //     return;
    // }
    // for (const cmd of queue) {
    //     const {
    //         t: type,
    //         to
    //     } = cmd;
    //     const datas = [0, 0, 0, 0];
    //     switch (type) {
    //         case 'u':
    //             datas[0] = 1;
    //             break;
    //         case 'i':
    //             datas[0] = 2;
    //             break;
    //         case 's':
    //             datas[0] = 3;
    //             break;
    //     }
    //     datas[1] = elemIdx;
    //     datas[2] = elements.findIndex(_ => _ === to);
    //     ops.push(datas);
    //     adaptSDF(to);
    // }
    // }
    // adaptSDF(objs);
    // sdfs = sdfs.reduce((pre, cur) => {
    //     return pre.concat(cur);
    // }, []);
    // ops = ops.reduce((pre, cur) => {
    //     return pre.concat(cur);
    // }, []);

    const scene = new Scene(context);

    const sceneCodeGenerator = (o) => {
        if (!o) { return; }
        const {
            _opQueue: queue
        } = o;
        const elemIdx = elements.findIndex(_ => _ === o);
        if (queue.length === 0) {
            return `a${elemIdx}`;
        }
        for (const cmd of queue) {
            const {
                t: type,
                to
            } = cmd;
            switch (type) {
                case 'u':
                    return `unionOp(a${elemIdx}, ${sceneCodeGenerator(to)})`;
                case 'i':
                    return `intersectOp(a${elemIdx}, ${sceneCodeGenerator(to)})`;
                case 's':
                    return `subtractOp(a${elemIdx}, ${sceneCodeGenerator(to)})`;
            }
        }
    };
    // 动态生成shader,还要防止递归调用
    const defs = elements.map((o, idx) => {
        return `LightSource a${idx} = ${o.gpuDesc};`;
    }).join('\n');
    const fragShaderSoucePart = defs + `\nreturn ${sceneCodeGenerator(objs)};`;
    const { N, MAX_STEP, MAX_DISTANCE } = opts || {
        N: '64.0',
        MAX_STEP: '64',
        MAX_DISTANCE: '10.0',
    };
    const fragShaderSouce = fs(cv.width, cv.height, fragShaderSoucePart, N, MAX_STEP, MAX_DISTANCE);
    console.log(fragShaderSoucePart);
    const flat2D = scene.createGlProgram(vs, fragShaderSouce,
        [VERT_POS]);
    scene.bindProgram(flat2D);
    const screenRect = scene.createVertices([
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0,], 2,
        [0, 1.0,
            1.0, 1.0,
            0, 0,
            1.0, 0,], 2);
    scene.clear();
    scene.draw(screenRect, 'trianglestrip');
}