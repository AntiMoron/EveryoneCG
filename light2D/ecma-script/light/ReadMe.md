### Light-Render

Nice 2D light rendering with pretty good ray tracing effect. Providing both CPU & GPU ways.

Features included in this package:

- Monte Carlo integral
- Ray Tracing
- Jittered sampling

Thanks for [Miloyip](https://github.com/miloyip)'s [sharing](https://zhuanlan.zhihu.com/p/30745861). Also he's the author of [RapidJson](https://github.com/Tencent/rapidjson) which is a really effecient json parsing library.

### Install

```bash
npm i -S light-render
```

![](https://user-images.githubusercontent.com/6587734/52172954-41527e80-27b5-11e9-95d3-b3d1756743cc.png)

A quick glance at `Light` with a short demo:

```javascript
import { Light } from 'light-render';

// Whether to render in CPU.
const useCPU = false;
const Kit = useCPU ? Light.cpu : Light.gpu;

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

// Rendering method.
render(document.getElementById('cv'), c.union(i.intersect(j)));
```

#### render arguments

Declaration:

```javascript
function render(cv, objs, opts)
```

##### cv: HTMLCanvasElement

    Canvas DOM

##### objs

    objects that being described in sdf.

    > What's SDF? It's a kind of model that can build a scene in this senario called `Signed Distance Field`.

SDF constructors:

- Circle(props, center, radius)
- Rect(props, center, theta, s)
- Plane(props, pxy, normal)

SDF methods:

- union(o)
- intersect(o)
- subtract(o)

##### opts: options for rendering

- N Times to sample. `64.0` by default
- MAX_STEP Maximum steps for ray tracing. `10` by default.
- MAX_DISTANCE Maximum distance for ray tracing. `10.0` by default.
