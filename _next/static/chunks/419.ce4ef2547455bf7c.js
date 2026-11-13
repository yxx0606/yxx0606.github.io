(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[419],{61:()=>{},8419:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>T});var i=r(3489),a=r(5301);r(61);let o=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vUv = corners[gl_VertexID] * 0.5 + 0.5;
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,u=`#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uTexel;
`,l=`${u}
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
}`,n=`${u}
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
}`,c=`${u}
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
}`,v=`
uniform float uWalls;

float pressureAt(sampler2D field, vec2 uv) {
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);
}
`,s=`${u}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
${v}
void main() {
  vec2 reach = uTexel * 2.0;
  float sum =
    pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +
    pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +
    pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +
    pressureAt(uPressure, vUv + vec2(0.0, reach.y));
  fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);
}`,m=`${u}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
${v}
void main() {
  float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));
  float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));
  float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));
  float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));
  vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);
  fragColor = vec4(velocity, 0.0, 1.0);
}`,d=`${u}
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
}`,f=`${u}
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
}`,h=(e,t,r)=>Math.min(r,Math.max(t,e)),x=(e,t)=>Math.pow(.5,t/(.35+e*e*12)),y=e=>{let t=String(e||"").trim(),r=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(t);if(r){let e=3===r[1].length?r[1].replace(/./g,e=>e+e):r[1];return[0,2,4].map(t=>parseInt(e.slice(t,t+2),16)/255)}let i=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(t);return i?[i[1],i[2],i[3]].map(e=>h(parseFloat(e)/255,0,1)):null},p=e=>e<=.04045?e/12.92:Math.pow((e+.055)/1.055,2.4),g=(e,t,r)=>{let i=e.createShader(t);return i?(e.shaderSource(i,r),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS))?i:(console.error(e.getShaderInfoLog(i)),e.deleteShader(i),null):null},E=(e,t)=>{let r=g(e,e.VERTEX_SHADER,o),i=g(e,e.FRAGMENT_SHADER,t),a=r&&i?e.createProgram():null;if(!r||!i||!a)return r&&e.deleteShader(r),i&&e.deleteShader(i),null;if(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),!e.getProgramParameter(a,e.LINK_STATUS))return console.error(e.getProgramInfoLog(a)),e.deleteProgram(a),null;let u={},l=e.getProgramParameter(a,e.ACTIVE_UNIFORMS);for(let t=0;t<l;t++){let r=e.getActiveUniform(a,t);r&&(u[r.name]=e.getUniformLocation(a,r.name))}return{program:a,uniforms:u}},T=({colors:e=["#5227FF","#FF9FFC","#B497CF"],intensity:t=1,mouseForce:r=20,cursorSize:o=100,persistence:u=.75,viscosity:v=0,resolution:g=.5,bounceEdges:T=!1,clickBurst:w=!0,autoDemo:R=!0,autoSpeed:M=.5,autoIntensity:U=2.2,autoResumeDelay:b=1e3,intro:_=!0,lightMode:A=!1,backgroundColor:S="transparent",maxDevicePixelRatio:D=2,className:P="",style:F})=>{let L=(0,a.useRef)(null),V=(0,a.useRef)(null),X=(0,a.useRef)(null),[I,N]=(0,a.useState)(0),C=Array.isArray(e)?e:[e],k="transparent"===S?null:y(S),B={colors:C,paletteKey:C.join(","),intensity:Math.max(0,t),force:Math.max(0,r),radius:h(o,4,600),persistence:h(u,0,1),viscosity:h(v,0,1),resolution:h(g,.05,1),walls:T,clickBurst:w,autoDemo:R,autoSpeed:Math.max(0,M),autoIntensity:Math.max(0,U),autoResumeDelay:Math.max(0,b),intro:_,light:A,background:k?[...k,1]:[0,0,0,0],maxRatio:h(D,.5,3)},O=(0,a.useRef)(B);return O.current=B,(0,a.useEffect)(()=>{X.current?.()}),(0,a.useEffect)(()=>{let e=L.current,t=V.current;if(!e||!t)return;let r=t.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!r||!r.getExtension("EXT_color_buffer_float")&&!r.getExtension("EXT_color_buffer_half_float"))return;let i={splat:E(r,l),smooth:E(r,n),divergence:E(r,c),pressure:E(r,s),project:E(r,m),advect:E(r,d),display:E(r,f)};if(Object.values(i).some(e=>!e))return;let a=window.matchMedia("(prefers-reduced-motion: reduce)").matches,o=r.createVertexArray(),u={width:1,height:1},v={width:0,height:0},g={},T={x:0,y:0,fromX:0,fromY:0,dx:0,dy:0,inside:!1,ready:!1,moved:!1,last:0},w={phase:100*Math.random(),x:0,y:0,ready:!1,ramp:0},R={active:O.current.intro&&!a&&0===I,time:0},M=[],U=[],b=1,_=-1/0,A=0,S=0,D=!0,P="hidden"!==document.visibilityState,F=!1,C="",k=r.createTexture();r.bindTexture(r.TEXTURE_2D,k),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE);let B=(e,t,i)=>{let a=r.createTexture();r.bindTexture(r.TEXTURE_2D,a),r.texImage2D(r.TEXTURE_2D,0,2===i?r.RG16F:r.R16F,e,t,0,2===i?r.RG:r.RED,r.HALF_FLOAT,null),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE);let o=r.createFramebuffer();return r.bindFramebuffer(r.FRAMEBUFFER,o),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,a,0),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT),{texture:a,framebuffer:o}},W=()=>{Object.keys(g).forEach(e=>{r.deleteTexture(g[e].texture),r.deleteFramebuffer(g[e].framebuffer),delete g[e]})},G=()=>{let i=O.current,a=e.getBoundingClientRect(),o=Math.max(1,a.width),l=Math.max(1,a.height),n=Math.min(window.devicePixelRatio||1,i.maxRatio,Math.sqrt(24e5/(o*l))),c=Math.max(1,Math.round(o*n)),s=Math.max(1,Math.round(l*n));(t.width!==c||t.height!==s)&&(t.width=c,t.height=s),u.width=o,u.height=l;let m=.5*i.resolution,d=m*Math.min(1,Math.sqrt(14e4/(o*l*m*m))),f=h(Math.round(o*d),16,1024),x=h(Math.round(l*d),16,1024);(f!==v.width||x!==v.height)&&(W(),v.width=f,v.height=x,g.velocity=B(f,x,2),g.velocityNext=B(f,x,2),g.divergence=B(f,x,1),g.pressure=B(f,x,1),g.pressureNext=B(f,x,1),r.bindFramebuffer(r.FRAMEBUFFER,null))},$=(e,t)=>{let r=g[e];g[e]=g[t],g[t]=r},z=(e,t,i)=>{r.activeTexture(r.TEXTURE0+e),r.bindTexture(r.TEXTURE_2D,t),r.uniform1i(i,e)},j=(e,t,i)=>{r.useProgram(e.program),r.uniform2f(e.uniforms.uTexel,1/v.width,1/v.height),i(e.uniforms),r.bindFramebuffer(r.FRAMEBUFFER,t?t.framebuffer:null),r.drawArrays(r.TRIANGLES,0,3)},Y=e=>{r.viewport(0,0,t.width,t.height),j(i.display,null,t=>{z(0,g.velocity.texture,t.uVelocity),z(1,k,t.uPalette),r.uniform2f(t.uSimSize,v.width,v.height),r.uniform1f(t.uSpeedScale,1.25*e.intensity/(.84*Math.max(u.width,u.height))),r.uniform1f(t.uLight,+!!e.light),r.uniform4f(t.uBackground,e.background[0],e.background[1],e.background[2],e.background[3])})},K=e=>{let t=1-Math.pow(1-h(e/1.4,0,1),3),r=-.6+3.6*t,i=.08+.3*t;return[(.5+Math.cos(r)*i*1.1)*u.width,(.5+Math.sin(r)*i*(u.width/u.height)*.75)*u.height]},q=(e,t,r,i,a)=>{M.push({ax:e[0],ay:e[1],bx:t[0],by:t[1],vx:h((t[0]-e[0])/r*i,-6e3,6e3),vy:h((t[1]-e[1])/r*i,-6e3,6e3),radius:a})},H=e=>{var t;if(A=0,F)return;let l=O.current;l.paletteKey!==C&&(C=l.paletteKey,r.bindTexture(r.TEXTURE_2D,k),r.texImage2D(r.TEXTURE_2D,0,r.RGBA8,256,1,0,r.RGBA,r.UNSIGNED_BYTE,(e=>{let t=[];e.forEach(e=>{let r=y(e);r&&t.push(r)}),t.length||t.push([1,1,1]);let r=t.map(e=>e.map(p)),i=new Uint8Array(1024);for(let e=0;e<256;e++){let t=h(e/255*r.length-.5,0,r.length-1),a=Math.min(Math.floor(t),Math.max(r.length-2,0)),o=Math.min(a+1,r.length-1),u=t-a,l=u*u*(3-2*u);for(let t=0;t<3;t++){let u=r[a][t]+(r[o][t]-r[a][t])*l;i[4*e+t]=Math.round(255*h(u,0,1))}i[4*e+3]=255}return i})(l.colors)));let n=h((e-S)/1e3||0,0,1/30);S=Math.max(S,e);let c=Math.min(1,60*n),s=e-_>l.autoResumeDelay;if(R.active&&n>0){let e=K(R.time);R.time+=n;let t=Math.sin(Math.min(1,R.time/1.4)*Math.PI);q(e,K(R.time),n,.2*t,l.radius),b=1,R.time>1.4&&(R.active=!1)}else if(l.autoDemo&&!a&&s&&n>0){let e,r;w.ramp=Math.min(1,w.ramp+n/.8),w.phase+=n*l.autoSpeed*1.6;let i=(e=.62*Math.sin(.83*(t=w.phase)+1.3)+.38*Math.sin(1.71*t+.4),r=.6*Math.sin(1.07*t+2.1)+.4*Math.cos(.61*t+.7),[(.5+.41*e)*u.width,(.5+.41*r)*u.height]);if(w.ready){let e=.3+.7*Math.pow(.5+.5*Math.sin(2.6*w.phase),2),t=l.force/20*.45*l.autoIntensity*w.ramp*w.ramp*e*c;q([w.x,w.y],i,n,t,l.radius)}w.x=i[0],w.y=i[1],w.ready=!0,b=1}else w.ramp=0;if(T.moved&&n>0){T.moved=!1;let t=Math.max(e-T.last,8)/1e3;q([T.fromX,T.fromY],[T.x,T.y],t,l.force/20*.15*c,l.radius),T.fromX=T.x,T.fromY=T.y,T.last=e,b=1}let m=U.shift();m&&M.push(m),r.bindVertexArray(o),r.disable(r.BLEND),n>0&&((e,t)=>{r.viewport(0,0,v.width,v.height);let a=+!!e.walls;M.forEach(e=>{j(i.splat,g.velocityNext,t=>{z(0,g.velocity.texture,t.uVelocity),r.uniform2f(t.uSize,u.width,u.height),r.uniform4f(t.uSegment,e.ax,e.ay,e.bx,e.by),r.uniform2f(t.uForce,e.vx,e.vy),r.uniform1f(t.uRadius,e.radius)}),$("velocity","velocityNext")}),M.length=0;let o=Math.ceil(4*e.viscosity);for(let t=0;t<o;t++)j(i.smooth,g.velocityNext,i=>{z(0,g.velocity.texture,i.uVelocity),r.uniform1f(i.uAmount,.9*Math.min(1,4*e.viscosity-t))}),$("velocity","velocityNext");j(i.divergence,g.divergence,e=>{z(0,g.velocity.texture,e.uVelocity),r.uniform1f(e.uWalls,a)});for(let e=0;e<32;e++)j(i.pressure,g.pressureNext,e=>{z(0,g.pressure.texture,e.uPressure),z(1,g.divergence.texture,e.uDivergence),r.uniform1f(e.uWalls,a)}),$("pressure","pressureNext");j(i.project,g.velocityNext,e=>{z(0,g.pressure.texture,e.uPressure),z(1,g.velocity.texture,e.uVelocity),r.uniform1f(e.uWalls,a)}),$("velocity","velocityNext"),j(i.advect,g.velocityNext,i=>{z(0,g.velocity.texture,i.uVelocity),r.uniform2f(i.uStep,t/u.width,t/u.height),r.uniform1f(i.uKeep,x(e.persistence,t)),r.uniform1f(i.uWalls,a)}),$("velocity","velocityNext")})(l,n),Y(l),b*=x(l.persistence,n),(R.active||l.autoDemo&&!a||b>.002||U.length>0||T.moved)&&D&&P&&(A=requestAnimationFrame(H))},J=()=>{!A&&!F&&D&&P&&(S=performance.now(),A=requestAnimationFrame(H))};X.current=()=>{G(),Y(O.current),J()};let Q=t=>{let r=e.getBoundingClientRect();return{x:t.clientX-r.left,y:r.bottom-t.clientY,inside:t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom}},Z=e=>{let t=Q(e);if(T.inside=t.inside,!t.inside){T.ready=!1;return}_=performance.now(),R.active=!1,T.ready||(T.fromX=t.x,T.fromY=t.y,T.x=t.x,T.y=t.y,T.last=_,T.ready=!0);let r=t.x-T.x,i=t.y-T.y;Math.hypot(r,i)>.5&&(T.dx=.7*T.dx+.3*r,T.dy=.7*T.dy+.3*i),T.x=t.x,T.y=t.y,T.moved=!0,J()},ee=e=>{let t=O.current,r=Q(e);if(!r.inside||(_=performance.now(),!t.clickBurst||a))return;let i=Math.hypot(T.dx,T.dy)>1?Math.atan2(T.dy,T.dx):Math.random()*Math.PI*2,o=Math.cos(i),u=Math.sin(i),l=.5*t.radius,n=1400*(t.force/20);U.push({ax:r.x-o*l,ay:r.y-u*l,bx:r.x+o*l,by:r.y+u*l,vx:o*n,vy:u*n,radius:.9*t.radius}),U.length>4&&U.shift(),b=1,J()},et=()=>{T.inside=!1,T.ready=!1},er=e=>{"mouse"!==e.pointerType&&et()};window.addEventListener("pointermove",Z,{passive:!0}),window.addEventListener("pointerdown",ee,{passive:!0}),window.addEventListener("pointerup",er,{passive:!0}),window.addEventListener("pointercancel",er,{passive:!0}),document.documentElement.addEventListener("pointerleave",et);let ei=e=>{e.preventDefault(),F=!0,cancelAnimationFrame(A),A=0},ea=()=>N(e=>e+1);t.addEventListener("webglcontextlost",ei),t.addEventListener("webglcontextrestored",ea);let eo=new ResizeObserver(()=>{G(),Y(O.current),J()});eo.observe(e);let eu=new IntersectionObserver(e=>{D=e.some(e=>e.isIntersecting),J()});eu.observe(e);let el=()=>{P="hidden"!==document.visibilityState,J()};return document.addEventListener("visibilitychange",el),G(),J(),()=>{cancelAnimationFrame(A),X.current=null,eo.disconnect(),eu.disconnect(),window.removeEventListener("pointermove",Z),window.removeEventListener("pointerdown",ee),window.removeEventListener("pointerup",er),window.removeEventListener("pointercancel",er),document.documentElement.removeEventListener("pointerleave",et),document.removeEventListener("visibilitychange",el),t.removeEventListener("webglcontextlost",ei),t.removeEventListener("webglcontextrestored",ea),r.isContextLost()||(W(),r.deleteTexture(k),r.deleteVertexArray(o),Object.values(i).forEach(e=>r.deleteProgram(e.program)))}},[I]),(0,i.jsx)("div",{ref:L,className:`liquid-ether${P?` ${P}`:""}`,style:F,children:(0,i.jsx)("canvas",{ref:V,className:"liquid-ether__canvas","aria-hidden":"true"})})}}}]);