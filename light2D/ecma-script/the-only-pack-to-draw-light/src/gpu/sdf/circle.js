import { SDF } from './base'
/**
 * 虚拟物体
 * 用于描述一个圆
 * @date 9012/02/03
 * @author antimoron
 */
export class Circle extends SDF {
    constructor(props, center, radius) {
        super(props);
        // 6 floats + 1 type
        // emissive
        // reflectivity
        // eta
        // center: {x,y}
        // radius
        this._center = center;
        this._radius = radius;
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
            _radius: radius
        } = this;
        return `createLS(circleSDF(xy, vec2(${this.floatize(cx)}, ${this.floatize(cy)}), ${this.floatize(radius)}), ${this.floatize(emissive)}, ${this.floatize(reflectivity)}, ${this.floatize(eta)})`;
        // return [
        //     1.0, emissive, reflectivity, eta,
        //     cx, cy, radius, 0
        // ];
    }
}