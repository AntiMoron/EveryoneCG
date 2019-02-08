### 好了方便人人有光画我做了个npm包

```bash
npm i -S the-only-one-pack-to-draw-light
```

你需要的唯一的一个包去CPU/GPU画光

![](https://user-images.githubusercontent.com/6587734/52172954-41527e80-27b5-11e9-95d3-b3d1756743cc.png)

用法如下:

```javascript
import { OPDrawLight } from 'the-only-one-pack-to-draw-light';

// 要用cpu绘图改为true
const useCPU = false;
const Kit = useCPU ? OPDrawLight.cpu : OPDrawLight.gpu;

const {
    SDF: {
        Circle,
        Plane,
        Rect,
    },
    render
} = Kit;

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
