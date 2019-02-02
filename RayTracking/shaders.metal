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
#define N 32

vertex
float4 basic_vertex(const device
                    packed_float2 *vertex_array [[ buffer(0) ]],
                    unsigned int vid [[ vertex_id ]]) {
    return float4(vertex_array[vid], 1.0);
}

// 随机数
// 从这抄的： https://thebookofshaders.com/10/
float rand (float2 st) {
    return fract(sin(dot(st,
                         float2(12.9898, 78.233)))*
                 43758.5453123);
}

// 定义一个光源
typedef struct LightSource {
    // 光源距离
    float sourceDistance;
    // 光(头)强
    float emissive;
} LightSource;

// 合并两个LightSource
LightSource unionOp(LightSource a, LightSource b) {
    return a.sourceDistance < b.sourceDistance ? a : b;
}

// 一个圆形光源
float circleSDF(float2 xy, float2 center, float radius) {
    float2 u = xy - center;
    return sqrt(u.x * u.x + u.y * u.y) - radius;
}

// 场景
// 参数为对xy进行采样
LightSource scene(float2 xy) {
    // 一次画3圆
    LightSource r1 = { circleSDF(xy, float2(0.3f, 0.3f), 0.10f), 2.0f };
    LightSource r2 = { circleSDF(xy, float2(0.3f, 0.7f), 0.05f), 0.8f };
    LightSource r3 = { circleSDF(xy, float2(0.7f, 0.5f), 0.10f), 0.0f };
    
    return unionOp(unionOp(r1, r2), r3);
}


// 函数代表从 o 位置从单位矢量 d 方向接收到的光。
float trace(float2 o, float2 d) {
    float t = 0.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        LightSource sd = scene(d * t + o);
        if (sd.sourceDistance < EPSILON)
            return sd.emissive;
        t += sd.sourceDistance;
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
    float gray = 1 - min(sample(xy), 1.0f);
    return float4(gray, gray, gray, 1);
}
