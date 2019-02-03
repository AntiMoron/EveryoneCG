//
//  Shaders.metal
//  RayTracking
//
//  Created by gaoboyuan on 2019/2/2.
//  Copyright © 2019 gaoboyuan. All rights reserved.
//

#include <metal_stdlib>
using namespace metal;

#define MAX_STEP 64
#define MAX_DISTANCE 5.0f
#define EPSILON 1e-6f
#define N 64

// 函数代表从 o 位置从单位矢量 d 方向接收到的光。
// 反射递归次数为3次
#define MAX_DEPTH 3
// Quote:
// 另外，由于我们要向反射方向追踪，如果用原来的相交点，追踪时就为立即遇到 \texttt{r.sd < EPSILON} 而停止，
// 所以我们稍微把相交点往法线方向偏移 \texttt{BIAS} 的距离，只要 \texttt{BIAS} > \texttt{EPSILON} ，
// 就可以避免这个问题。但太大的话也会造成误差
#define BIAS 1e-4f

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
    // 介质折射率
    // 如果光线从外至内，调用 \texttt{refract()} 时，传入 1 / \eta ；从内至外则传入 \eta 。
    float eta;
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

// 抄这个 https://github.com/miloyip/light2d/blob/master/refraction.c
float planeSDF(float2 xy, float2 pxy, float2 normal) {
    return (xy.x - pxy.x) * normal.x + (xy.y - pxy.y) * normal.y;
}

// 场景
// 参数为对xy进行采样
LightSource scene(float2 xy, float rgbRefra) {
//    // 一次画3圆
//    LightSource r1 = { circleSDF(xy, float2(0.4f, 0.5f), 0.01f), 4.0f, 0, 0 };
//    LightSource r2 = { circleSDF(xy, float2(0.6f, 0.5f), 0.01f), 4.0f, 0, 0 };
////    LightSource r3 = { circleSDF(xy, float2(0.7f, 0.5f), 0.10f), 0.0f, .3 };
//    LightSource box = {boxSDF(xy, float2(0.3f,  0.3f), 0, float2(0.1f, 0.1f)), 0, 0.9f, 1.5};
////    LightSource box2 = {boxSDF(xy, float2(0.7f,  0.3f), 0, float2(0.1f, 0.1f)), 0, 0.9f, 1.5};
//    return unionOp(unionOp(r1, r2), box);
//    return unionOp(unionOp(unionOp(r1, r2), box), box2);
//    return unionOp(unionOp(unionOp(unionOp(r1, r2), r3), box), box2);
    LightSource a = { circleSDF(xy, float2(-0.2f, -0.2f), 0.1f), 10.0f, 0.0f, 0.0f };
    LightSource b = {    boxSDF(xy, float2(0.5f, 0.5f), 0.0f, float2(0.3, 0.2f)), 0.0f, 0.9f, 1.5f };
    LightSource c = { circleSDF(xy, float2(0.5f, -0.5f), 0.05f), 20.0f, 0.0f, 0.0f };
    LightSource d = { circleSDF(xy, float2(0.5f, 0.2f), 0.35f), 0.0f, 0.2f, 1.5f };
    LightSource e = { circleSDF(xy, float2(0.5f, 0.8f), 0.35f), 0.0f, 0.2f, 1.5f };
    LightSource f = {    boxSDF(xy, float2(0.5f, 0.5f), 0.0f, float2(0.2, 0.1f)), 0.0f, 0.2f, 1.5f };
    LightSource g = { circleSDF(xy, float2(0.5f, 0.12f), 0.35f), 0.0f, 0.2f, 1.5f };
    LightSource h = { circleSDF(xy, float2(0.5f, 0.87f), 0.35f), 0.0f, 0.2f, 1.5f };
    LightSource i = { circleSDF(xy, float2(0.5f, 0.5f), 0.2f), 0.0f, 0.2f, rgbRefra };
    LightSource j = {  planeSDF(xy, float2(0.5f, 0.5f), float2(0.0f, -1.0f)), 0.0f, 0.2f, rgbRefra };
//     return unionOp(a, b);
    // return unionOp(c, intersectOp(d, e));
    // return unionOp(c, subtractOp(f, unionOp(g, h)));
    return unionOp(c, intersectOp(i, j));
    
}

// 说是计算法线
float2 gradient(float2 xy) {
    return float2((scene(float2(xy.x + EPSILON, xy.y), 0).sourceDistance
                    - scene(float2(xy.x - EPSILON, xy.y), 0).sourceDistance) * (0.5f / EPSILON),
                  (scene(float2(xy.x, xy.y + EPSILON), 0).sourceDistance
                   - scene(float2(xy.x, xy.y - EPSILON), 0).sourceDistance) * (0.5f / EPSILON));
}


