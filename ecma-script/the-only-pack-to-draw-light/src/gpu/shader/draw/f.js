/**
 * @author antimoron
 */
export default function (width, height, sceneCode) {
  return `
precision highp float;
// uniform float sdfs[128];
// uniform int iSdfOps[64];
// uniform int iSdfCount; // sdf 数量

const float N = 64.0;
const int MAX_STEP = 10;
const float MAX_DISTANCE = 4.0;
const float EPSILON = 1e-6;
const float BIAS = 1e-4;


// 定义一个光源
struct LightSource {
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
};


// 合并两个LightSource
LightSource unionOp(LightSource a, LightSource b) {
  if(a.sourceDistance < b.sourceDistance) {
    return a;
  }
  return b;
}

LightSource intersectOp(LightSource a, LightSource b) {
    LightSource r = a;
    if(a.sourceDistance > b.sourceDistance) {
      r = b;
    }
    r.sourceDistance = a.sourceDistance > b.sourceDistance ? a.sourceDistance : b.sourceDistance;
    return r;
}

LightSource subtractOp(LightSource a, LightSource b) {
    LightSource r = a;
    r.sourceDistance = (a.sourceDistance > -b.sourceDistance) ? a.sourceDistance : -b.sourceDistance;
    return r;
}


// 一个圆形光源
float circleSDF(vec2 xy, vec2 center, float radius) {
    vec2 u = xy - center;
    return sqrt(u.x * u.x + u.y * u.y) - radius;
}

// 抄这 https://zhuanlan.zhihu.com/p/30816284
float boxSDF(vec2 xy, vec2 center, float theta, vec2 s) {
    float costheta = cos(theta), sintheta = sin(theta);
    float dx = abs((xy.x - center.x) * costheta + (xy.y - center.y) * sintheta) - s.x;
    float dy = abs((xy.y - center.y) * costheta - (xy.x - center.x) * sintheta) - s.y;
    float ax = max(dx, .0), ay = max(dy, .0 );
    return min(max(dx, dy), .0) + sqrt(ax * ax + ay * ay);
}

// 抄这个 https://github.com/miloyip/light2d/blob/master/refraction.c
float planeSDF(vec2 xy, vec2 pxy, vec2 normal) {
    return (xy.x - pxy.x) * normal.x + (xy.y - pxy.y) * normal.y;
}

LightSource createLS(float sd, float emissive, float reflectivity, float eta) {
  LightSource ret;
  ret.sourceDistance = sd;
  ret.emissive = emissive;
  ret.reflectivity = reflectivity;
  ret.eta = eta;
  return ret;
}

// 描述光源
// LightSource createLightSource(vec2 xy, const int index) {
//   int s = index * 16; // 一个SDF描述用16个float
//   float sd = 0.0;
//   if(sdfs[s] == 1.0) {
//     sd = circleSDF(xy, vec2(sdfs[s + 4], sdfs[s + 5]), sdfs[s + 6]);
//   } else if(sdfs[s] == 2.0) {
//     sd = planeSDF(xy, vec2(sdfs[s + 4], sdfs[s + 5]), vec2(sdfs[s + 6], sdfs[s + 7]));
//   } else if(sdfs[s] == 3.0) {
//     sd = boxSDF(xy, vec2(sdfs[s + 4], sdfs[s + 5]), sdfs[s + 8],vec2(sdfs[s + 6], sdfs[s + 7]));
//   }
//   LightSource r;
//   r.sourceDistance = sd;
//   r.emissive = sdfs[s + 1];
//   r.reflectivity = sdfs[s + 2];
//   r.eta = sdfs[s + 3];
//   return r;
// }


LightSource scene(vec2 xy) {
  ${sceneCode};
}


// 说是计算法线
vec2 gradient(vec2 xy) {
  vec2 xy00 = vec2(xy.x + EPSILON, xy.y);
  vec2 xy01 = vec2(xy.x - EPSILON, xy.y);
  vec2 xy10 = vec2(xy.x, xy.y + EPSILON);
  vec2 xy11 = vec2(xy.x, xy.y - EPSILON);
  float hEp = 0.5 / EPSILON;
  return vec2((scene(xy00).sourceDistance - scene(xy01).sourceDistance) * hEp,
              (scene(xy10).sourceDistance - scene(xy11).sourceDistance) * hEp);
}

// /**
// * 折射函数
// * @param {*} ixy
// * @param {*} nxy
// */
// vec2 reflect(vec2 ixy, vec2 nxy) {
//   float idotn2 = (ixy.x * nxy.x + ixy.y * nxy.y) * 2.0;
//   return vec2(ixy.x - idotn2 * nxy.x,
//       ixy.y - idotn2 * nxy.y);
// }

// /**
// * 折射函数
// * @param {*} ixy
// * @param {*} nxy
// * @param {*} eta
// */
// vec2 refract(vec2 ixy, vec2 nxy, float eta) {
//   float idotn = ixy.x * nxy.x + ixy.y * nxy.y;
//   float k = 1.0 - eta * eta * (1.0 - idotn * idotn);
//   float a = eta * idotn + sqrt(k);
//   return vec2(eta * ixy.x - a * nxy.x,
//       eta * ixy.y - a * nxy.y);
// }


/**
* ray tracing
* @param {*} o
* @param {*} d
* @param {*} depth
*/
float trace0(vec2 o, vec2 d) {
  float t = .0;
  // 判断是场景内还是外，间eta注释
  float s = scene(o).sourceDistance > .0 ? 1.0 : -1.0;
  for (int i = 0; i < MAX_STEP; i++) {
    if(t < MAX_DISTANCE) { break; }
    vec2 xy = d * t + o;
    LightSource sd = scene(xy);
    sd.sourceDistance = sd.sourceDistance * s;
    if (sd.sourceDistance < EPSILON) {
        // 反射
        return sd.emissive;
    }
    t += sd.sourceDistance;
  }
  return .0;
}

/**
* ray tracing
* @param {*} o
* @param {*} d
* @param {*} depth
*/
float trace1(vec2 o, vec2 d) {
  float t = .0;
  // 判断是场景内还是外，间eta注释
  float s = scene(o).sourceDistance > .0 ? 1.0 : -1.0;
  for (int i = 0; i < MAX_STEP; i++) {
    if(t < MAX_DISTANCE) { break; }
    vec2 xy = d * t + o;
    LightSource sd = scene(xy);
    sd.sourceDistance = sd.sourceDistance * s;
    if (sd.sourceDistance < EPSILON) {
        // 反射
        float sum = sd.emissive;
        float refl = sd.reflectivity;
        if (sd.reflectivity > .0 || sd.eta > .0) {
            vec2 normal = gradient(xy);
            normal = normal * s;// 在内的话，要反转法线
            // normal = normalize(normal);
            if (sd.eta > .0) {
                vec2 etaRange = refract(d, normal, s < .0 ? sd.eta : 1.0 / sd.eta);
                sum += (1.0 - refl) * trace0(xy - normal * BIAS, etaRange);
            }
            if (refl > .0) {
                vec2 refl2 = reflect(d, normal);
                sum += refl * trace0(xy + normal * BIAS, refl2);
            }
        }
        return sum;
    }
    t += sd.sourceDistance;
  }
  return .0;
}

/**
* ray tracing
* @param {*} o
* @param {*} d
* @param {*} depth
*/
float trace2(vec2 o, vec2 d) {
  float t = .0;
  // 判断是场景内还是外，间eta注释
  float s = scene(o).sourceDistance > .0 ? 1.0 : -1.0;
  for (int i = 0; i < MAX_STEP; i++) {
    if(t < MAX_DISTANCE) { break; }
    vec2 xy = d * t + o;
    LightSource sd = scene(xy);
    sd.sourceDistance = sd.sourceDistance * s;
    if (sd.sourceDistance < EPSILON) {
        // 反射
        float sum = sd.emissive;
        float refl = sd.reflectivity;
        if (sd.reflectivity > .0 || sd.eta > .0) {
            vec2 normal = gradient(xy);
            normal = normal * s;// 在内的话，要反转法线
            // normal = normalize(normal);
            if (sd.eta > .0) {
                vec2 etaRange = refract(d, normal, s < .0 ? sd.eta : 1.0 / sd.eta);
                sum += (1.0 - refl) * trace1(xy - normal * BIAS, etaRange);
            }
            if (refl > .0) {
                vec2 refl2 = reflect(d, normal);
                sum += refl * trace1(xy + normal * BIAS, refl2);
            }
        }
        return sum;
    }
    t += sd.sourceDistance;
  }
  return .0;
}

/**
* ray tracing
* @param {*} o
* @param {*} d
* @param {*} depth
*/
float trace(vec2 o, vec2 d) {
  float t = .0;
  // 判断是场景内还是外，间eta注释
  float s = scene(o).sourceDistance > .0 ? 1.0 : -1.0;
  for (int i = 0; i < MAX_STEP; i++) {
    if(t < MAX_DISTANCE) { break; }
    vec2 xy = d * t + o;
    LightSource sd = scene(xy);
    sd.sourceDistance = sd.sourceDistance * s;
    if (sd.sourceDistance < EPSILON) {
        // 反射
        float sum = sd.emissive;
        float refl = sd.reflectivity;
        if (sd.reflectivity > .0 || sd.eta > .0) {
            vec2 normal = gradient(xy);
            normal = normal * s;// 在内的话，要反转法线
            // normal = normalize(normal);
            if (sd.eta > .0) {
                vec2 etaRange = refract(d, normal, s < .0 ? sd.eta : 1.0 / sd.eta);
                sum += (1.0 - refl) * trace2(xy - normal * BIAS, etaRange);
            }
            if (refl > .0) {
                vec2 refl2 = reflect(d, normal);
                sum += refl * trace2(xy + normal * BIAS, refl2);
            }
        }
        return sum;
    }
    t += sd.sourceDistance;
  }
  return .0;
}

// 随机数
// 从这抄的： https://thebookofshaders.com/10/
float rand (vec2 st) {
    return fract(sin(dot(st,
                         vec2(12.9898, 78.233)))*
                 43758.5453123);
}


/**
* 采样(x,y)的颜色
* jitter sampling.
* @param {*} xy x,y像素点
*/
float sample(vec2 xy) {
  float sum = .0;
  for (float i = .0; i < N; i += 1.0) {
      float a = 6.2831852 * (i + rand(xy)) / N;
      sum += trace(xy, vec2(cos(a), sin(a)));
  }
  return sum / N;
}

void main(void) {
  float width = ${parseInt(width, 10)}.0;
  float height = ${parseInt(height, 10)}.0;
  vec2 xy = vec2(gl_FragCoord.x / width, gl_FragCoord.y / height);
  float gray = sample(xy);
  gl_FragColor = vec4(gray, gray, gray, 1);
}
`;
};