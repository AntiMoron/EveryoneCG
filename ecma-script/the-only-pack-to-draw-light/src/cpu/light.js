/**
 * 用于描述一个光源
 * @date 9012/02/03
 * @author antimoron
 */
export class LightSource {
    // 光源距离
    sourceDistance = 0;
    // 光(头)强
    emissive = 0;
    // 反射率
    // 如果反射率超过 1，总能量就变多，不符合能量守恒。少于 1 代表形状吸收了能量。
    reflectivity = 0;
    // 介质折射率
    // 如果光线从外至内，调用 \texttt{refract()} 时，传入 1 / \eta ；从内至外则传入 \eta 。
    eta = 0;
    // 是否三色散射
    triray = false;

    /**
     * 构造一个光源
     * 分别用于方便构建的4种模式
     * humble 就比较谦虚
     * awesome 表示带个反射
     * badass 会多带个折射
     * asdfasdfasdfasdfasdf 5个asdf，方便你在小白面前脸滚键盘都能做出效果
     * @param {string} other 'humble' | 'awesome' | 'badass' | 'asdfasfdasdfasdfasdf'
     *                      当为另一个light source时候为复制
     */
    constructor(other) {
        if (typeof other === 'string') {
            const mode = other;
            switch (mode) {
                case 'humble':
                    break;
                case 'awesome':
                    this.reflectivity = 0.5;
                    break;
                case 'badass':
                    this.reflectivity = 0.8;
                    this.refract = 1.5;
                    break;
                case 'asdfasdfasdfasdfasdf':
                default:
                    this.reflectivity = 0.8;
                    this.triray = true;
                    break;
            }
        } else if (!!other) {
            this.sourceDistance = other.sourceDistance;
            this.emissive = other.emissive;
            this.reflectivity = other.reflectivity;
            this.eta = other.eta;
            this.triray = other.triray;
        }
    }

    /**
     * 合并两个光
     */
    union = (o) => {
        return new LightSource(this.sourceDistance < o.sourceDistance ? this : o);
    }
    /**
     * 交集两个光
     */
    intersect = (o) => {
        const r = new LightSource(this.sourceDistance > o.sourceDistance ? o : this);
        r.sourceDistance = this.sourceDistance > o.sourceDistance ? this.sourceDistance : o.sourceDistance;
        return r;
    }
    /**
     * 减法两个光
     * 注意没有交换律
     */
    subtract = (o) => {
        const r = new LightSource(this);
        r.sourceDistance = (this.sourceDistance > -o.sourceDistance) ? this.sourceDistance : -o.sourceDistance;
        return r;
    }
};