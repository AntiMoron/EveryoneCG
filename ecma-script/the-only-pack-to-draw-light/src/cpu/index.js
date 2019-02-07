import { Circle } from './sdf/circle';
import { Plane } from './sdf/plane';
import { Rect } from './sdf/rect';
import { render } from './render';

export default {
    cpu: {
        SDF: {
            Circle, Plane, Rect,
        },
        render,
    }
};