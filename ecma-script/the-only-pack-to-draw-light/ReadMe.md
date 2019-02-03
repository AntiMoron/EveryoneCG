### 好了方便人人有光画我做了个npm包

```bash
npm i -S the-only-one-pack-to-draw-light
```

你需要的唯一的一个包去CPU画光，[有卡爆风险]

用法如下:

```javascript
import { OPDrawLight } from 'the-only-one-pack-to-draw-light';

const {
    cpu: {
        SDF: {
            Circle,
            Plane,
        },
        render
    }
} = OPDrawLight;

const c = new Circle({
    emissive: 20,
    reflectivity: 0,
    eta: 0,
}, { x: 0.5, y: -0.5 }, .05)
const i = new Circle({
    emissive: 0,
    reflectivity: .2,
    eta: 1.5,
}, { x: 0.5, y: 0.87 }, 0.2);
const j = new Plane({
    emissive: 0,
    reflectivity: .2,
    eta: 1.45,
}, { x: 0.5, y: .5 }, { x: .0, y: -1.0 });

// 渲染
render(document.getElementById('cv'), c.union(i.intersect(j)));
```