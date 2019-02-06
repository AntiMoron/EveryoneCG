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
        this.getSourceDistance = this.getSourceDistance.bind(this);
    }

    getSourceDistance(xy) {
        const {
            _center: center,
            _theta: theta,
            _s: s
        } = this;
        const costheta = Math.cos(theta), sintheta = Math.sin(theta);
        const dx = Math.abs((xy.x - center.x) * costheta + (xy.y - center.y) * sintheta) - s.x;
        const dy = Math.abs((xy.y - center.y) * costheta - (xy.x - center.x) * sintheta) - s.y;
        const ax = Math.max(dx, 0), ay = Math.max(dy, 0);
        return Math.min(Math.max(dx, dy), 0) + Math.sqrt(ax * ax + ay * ay);
    }


}