float trace0(float2 o, float2 d) {
    float t = 0.0f;
    // 判断是场景内还是外，间eta注释
    float sign = scene(o, 0).sourceDistance > 0.0f ? 1.0f : -1.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy, 0);
        if (sd.sourceDistance * sign < EPSILON) {
            // 反射
            float sum = sd.emissive;
            return sum;
        }
        t += sd.sourceDistance * sign;
    }
    return 0.0f;
}


float trace1(float2 o, float2 d, float rfr) {
    float t = 0.0f;
    // 判断是场景内还是外，间eta注释
    float s = scene(o, rfr).sourceDistance > 0.0f ? 1.0f : -1.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy, rfr);
        sd.sourceDistance *= s;
        if (sd.sourceDistance < EPSILON) {
            // 反射
            float sum = sd.emissive;
            float refl = sd.reflectivity;
            if (sd.reflectivity > 0.0f || sd.eta > 0) {
                float2 normal = gradient(xy);
//                normal *= sign;// 在内的话，要反转法线
                normal = normalize(normal);
                if (sd.eta > 0.0f) {
                    float2 etaRange = refract(d, normal, s < 0.0f ? sd.eta : 1.0f / sd.eta);
                    sum += (1.0f - refl) * trace0(xy - normal * BIAS, etaRange);
                }
                if (refl > 0.0f) {
                    float2 refl2 = reflect(d, normal);
                    sum += refl * trace0(xy + normal * BIAS, refl2);
                }
            }
            return sum;
        }
        t += sd.sourceDistance;
    }
    return 0.0f;
}

float trace2(float2 o, float2 d, float rfr) {
    float t = 0.0f;
    // 判断是场景内还是外，间eta注释
    float s = scene(o, rfr).sourceDistance > 0.0f ? 1.0f : -1.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy, rfr);
        sd.sourceDistance *= s;
        if (sd.sourceDistance < EPSILON) {
            // 反射
            float sum = sd.emissive;
            float refl = sd.reflectivity;
            if (sd.reflectivity > 0.0f || sd.eta > 0) {
                float2 normal = gradient(xy);
                normal *= s;// 在内的话，要反转法线
                normal = normalize(normal);
                if (sd.eta > 0.0f) {
                    float2 etaRange = refract(d, normal, s < 0.0f ? sd.eta : 1.0f / sd.eta);
                    sum += (1.0f - refl) * trace1(xy - normal * BIAS, etaRange, rfr);
                }
                if (refl > 0.0f) {
                    float2 refl2 = reflect(d, normal);
                    sum += refl * trace1(xy + normal * BIAS, refl2, rfr);
                }
            }
            return sum;
        }
        t += sd.sourceDistance;
    }
    return 0.0f;
}

// WTM... shader里不能写递归
float trace(float2 o, float2 d, float rfr) {
    float t = 0.0f;
    // 判断是场景内还是外，间eta注释
    float s = scene(o, rfr).sourceDistance > 0.0f ? 1.0f : -1.0f;
    for (int i = 0; i < MAX_STEP && t < MAX_DISTANCE; i++) {
        float2 xy = d * t + o;
        LightSource sd = scene(xy, rfr);
        sd.sourceDistance *= s;
        if (sd.sourceDistance < EPSILON) {
            // 反射
            float sum = sd.emissive;
            float refl = sd.reflectivity;
            if (sd.reflectivity > 0.0f || sd.eta > 0) {
                float2 normal = gradient(xy);
                normal *= s;// 在内的话，要反转法线
                normal = normalize(normal);
                if (sd.eta > 0.0f) {
                    float2 etaRange = refract(d, normal, s < 0.0f ? sd.eta : 1.0f / sd.eta);
                    sum += (1.0f - refl) * trace2(xy - normal * BIAS, etaRange, rfr);
                }
                if (refl > 0.0f) {
                    float2 refl2 = reflect(d, normal);
                    sum += refl * trace2(xy + normal * BIAS, refl2, rfr);
                }
            }
            return sum;
        }
        t += sd.sourceDistance;
    }
    return 0.0f;
}

// 采样(x,y)的颜色
float sample(float2 xy, float rfr) {
    float sum = 0.0f;
    for (int i = 0; i < N; i++) {
        float a = 6.28 * (i + rand(xy)) / N;
        sum += trace(xy, float2(cos(a), sin(a)), rfr);
    }
    return sum / 64.0;
}


fragment
float4 basic_fragment(float2 pointCoord [[point_coord]],
                      float4 position [[position]]) {
    const float W = 376;
    float2 xy = position.xy / W;
    float r = min(sample(xy, 1.3), 1.0f);
    float g = min(sample(xy, 1.4), 1.0f);
    float b = min(sample(xy, 1.5), 1.0f);
//    return float4(gray, gray, gray, 1);
    return float4(r, g, b, 1);
}
