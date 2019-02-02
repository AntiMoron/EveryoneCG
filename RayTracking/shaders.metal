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
    // 反射率
    // 如果反射率超过 1，总能量就变多，不符合能量守恒。少于 1 代表形状吸收了能量。
    float reflectivity;
} LightSource;

// 合并两个LightSource
LightSource unionOp(LightSource a, LightSource b) {
    return a.sourceDistance < b.sourceDistance ? a : b;
}


LightSource intersectOp(LightSource a, LightSource b) {
    LightSource r = a.sourceDistance > b.sourceDistance ? b : a;
    r.sourceDistance = a.sourceDistance > b.sourceDistance ? a.sourceDistance : b.sourceDistance;
    return r;
}

LightSource subtractOp(LightSource a, LightSource b) {
    LightSource r = a;
    r.sourceDistance = (a.sourceDistance > -b.sourceDistance) ? a.sourceDistance : -b.sourceDistance;
    return r;
}


// 一个圆形光源
float circleSDF(float2 xy, float2 center, float radius) {
    float2 u = xy - center;
    return sqrt(u.x * u.x + u.y * u.y) - radius;
}

// 抄这 https://zhuanlan.zhihu.com/p/30816284
float boxSDF(float2 xy, float2 center, float theta, float2 s) {
    float costheta = cos(theta), sintheta = sin(theta);
    float dx = abs((xy.x - center.x) * costheta + (xy.y - center.y) * sintheta) - s.x;
    float dy = abs((xy.y - center.y) * costheta - (xy.x - center.x) * sintheta) - s.y;
    float ax = max(dx, 0.0f), ay = max(dy, 0.0f);
    return min(max(dx, dy), 0.0f) + sqrt(ax * ax + ay * ay);
}

// 场景
// 参数为对xy进行采样
LightSource scene(float2 xy) {
    // 一次画3圆
    LightSource r1 = { circleSDF(xy, float2(0.4f, 0.5f), 0.01f), 4.0f, 0 };
    LightSource r2 = { circleSDF(xy, float2(0.6f, 0.5f), 0.01f), 4.0f, 0 };
//    LightSource r3 = { circleSDF(xy, float2(0.7f, 0.5f), 0.10f), 0.0f, .3 };
    LightSource box = {boxSDF(xy, float2(0.3f,  0.3f), 0, float2(0.1f, 0.1f)), 0.3f, 0.9f};
    LightSource box2 = {boxSDF(xy, float2(0.7f,  0.3f), 0, float2(0.1f, 0.1f)), 0.3f, 0.9f};
    return unionOp(unionOp(unionOp(r1, r2), box), box2);
//    return unionOp(unionOp(unionOp(unionOp(r1, r2), r3), box), box2);
}

// 说是计算法线
float2 gradient(float2 xy) {
    return float2((scene(float2(xy.x + EPSILON, xy.y)).sourceDistance
                    - scene(float2(xy.x - EPSILON, xy.y)).sourceDistance) * (0.5f / EPSILON),
                  (scene(float2(xy.x, xy.y + EPSILON)).sourceDistance
                   - scene(float2(xy.x, xy.y - EPSILON)).sourceDistance) * (0.5f / EPSILON));
}

// reflect 是个函数
float2 reflection(float2 xy, float2 normal) {
    return reflect(xy, normalize(normal));
}


// 函数代表从 o 位置从单位矢量 d 方向接收到的光。
// 反射递归次数为3次
#define MAX_DEPTH 3
// Quote:
// 另外，由于我们要向反射方向追踪，如果用原来的相交点，追踪时就为立即遇到 \texttt{r.sd < EPSILON} 而停止，
// 所以我们稍微把相交点往法线方向偏移 \texttt{BIAS} 的距离，只要 \texttt{BIAS} > \texttt{EPSILON} ，
// 就可以避免这个问题。但太大的话也会造成误差
#define BIAS 1e-7

float trace0(float2 o, float2 d) {
    float t = 0.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy);
        if (sd.sourceDistance < EPSILON) {
            return sd.emissive;
        }
        t += sd.sourceDistance;
    }
    return 0.0f;
}


float trace1(float2 o, float2 d) {
    float t = 0.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy);
        if (sd.sourceDistance < EPSILON) {
            // 反射
            float sum = sd.emissive;
            if (sd.reflectivity > 0.0f) {
                float2 normal = gradient(xy);
                float2 refl = reflection(d, normal);
                sum += sd.reflectivity * trace0(xy + normal * BIAS, refl);
            }
            return sum;
        }
        t += sd.sourceDistance;
    }
    return 0.0f;
}


float trace2(float2 o, float2 d) {
    float t = 0.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy);
        if (sd.sourceDistance < EPSILON) {
            // 反射
            float sum = sd.emissive;
            if (sd.reflectivity > 0.0f) {
                float2 normal = gradient(xy);
                float2 refl = reflection(d, normal);
                sum += sd.reflectivity * trace1(xy + normal * BIAS, refl);
            }
            return sum;
        }
        t += sd.sourceDistance;
    }
    return 0.0f;
}

// WTM... shader里不能写递归
float trace(float2 o, float2 d) {
    float t = 0.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy);
        if (sd.sourceDistance < EPSILON) {
            // 反射
            float sum = sd.emissive;
            if (sd.reflectivity > 0.0f) {
                float2 normal = gradient(xy);
                float2 refl = reflection(d, normal);
                sum += sd.reflectivity * trace2(xy + normal * BIAS, refl);
            }
            return sum;
        }
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
    const float W = 376;
    float2 xy = position.xy / W;
    float gray = min(sample(xy), 1.0f);
    return float4(gray, gray, gray, 1);
}
