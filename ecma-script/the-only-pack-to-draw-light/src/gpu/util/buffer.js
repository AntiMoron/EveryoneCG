import { GlBase } from './base';

export class Buffer extends GlBase {
    constructor(ctx) {
        super(ctx);
        this._raw = ctx.createBuffer();
    }
}