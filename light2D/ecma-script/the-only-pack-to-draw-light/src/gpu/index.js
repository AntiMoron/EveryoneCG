/**
 *
 */
import { render } from './render';
import { Rect } from './sdf/rect';
import { Circle } from './sdf/circle';
import { Plane } from './sdf/plane';

export default {
    gpu: {
        SDF: {
            Circle, Plane, Rect,
        },
        render,
    }
};