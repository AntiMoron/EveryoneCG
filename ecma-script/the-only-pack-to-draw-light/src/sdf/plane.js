import { SDF } from './base'

/**
 * 虚拟物体
 * 用于描述一个平面
 * @date 9012/02/03
 * @author antimoron
 */
export class Plane extends SDF {
    constructor(props, pxy, normal) {
        super(props);
        this._pxy = pxy;
        this._normal = normal;
        this.getSourceDistance = this.getSourceDistance.bind(this);
    }

    getSourceDistance(xy) {
        const {
            _pxy: pxy,
            _normal: normal
        } = this;
        return (xy.x - pxy.x) * normal.x + (xy.y - pxy.y) * normal.y;
    }
}

