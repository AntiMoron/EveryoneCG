//
//  Shaders.metal
//  RayTracking
//
//  Created by gaoboyuan on 2019/2/2.
//  Copyright © 2019 gaoboyuan. All rights reserved.
//

#include <metal_stdlib>
using namespace metal;

#define MAX_STEP 10
#define MAX_DISTANCE 2.0f
#define EPSILON 1e-6f
#define N 64

vertex
float4 basic_vertex(const device
                    packed_float2 *vertex_array [[ buffer(0) ]],
                    unsigned int vid [[ vertex_id ]]) {
    return float4(vertex_array[vid], 1.0);
}

// 随机数
//
float rand (float2 st) {
    return fract(sin(dot(st.xy,
                         float2(12.9898, 78.233)))*
                 43758.5453123);
}

// 一个圆形光源
float circleSDF(float x, float y, float cx, float cy, float r) {
    float ux = x - cx, uy = y - cy;
    return sqrt(ux * ux + uy * uy) - r;
}

// 函数代表从 o 位置从单位矢量 d 方向接收到的光。
float trace(float2 o, float2 d) {
    float t = 0.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float sd = circleSDF(o.x + d.x * t, o.y + d.y * t, .5f, .5f, 0.1f);
        if (sd < EPSILON)
            return 2.0f;
        t += sd;
    }
    return 0.0f;
}

// 采样(x,y)的颜色
float sample(float2 xy) {
    float sum = 0.0f;
    for (int i = 0; i < N; i++) {
        float a = 6.28 * (i + rand(xy)) / N;
        sum += trace(xy, float2(cos(a), sin(a)));
    }
    return sum / 64.0;
}


fragment
float4 basic_fragment(float2 pointCoord [[point_coord]],
                      float4 position [[position]]) {
    const float W = 360;
    float2 xy = position.xy / W;
    float gray = min(sample(xy), 1.0f);
    return float4(0, gray, 0, 1);
}
