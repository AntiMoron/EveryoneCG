import { Circle } from './src/sdf/circle';
import { Plane } from './src/sdf/plane';
import { Rect } from './src/sdf/rect';
import { render } from './src/render';

export const OPDrawLight = {
    cpu: {
        SDF: {
            Circle, Plane, Rect,
        },
        render,
    }
};