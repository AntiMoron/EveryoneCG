import { SDF } from './base'

/**
 * 虚拟物体
 * 用于描述一个平面
 * @date 9012/02/04
 * @author antimoron
 */
export class Plane extends SDF {
    constructor(props, pxy, normal) {
        super(props);
        this._pxy = pxy;
        this._normal = normal;
    }

    get gpuDesc() {
        const {
            _props: {
                emissive = 0,
                reflectivity = 0,
                eta = 0
            } = {},
            _pxy: {
                x: px,
                y: py
            } = {},
            _normal: {
                x: nx,
                y: ny
            } = {},
        } = this;
        return new Float32Array([
            2.0, emissive, reflectivity, eta,
            px, py, nx, ny,
        ]);
    }
}

