import { SDF } from './base'
import { subf2 } from '../util/float2';
/**
 * 虚拟物体
 * 用于描述一个圆
 * @date 9012/02/03
 * @author antimoron
 */
export class Circle extends SDF {
    constructor(props, center, radius) {
        super(props);
        this._center = center;
        this._radius = radius;
        this.getSourceDistance = this.getSourceDistance.bind(this);
    }

    getSourceDistance(xy) {
        const {
            _center: center,
            _radius: radius
        } = this;
        let u = subf2(xy, center)
        return Math.sqrt(u.x * u.x + u.y * u.y) - radius;
    }

}