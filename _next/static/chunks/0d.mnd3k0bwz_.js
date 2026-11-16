(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,87899,e=>{"use strict";var t=e.i(95911),r=e.i(51500);let i=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vUv = corners[gl_VertexID] * 0.5 + 0.5;
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,a=`#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uTexel;
`,o=`${a}
uniform sampler2D uVelocity;
uniform vec2 uSize;
uniform vec4 uSegment;
uniform vec2 uForce;
uniform float uRadius;

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return length(p - a - ab * t);
}

void main() {
  float d = segment(vUv * uSize, uSegment.xy, uSegment.zw) / uRadius;
  vec2 velocity = texture(uVelocity, vUv).xy + uForce * exp(-d * d * 6.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}`,u=`${a}
uniform sampler2D uVelocity;
uniform float uAmount;

void main() {
  vec2 center = texture(uVelocity, vUv).xy;
  vec2 around =
    texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy +
    texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy +
    texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy +
    texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;
  fragColor = vec4(mix(center, around * 0.25, uAmount), 0.0, 1.0);
}`,l=`${a}
uniform sampler2D uVelocity;
uniform float uWalls;

void main() {
  vec2 center = texture(uVelocity, vUv).xy;
  float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float down = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float up = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  float edge = uWalls > 0.5 ? -1.0 : 0.0;
  if (vUv.x - uTexel.x < 0.0) left = edge * center.x;
  if (vUv.x + uTexel.x > 1.0) right = edge * center.x;
  if (vUv.y - uTexel.y < 0.0) down = edge * center.y;
  if (vUv.y + uTexel.y > 1.0) up = edge * center.y;
  fragColor = vec4(0.5 * (right - left + up - down), 0.0, 0.0, 1.0);
}`,n=`
uniform float uWalls;

float pressureAt(sampler2D field, vec2 uv) {
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);
}
`,c=`${a}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
${n}
void main() {
  vec2 reach = uTexel * 2.0;
  float sum =
    pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +
    pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +
    pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +
    pressureAt(uPressure, vUv + vec2(0.0, reach.y));
  fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);
}`,v=`${a}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
${n}
void main() {
  float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));
  float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));
  float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));
  float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));
  vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);
  fragColor = vec4(velocity, 0.0, 1.0);
}`,s=`${a}
uniform sampler2D uVelocity;
uniform vec2 uStep;
uniform float uKeep;
uniform float uWalls;

vec2 at(vec2 uv) {
  vec2 outside = max(-uv, uv - 1.0) / uTexel;
  float open = clamp(1.0 - max(outside.x, outside.y) / 1.5, 0.0, 1.0);
  return texture(uVelocity, uv).xy * mix(open, 1.0, uWalls);
}

void main() {
  vec2 start = vUv - at(vUv) * uStep;
  vec2 back = start + at(start) * uStep;
  vec2 corrected = vUv - (back - vUv) * 0.5;
  vec2 origin = corrected - at(corrected) * uStep;
  vec2 a = at(origin + vec2(-0.5, -0.5) * uTexel);
  vec2 b = at(origin + vec2(0.5, -0.5) * uTexel);
  vec2 c = at(origin + vec2(-0.5, 0.5) * uTexel);
  vec2 d = at(origin + vec2(0.5, 0.5) * uTexel);
  vec2 velocity = clamp(at(origin), min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));
  fragColor = vec4(velocity * uKeep, 0.0, 1.0);
}`,m=`${a}
uniform sampler2D uVelocity;
uniform sampler2D uPalette;
uniform vec2 uSimSize;
uniform float uSpeedScale;
uniform float uLight;
uniform vec4 uBackground;

vec2 velocityAt(vec2 uv) {
  vec2 st = uv * uSimSize - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / uSimSize;
  vec2 h1 = (i + 1.5 + w3 / g1) / uSimSize;
  vec2 a = texture(uVelocity, vec2(h0.x, h0.y)).xy;
  vec2 b = texture(uVelocity, vec2(h1.x, h0.y)).xy;
  vec2 c = texture(uVelocity, vec2(h0.x, h1.y)).xy;
  vec2 d = texture(uVelocity, vec2(h1.x, h1.y)).xy;
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);
}

void main() {
  float speed = length(velocityAt(vUv)) * uSpeedScale;
  float level = speed < 0.75 ? speed : 0.75 + 0.25 * tanh((speed - 0.75) * 4.0);
  vec3 ink = texture(uPalette, vec2(level, 0.5)).rgb;
  float alpha = level;
  if (uLight > 0.5) {
    float hollow = smoothstep(0.7, 1.6, speed);
    alpha = smoothstep(0.08, 0.5, level) * mix(0.85, 0.1, hollow);
  } else {
    float hot = 1.0 - exp(-max(speed - 0.75, 0.0) * 1.2);
    ink = mix(ink, min(ink * 1.8 + 0.06, vec3(1.0)), hot);
  }
  vec3 color = ink * alpha + uBackground.rgb * uBackground.a * (1.0 - alpha);
  float coverage = alpha + uBackground.a * (1.0 - alpha);
  float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  color += (grain - 0.5) / 255.0 * step(0.002, coverage);
  fragColor = vec4(clamp(color, vec3(0.0), vec3(coverage)), coverage);
}`,d=(e,t,r)=>Math.min(r,Math.max(t,e)),f=(e,t)=>Math.pow(.5,t/(.35+e*e*12)),h=e=>{let t=String(e||"").trim(),r=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(t);if(r){let e=3===r[1].length?r[1].replace(/./g,e=>e+e):r[1];return[0,2,4].map(t=>parseInt(e.slice(t,t+2),16)/255)}let i=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(t);return i?[i[1],i[2],i[3]].map(e=>d(parseFloat(e)/255,0,1)):null},x=e=>e<=.04045?e/12.92:Math.pow((e+.055)/1.055,2.4),y=(e,t,r)=>{let i=e.createShader(t);return i?(e.shaderSource(i,r),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS))?i:(console.error(e.getShaderInfoLog(i)),e.deleteShader(i),null):null},p=(e,t)=>{let r=y(e,e.VERTEX_SHADER,i),a=y(e,e.FRAGMENT_SHADER,t),o=r&&a?e.createProgram():null;if(!r||!a||!o)return r&&e.deleteShader(r),a&&e.deleteShader(a),null;if(e.attachShader(o,r),e.attachShader(o,a),e.linkProgram(o),e.deleteShader(r),e.deleteShader(a),!e.getProgramParameter(o,e.LINK_STATUS))return console.error(e.getProgramInfoLog(o)),e.deleteProgram(o),null;let u={},l=e.getProgramParameter(o,e.ACTIVE_UNIFORMS);for(let t=0;t<l;t++){let r=e.getActiveUniform(o,t);r&&(u[r.name]=e.getUniformLocation(o,r.name))}return{program:o,uniforms:u}};e.s(["default",0,({colors:e=["#5227FF","#FF9FFC","#B497CF"],intensity:i=1,mouseForce:a=20,cursorSize:n=100,persistence:y=.75,viscosity:g=0,resolution:E=.5,bounceEdges:T=!1,clickBurst:w=!0,autoDemo:R=!0,autoSpeed:U=.5,autoIntensity:M=2.2,autoResumeDelay:b=1e3,intro:_=!0,lightMode:A=!1,backgroundColor:S="transparent",maxDevicePixelRatio:P=2,className:D="",style:F})=>{let L=(0,r.useRef)(null),V=(0,r.useRef)(null),X=(0,r.useRef)(null),[I,N]=(0,r.useState)(0),C=Array.isArray(e)?e:[e],B="transparent"===S?null:h(S),k={colors:C,paletteKey:C.join(","),intensity:Math.max(0,i),force:Math.max(0,a),radius:d(n,4,600),persistence:d(y,0,1),viscosity:d(g,0,1),resolution:d(E,.05,1),walls:T,clickBurst:w,autoDemo:R,autoSpeed:Math.max(0,U),autoIntensity:Math.max(0,M),autoResumeDelay:Math.max(0,b),intro:_,light:A,background:B?[...B,1]:[0,0,0,0],maxRatio:d(P,.5,3)},O=(0,r.useRef)(k);return O.current=k,(0,r.useEffect)(()=>{X.current?.()}),(0,r.useEffect)(()=>{let e=L.current,t=V.current;if(!e||!t)return;let r=t.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!r||!r.getExtension("EXT_color_buffer_float")&&!r.getExtension("EXT_color_buffer_half_float"))return;let i={splat:p(r,o),smooth:p(r,u),divergence:p(r,l),pressure:p(r,c),project:p(r,v),advect:p(r,s),display:p(r,m)};if(Object.values(i).some(e=>!e))return;let a=window.matchMedia("(prefers-reduced-motion: reduce)").matches,n=r.createVertexArray(),y={width:1,height:1},g={width:0,height:0},E={},T={x:0,y:0,fromX:0,fromY:0,dx:0,dy:0,inside:!1,ready:!1,moved:!1,last:0},w={phase:100*Math.random(),x:0,y:0,ready:!1,ramp:0},R={active:O.current.intro&&!a&&0===I,time:0},U=[],M=[],b=1,_=-1/0,A=0,S=0,P=!0,D="hidden"!==document.visibilityState,F=!1,C="",B=r.createTexture();r.bindTexture(r.TEXTURE_2D,B),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE);let k=(e,t,i)=>{let a=r.createTexture();r.bindTexture(r.TEXTURE_2D,a),r.texImage2D(r.TEXTURE_2D,0,2===i?r.RG16F:r.R16F,e,t,0,2===i?r.RG:r.RED,r.HALF_FLOAT,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE);let o=r.createFramebuffer();return r.bindFramebuffer(r.FRAMEBUFFER,o),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,a,0),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT),{texture:a,framebuffer:o}},W=()=>{Object.keys(E).forEach(e=>{r.deleteTexture(E[e].texture),r.deleteFramebuffer(E[e].framebuffer),delete E[e]})},G=()=>{let i=O.current,a=e.getBoundingClientRect(),o=Math.max(1,a.width),u=Math.max(1,a.height),l=Math.min(window.devicePixelRatio||1,i.maxRatio,Math.sqrt(24e5/(o*u))),n=Math.max(1,Math.round(o*l)),c=Math.max(1,Math.round(u*l));(t.width!==n||t.height!==c)&&(t.width=n,t.height=c),y.width=o,y.height=u;let v=.5*i.resolution,s=v*Math.min(1,Math.sqrt(14e4/(o*u*v*v))),m=d(Math.round(o*s),16,1024),f=d(Math.round(u*s),16,1024);(m!==g.width||f!==g.height)&&(W(),g.width=m,g.height=f,E.velocity=k(m,f,2),E.velocityNext=k(m,f,2),E.divergence=k(m,f,1),E.pressure=k(m,f,1),E.pressureNext=k(m,f,1),r.bindFramebuffer(r.FRAMEBUFFER,null))},$=(e,t)=>{let r=E[e];E[e]=E[t],E[t]=r},z=(e,t,i)=>{r.activeTexture(r.TEXTURE0+e),r.bindTexture(r.TEXTURE_2D,t),r.uniform1i(i,e)},j=(e,t,i)=>{r.useProgram(e.program),r.uniform2f(e.uniforms.uTexel,1/g.width,1/g.height),i(e.uniforms),r.bindFramebuffer(r.FRAMEBUFFER,t?t.framebuffer:null),r.drawArrays(r.TRIANGLES,0,3)},K=e=>{r.viewport(0,0,t.width,t.height),j(i.display,null,t=>{z(0,E.velocity.texture,t.uVelocity),z(1,B,t.uPalette),r.uniform2f(t.uSimSize,g.width,g.height),r.uniform1f(t.uSpeedScale,1.25*e.intensity/(.84*Math.max(y.width,y.height))),r.uniform1f(t.uLight,+!!e.light),r.uniform4f(t.uBackground,e.background[0],e.background[1],e.background[2],e.background[3])})},Y=e=>{let t=1-Math.pow(1-d(e/1.4,0,1),3),r=-.6+3.6*t,i=.08+.3*t;return[(.5+Math.cos(r)*i*1.1)*y.width,(.5+Math.sin(r)*i*(y.width/y.height)*.75)*y.height]},q=(e,t,r,i,a)=>{U.push({ax:e[0],ay:e[1],bx:t[0],by:t[1],vx:d((t[0]-e[0])/r*i,-6e3,6e3),vy:d((t[1]-e[1])/r*i,-6e3,6e3),radius:a})},H=e=>{var t;if(A=0,F)return;let o=O.current;o.paletteKey!==C&&(C=o.paletteKey,r.bindTexture(r.TEXTURE_2D,B),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,256,1,0,r.RGBA,r.UNSIGNED_BYTE,(e=>{let t=[];e.forEach(e=>{let r=h(e);r&&t.push(r)}),t.length||t.push([1,1,1]);let r=t.map(e=>e.map(x)),i=new Uint8Array(1024);for(let e=0;e<256;e++){let t=d(e/255*r.length-.5,0,r.length-1),a=Math.min(Math.floor(t),Math.max(r.length-2,0)),o=Math.min(a+1,r.length-1),u=t-a,l=u*u*(3-2*u);for(let t=0;t<3;t++){let u=r[a][t]+(r[o][t]-r[a][t])*l;i[4*e+t]=Math.round(255*d(u,0,1))}i[4*e+3]=255}return i})(o.colors)));let u=d((e-S)/1e3||0,0,1/30);S=Math.max(S,e);let l=Math.min(1,60*u),c=e-_>o.autoResumeDelay;if(R.active&&u>0){let e=Y(R.time);R.time+=u;let t=Math.sin(Math.min(1,R.time/1.4)*Math.PI);q(e,Y(R.time),u,.2*t,o.radius),b=1,R.time>1.4&&(R.active=!1)}else if(o.autoDemo&&!a&&c&&u>0){let e,r;w.ramp=Math.min(1,w.ramp+u/.8),w.phase+=u*o.autoSpeed*1.6;let i=(e=.62*Math.sin(.83*(t=w.phase)+1.3)+.38*Math.sin(1.71*t+.4),r=.6*Math.sin(1.07*t+2.1)+.4*Math.cos(.61*t+.7),[(.5+.41*e)*y.width,(.5+.41*r)*y.height]);if(w.ready){let e=.3+.7*Math.pow(.5+.5*Math.sin(2.6*w.phase),2),t=o.force/20*.45*o.autoIntensity*w.ramp*w.ramp*e*l;q([w.x,w.y],i,u,t,o.radius)}w.x=i[0],w.y=i[1],w.ready=!0,b=1}else w.ramp=0;if(T.moved&&u>0){T.moved=!1;let t=Math.max(e-T.last,8)/1e3;q([T.fromX,T.fromY],[T.x,T.y],t,o.force/20*.15*l,o.radius),T.fromX=T.x,T.fromY=T.y,T.last=e,b=1}let v=M.shift();v&&U.push(v),r.bindVertexArray(n),r.disable(r.BLEND),u>0&&((e,t)=>{r.viewport(0,0,g.width,g.height);let a=+!!e.walls;U.forEach(e=>{j(i.splat,E.velocityNext,t=>{z(0,E.velocity.texture,t.uVelocity),r.uniform2f(t.uSize,y.width,y.height),r.uniform4f(t.uSegment,e.ax,e.ay,e.bx,e.by),r.uniform2f(t.uForce,e.vx,e.vy),r.uniform1f(t.uRadius,e.radius)}),$("velocity","velocityNext")}),U.length=0;let o=Math.ceil(4*e.viscosity);for(let t=0;t<o;t++)j(i.smooth,E.velocityNext,i=>{z(0,E.velocity.texture,i.uVelocity),r.uniform1f(i.uAmount,.9*Math.min(1,4*e.viscosity-t))}),$("velocity","velocityNext");j(i.divergence,E.divergence,e=>{z(0,E.velocity.texture,e.uVelocity),r.uniform1f(e.uWalls,a)});for(let e=0;e<32;e++)j(i.pressure,E.pressureNext,e=>{z(0,E.pressure.texture,e.uPressure),z(1,E.divergence.texture,e.uDivergence),r.uniform1f(e.uWalls,a)}),$("pressure","pressureNext");j(i.project,E.velocityNext,e=>{z(0,E.pressure.texture,e.uPressure),z(1,E.velocity.texture,e.uVelocity),r.uniform1f(e.uWalls,a)}),$("velocity","velocityNext"),j(i.advect,E.velocityNext,i=>{z(0,E.velocity.texture,i.uVelocity),r.uniform2f(i.uStep,t/y.width,t/y.height),r.uniform1f(i.uKeep,f(e.persistence,t)),r.uniform1f(i.uWalls,a)}),$("velocity","velocityNext")})(o,u),K(o),b*=f(o.persistence,u),(R.active||o.autoDemo&&!a||b>.002||M.length>0||T.moved)&&P&&D&&(A=requestAnimationFrame(H))},J=()=>{!A&&!F&&P&&D&&(S=performance.now(),A=requestAnimationFrame(H))};X.current=()=>{G(),K(O.current),J()};let Q=t=>{let r=e.getBoundingClientRect();return{x:t.clientX-r.left,y:r.bottom-t.clientY,inside:t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom}},Z=e=>{let t=Q(e);if(T.inside=t.inside,!t.inside){T.ready=!1;return}_=performance.now(),R.active=!1,T.ready||(T.fromX=t.x,T.fromY=t.y,T.x=t.x,T.y=t.y,T.last=_,T.ready=!0);let r=t.x-T.x,i=t.y-T.y;Math.hypot(r,i)>.5&&(T.dx=.7*T.dx+.3*r,T.dy=.7*T.dy+.3*i),T.x=t.x,T.y=t.y,T.moved=!0,J()},ee=e=>{let t=O.current,r=Q(e);if(!r.inside||(_=performance.now(),!t.clickBurst||a))return;let i=Math.hypot(T.dx,T.dy)>1?Math.atan2(T.dy,T.dx):Math.random()*Math.PI*2,o=Math.cos(i),u=Math.sin(i),l=.5*t.radius,n=1400*(t.force/20);M.push({ax:r.x-o*l,ay:r.y-u*l,bx:r.x+o*l,by:r.y+u*l,vx:o*n,vy:u*n,radius:.9*t.radius}),M.length>4&&M.shift(),b=1,J()},et=()=>{T.inside=!1,T.ready=!1},er=e=>{"mouse"!==e.pointerType&&et()};window.addEventListener("pointermove",Z,{passive:!0}),window.addEventListener("pointerdown",ee,{passive:!0}),window.addEventListener("pointerup",er,{passive:!0}),window.addEventListener("pointercancel",er,{passive:!0}),document.documentElement.addEventListener("pointerleave",et);let ei=e=>{e.preventDefault(),F=!0,cancelAnimationFrame(A),A=0},ea=()=>N(e=>e+1);t.addEventListener("webglcontextlost",ei),t.addEventListener("webglcontextrestored",ea);let eo=new ResizeObserver(()=>{G(),K(O.current),J()});eo.observe(e);let eu=new IntersectionObserver(e=>{P=e.some(e=>e.isIntersecting),J()});eu.observe(e);let el=()=>{D="hidden"!==document.visibilityState,J()};return document.addEventListener("visibilitychange",el),G(),J(),()=>{cancelAnimationFrame(A),X.current=null,eo.disconnect(),eu.disconnect(),window.removeEventListener("pointermove",Z),window.removeEventListener("pointerdown",ee),window.removeEventListener("pointerup",er),window.removeEventListener("pointercancel",er),document.documentElement.removeEventListener("pointerleave",et),document.removeEventListener("visibilitychange",el),t.removeEventListener("webglcontextlost",ei),t.removeEventListener("webglcontextrestored",ea),r.isContextLost()||(W(),r.deleteTexture(B),r.deleteVertexArray(n),Object.values(i).forEach(e=>r.deleteProgram(e.program)))}},[I]),(0,t.jsx)("div",{ref:L,className:`liquid-ether${D?` ${D}`:""}`,style:F,children:(0,t.jsx)("canvas",{ref:V,className:"liquid-ether__canvas","aria-hidden":"true"})})}])},34147,e=>{e.n(e.i(87899))}]);