import { SDF } from './base';
/**
 * 虚拟物体
 * 用于描述一个矩形
 * @date 9012/02/03
 * @author antimoron
 */
export class Rect extends SDF {
    constructor(props, center, theta, s) {
        super(props);
        this._center = center;
        this._theta = theta;
        this._s = s;
    }

    get gpuDesc() {
        const {
            _props: {
                emissive = 0,
                reflectivity = 0,
                eta = 0
            } = {},
            _center: {
                x: cx,
                y: cy
            } = {},
            _s: {
                x: sx,
                y: sy,
            },
            _theta: theta,
        } = this;
        return [
            3.0, emissive, reflectivity, eta,
            cx, cy, sx, sy,
            theta, 0, 0, 0
        ];
    }
}
