import{n as e,t}from"./style-DSc5OWjD.js";import{A as n,C as r,D as i,E as a,F as o,I as s,L as c,M as l,N as u,O as d,P as f,R as p,S as m,T as h,_ as g,a as _,b as v,c as y,d as b,f as x,g as S,h as C,i as w,j as T,k as E,l as D,m as O,n as k,o as ee,p as A,r as j,s as te,t as ne,u as re,v as M,w as ie,x as N,y as P,z as F}from"./vue-vendor-CKem-9up.js";import{a as ae,c as oe,i as se,l as I,n as ce,o as le,r as ue,s as de,t as fe,u as L}from"./d3-vendor-7qNyeggi.js";var pe=`/Campus-Buddy/assets/avatar_developer-CcgoAaWA.png`,me=1.3,he=1;function R(e,t){return`${e}:${t}`}var ge=class{static countConnectedComponents(e){let t=new Set,n=0;for(let r of e.keys()){if(t.has(r))continue;n++;let i=[r],a=0;for(t.add(r);a<i.length;){let n=i[a++];for(let r of e.get(n)??[])t.has(r)||(t.add(r),i.push(r))}}return n}static findPath(e,t,n,r=new Set){let i=R(`student`,t),a=R(`student`,n);if(!e.has(i)||!e.has(a))return null;if(i===a)return{path:[i],hops:0,readable:[t]};if(r.has(n))return null;let o=new Map,s=[i],c=0;for(o.set(i,``);c<s.length;){let t=s[c++];for(let n of e.get(t)??[]){if(n.startsWith(`student:`)){let e=n.slice(8);if(r.has(e)&&n!==i)continue}if(!o.has(n)){if(o.set(n,t),n===a){let e=[],t=a;for(;t!==``;)e.push(t),t=o.get(t);return e.reverse(),{path:e,hops:e.filter(e=>e.startsWith(`student:`)).length-1,readable:e.map(e=>e.substring(e.indexOf(`:`)+1))}}s.push(n)}}}return null}static calculateJaccardSimilarity(e,t,n,r=new Set,i=new Set){let a=R(`student`,t);if(!e.has(a))return{activities:[],buddies:[]};let o=Array.from(e.get(a)??[]).filter(e=>e.startsWith(`interest:`)),s=new Set(o),c=new Set,l=new Set,u=[];for(let t of o)for(let n of e.get(t)??[])if(n.startsWith(`activity:`)){let e=n.replace(`activity:`,``);c.add(e)}else if(n.startsWith(`student:`)&&n!==a){let t=n.replace(`student:`,``);if(r.has(t)||l.has(t))continue;l.add(t);let a=R(`student`,t),c=new Set;for(let t of e.get(a)??[])t.startsWith(`interest:`)&&c.add(t);let d=0,f=[];for(let e of o)c.has(e)&&(d++,f.push(e.replace(`interest:`,``)));let p=s.size+c.size-d,m=p>0?d/p:0;i.has(t)&&(m=Math.min(he,m*me)),u.push({name:t,jaccard:m,sharedCount:d,sharedInterests:f})}return u.sort((e,t)=>t.jaccard-e.jaccard||e.name.localeCompare(t.name)),{activities:Array.from(c).sort((e,t)=>{let r=+!!n.has(e),i=+!!n.has(t);return r===i?e.localeCompare(t):i-r}),buddies:u}}},_e=[`🚀`,`💻`,`🎨`,`🎮`,`🧭`,`🎧`,`🧠`],z=u({sports:[`篮球`,`足球`,`羽毛球`,`网球`,`游泳`,`乒乓球`,`排球`],arts:[`摄影`,`读书`,`电影`,`音乐`,`绘画`,`棋类`,`桌游`,`书法`],tech:[`Python`,`Web开发`,`机器学习`,`算法竞赛`,`网络安全`,`Linux`,`硬件DIY`,`物联网`],social:[`志愿服务`,`英语角`,`户外探索`,`辩论社`,`公益支教`,`求职沙龙`,`旅行搭子`]});function ve(e,t){z[t]&&!z[t].includes(e)&&z[t].push(e)}O(()=>Object.values(z).flat());var ye=[{key:`sports`,label:`运动`,icon:`⚽`,color:`#22d3ee`},{key:`arts`,label:`艺术`,icon:`🎨`,color:`#f472b6`},{key:`tech`,label:`科技`,icon:`💻`,color:`#ffb74d`},{key:`social`,label:`社交`,icon:`🤝`,color:`#34d399`}],be=`系统管理员`,xe=Math.floor(Math.random()*1e9);function Se(){xe=Math.floor(Math.random()*1e9)}function Ce(e){let t=[...e],n=xe,r=()=>(n=Math.imul(n^n>>>16,2246822507),n=Math.imul(n^n>>>13,3266489909),((n^=n>>>16)>>>0)/4294967296);for(let e=t.length-1;e>0;e--){let n=Math.floor(r()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function we(e){let t=[];for(let[n,r]of e.entries())if(n.startsWith(`student:`)){let e=n.substring(8);if(e===`系统管理员`)continue;t.push({name:e,score:r.size})}return t.sort((e,t)=>t.score-e.score).slice(0,10)}function Te(e,t=50){let n=Array.from(e.keys()).filter(e=>e.startsWith(`student:`));if(n.length===0)return[];let r={};n.forEach(e=>{r[e]=0});let i=Ce(n).slice(0,Math.min(t,n.length));for(let t of i){let n=[t],i=0,a={},o={[t]:0};for(;i<n.length;){let t=n[i++];for(let r of e.get(t)??[])o.hasOwnProperty(r)?o[r]===o[t]+1&&a[r].push(t):(o[r]=o[t]+1,n.push(r),a[r]=[t])}let s={},c=Object.keys(o).sort((e,t)=>o[t]-o[e]);c.forEach(e=>{s[e]=0}),c.forEach(e=>{let n=a[e]||[];n.forEach(t=>{s[t]+=(1+s[e])/n.length}),e!==t&&e.startsWith(`student:`)&&(r[e]+=s[e])})}return Object.entries(r).map(([e,t])=>({name:e.includes(`:`)?e.substring(e.indexOf(`:`)+1):e,score:Math.round(t*10)/10})).filter(e=>e.name!==be).sort((e,t)=>t.score-e.score).slice(0,10)}function Ee(e){let t=0;for(let[n,r]of e.entries())n.startsWith(`student:`)&&n!==`student:系统管理员`&&r.size===0&&t++;return t}function De(e,t){return t?Math.round((1-e/t)*1e3)/10:0}function Oe(e){let t=[];for(let[n,r]of e.entries()){if(!n.startsWith(`activity:`))continue;let e=n.slice(9),i;for(let e of r)if(e.startsWith(`interest:`)){i=e;break}if(!i)continue;let a=i.slice(9),o=0;for(let e of r)e.startsWith(`student:`)&&o++;t.push({name:e,interest:a,count:o})}return t.sort((e,t)=>t.count-e.count).slice(0,5)}function ke(e){let t=[],n=ye.map(t=>{let n=z[t.key]||[],r=new Set(n.map(e=>`interest:${e}`)),i=new Set,a=0;for(let[t,n]of e.entries()){if(!t.startsWith(`student:`))continue;let e=!1;for(let t of n)if(r.has(t)){e=!0;break}e&&(i.add(t),a+=n.size)}let o=i.size;return{meta:t,size:o,avgDegree:o>0?Math.round(a/o*10)/10:0,tagsCount:n.length}}),r=n.reduce((e,t)=>e+t.size,0),i=0,a=n.map(e=>{let t=r>0?e.size/r*100:0,n=Math.round(t);return i+=n,{stat:e,percentage:n,error:t-n}});if(r>0&&i!==100){let e=100-i;if(e>0){let t=[...a].sort((e,t)=>t.error-e.error);t[0]&&(t[0].percentage+=e)}else{let t=[...a].sort((e,t)=>e.error-t.error);t[0]&&(t[0].percentage+=e)}}for(let e of a)t.push({domain:e.stat.meta.key,label:e.stat.meta.label,icon:e.stat.meta.icon,color:e.stat.meta.color,size:e.stat.size,percentage:e.percentage,avgDegree:e.stat.avgDegree,tagsCount:e.stat.tagsCount});return t}function Ae(e,t=30){let n=Array.from(e.keys()).filter(e=>e.startsWith(`student:`));if(n.length<2)return 0;let r=Ce(n).slice(0,Math.min(t,n.length)),i=0,a=0;for(let t of r){let n={[t]:0},r=[t],o=0;for(;o<r.length;){let t=r[o++],s=n[t];for(let o of e.get(t)??[])n.hasOwnProperty(o)||(n[o]=s+1,r.push(o),o.startsWith(`student:`)&&(i+=(s+1)/2,a++))}}return a>0?Math.round(i/a*100)/100:0}function je(e,t=30){let n=Array.from(e.keys()).filter(e=>e.startsWith(`student:`));if(n.length<3)return 0;let r=Ce(n).slice(0,Math.min(t,n.length)),i=0,a=0;for(let t of r){let n=new Set,r=e.get(t)??new Set;for(let i of r)for(let r of e.get(i)??[])r!==t&&r.startsWith(`student:`)&&n.add(r);if(n.size<2)continue;let o=0,s=Array.from(n),c=new Map;for(let t of s){let n=new Set,r=e.get(t)??new Set;for(let e of r)(e.startsWith(`interest:`)||e.startsWith(`activity:`))&&n.add(e);c.set(t,n)}for(let e=0;e<s.length;e++){let t=s[e],n=c.get(t);if(n.size!==0)for(let t=e+1;t<s.length;t++){let e=s[t],r=c.get(e),i=!1;if(n.size<r.size){for(let e of n)if(r.has(e)){i=!0;break}}else for(let e of r)if(n.has(e)){i=!0;break}i&&o++}}let l=n.size,u=l*(l-1)/2;i+=o/u,a++}return a>0?Math.round(i/a*100)/100:0}function Me(e,t,n,r){if(t<2)return 0;let i=0;for(let[t,n]of e.entries())t.startsWith(`student:`)&&(i+=n.size);let a=n+r;if(!a)return 0;let o=i/(t*a);return Math.round(o*1e3)/100}var B={getItem(e){try{return localStorage.getItem(e)}catch{return null}},setItem(e,t){try{localStorage.setItem(e,t)}catch{}},removeItem(e){try{localStorage.removeItem(e)}catch{}}};function Ne(e){let t=e|0;return function(){return t=Math.imul(t^t>>>16,2246822507),t=Math.imul(t^t>>>13,3266489909),((t^=t>>>16)>>>0)/4294967296}}var V=k(`graph`,()=>{let e=f(new Map),t=f(new Set),n=f(new Set);function r(e,n){n?t.value.add(e):t.value.delete(e),o(t)}function i(e,t){t?n.value.add(e):n.value.delete(e),o(n)}let a=O(()=>Array.from(e.value.keys()).filter(e=>e.startsWith(`student:`))),s=O(()=>{let t=[];for(let[n,r]of e.value.entries())if(n.startsWith(`activity:`)){let e=n.slice(9),i=[],a=0;for(let e of r)e.startsWith(`interest:`)?i.push(e.slice(9)):e.startsWith(`student:`)&&a++;t.push({name:e,interests:i,studentCount:a})}return t.sort((e,t)=>t.studentCount-e.studentCount||e.name.localeCompare(t.name))}),c=u({studentsCount:0,interestsCount:0,activitiesCount:0,componentsCount:0}),l=new Set;function d(e){return l.add(e),()=>{l.delete(e)}}function p(t,n){e.value.has(t)||e.value.set(t,new Set),e.value.has(n)||e.value.set(n,new Set),e.value.get(t).add(n),e.value.get(n).add(t)}let m=null;function h(t=!1){let n=0,r=0,i=0;for(let t of e.value.keys())t.startsWith(`student:`)?n++:t.startsWith(`interest:`)?r++:t.startsWith(`activity:`)&&i++;c.studentsCount=n,c.interestsCount=r,c.activitiesCount=i,o(e),l.forEach(e=>e()),m&&=(clearTimeout(m),null),t?c.componentsCount=ge.countConnectedComponents(e.value):m=setTimeout(()=>{c.componentsCount=ge.countConnectedComponents(e.value),m=null},100)}async function g(r){try{Se();let i=await fetch(`/Campus-Buddy/graph_data.json`);if(!i.ok)throw Error(`graph_data.json not found`);let a=await i.json();if(!a||!Array.isArray(a.students)||!Array.isArray(a.activities))throw Error(`Invalid graph data format: students and activities must be arrays`);e.value.clear(),t.value.clear(),t.value.add(`张子涵`);let o=Array.from(new Set(a.students.map(e=>e[0])));n.value.clear();let s=Ne(r===void 0?Math.floor(Math.random()*1e9):r);for(let e of o)e!==`张子涵`&&s()<.15&&n.value.add(e);let c=new Set;for(;c.size<4&&o.length>10;){let e=o[Math.floor(s()*o.length)];e&&e!==`系统管理员`&&c.add(e)}for(let[t,n]of a.students){if(c.has(t)){let n=R(`student`,t);e.value.has(n)||e.value.set(n,new Set);continue}p(R(`student`,t),R(`interest`,n))}for(let[e,t]of a.activities)p(R(`activity`,e),R(`interest`,t));if(a.registrations)for(let[e,t]of a.registrations)c.has(e)||s()>.2&&p(R(`student`,e),R(`activity`,t));for(let t of o)if(!c.has(t)&&s()<.25){let n=R(`student`,t),r=Array.from(e.value.get(n)??[]).filter(e=>e.startsWith(`interest:`));if(r.length>0){let t=r[Math.floor(s()*r.length)],i=Array.from(e.value.get(t)??[]).filter(e=>e.startsWith(`activity:`));if(i.length>0){let e=i[Math.floor(s()*i.length)];p(n,e)}}}let l=[];try{l=JSON.parse(B.getItem(`campus_buddy_custom_interests`)||`[]`)}catch{}for(let t of l){ve(t.name,t.domain);let n=`interest:${t.name}`;e.value.has(n)||e.value.set(n,new Set)}let u=[];try{u=JSON.parse(B.getItem(`campus_buddy_custom_activities`)||`[]`)}catch{}for(let e of u)_(e.name,e.interests,!1);let d=[];try{d=JSON.parse(B.getItem(`campus_buddy_deleted_activities`)||`[]`)}catch{}for(let e of d)v(e,!1);let f=[];try{f=JSON.parse(B.getItem(`campus_buddy_registered_students`)||`[]`)}catch{}for(let r of f){let i=`student:${r.name}`;e.value.has(i)||e.value.set(i,new Set);for(let e of r.interests)p(i,`interest:${e}`);for(let e of r.signups)p(i,`activity:${e}`);r.privateMode?t.value.add(r.name):t.value.delete(r.name),r.socialMode?n.value.add(r.name):n.value.delete(r.name)}h()}catch(e){console.error(`[GraphStore] Failed to load graph data:`,e)}}function _(t,n,r=!0){let i=`activity:${t}`;e.value.has(i)||e.value.set(i,new Set);for(let e of n)p(i,`interest:${e}`);if(r)try{let e=JSON.parse(B.getItem(`campus_buddy_custom_activities`)||`[]`);e.some(e=>e.name===t)||(e.push({name:t,interests:n}),B.setItem(`campus_buddy_custom_activities`,JSON.stringify(e)));let r=JSON.parse(B.getItem(`campus_buddy_deleted_activities`)||`[]`).filter(e=>e!==t);B.setItem(`campus_buddy_deleted_activities`,JSON.stringify(r))}catch{}h()}function v(t,n=!0){let r=`activity:${t}`;if(!e.value.has(r))return;let i=e.value.get(r)??new Set;for(let t of i){let n=e.value.get(t);n&&n.delete(r)}if(e.value.delete(r),n)try{let e=JSON.parse(B.getItem(`campus_buddy_custom_activities`)||`[]`);if(e.some(e=>e.name===t)){let n=e.filter(e=>e.name!==t);B.setItem(`campus_buddy_custom_activities`,JSON.stringify(n))}else{let e=JSON.parse(B.getItem(`campus_buddy_deleted_activities`)||`[]`);e.includes(t)||(e.push(t),B.setItem(`campus_buddy_deleted_activities`,JSON.stringify(e)))}}catch{}h()}function y(t,n,r=!0){let i=`interest:${t}`;if(e.value.has(i)||e.value.set(i,new Set),ve(t,n),r)try{let e=JSON.parse(B.getItem(`campus_buddy_custom_interests`)||`[]`);e.some(e=>e.name===t)||(e.push({name:t,domain:n}),B.setItem(`campus_buddy_custom_interests`,JSON.stringify(e)))}catch{}h()}return{graph:e,stats:c,privateStudents:t,setStudentPrivacy:r,socialStudents:n,setStudentSocial:i,registerOnStatsUpdate:d,addEdge:p,updateStats:h,loadGraphData:g,addActivity:_,deleteActivity:v,addInterestNode:y,studentsList:a,allActivitiesList:s}}),Pe=/^[\u4e00-\u9fa5a-zA-Z0-9\s-]{2,20}$/;function Fe(e){let t={sports:e.filter(e=>z.sports.includes(e)).length,tech:e.filter(e=>z.tech.includes(e)).length,arts:e.filter(e=>z.arts.includes(e)).length,social:e.filter(e=>z.social.includes(e)).length},n=Math.max(...Object.values(t));if(n===0)return`社交达人`;let r=Object.keys(t).filter(e=>t[e]===n);if(r.length>1)return`斜杠青年`;let i=r[0];return i===`tech`?`科技极客`:i===`sports`?`运动健将`:i===`arts`?`文艺青年`:`社交达人`}async function Ie(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return Array.from(new Uint8Array(n)).map(e=>e.toString(16).padStart(2,`0`)).join(``)}var H={getItem(e){try{return localStorage.getItem(e)}catch{return null}},setItem(e,t){try{localStorage.setItem(e,t)}catch{}},removeItem(e){try{localStorage.removeItem(e)}catch{}}},U=k(`auth`,()=>{let e=H.getItem(`campus_buddy_user`),t=H.getItem(`campus_buddy_role`),n=f(e),r=f(t===`admin`||t===`student`?t:null),i=f(H.getItem(`campus_buddy_avatar`)??_e[0]),a=f(H.getItem(`campus_buddy_persona`)??`未知`),o=[];try{let e=H.getItem(`campus_buddy_signups`);e&&(o=JSON.parse(e),Array.isArray(o)||(o=[]))}catch{}let s=f(o),c=f(H.getItem(`campus_buddy_private_mode`)===`true`),l=f(H.getItem(`campus_buddy_social_mode`)===`true`);function d(){if(c.value=!c.value,H.setItem(`campus_buddy_private_mode`,c.value?`true`:`false`),c.value&&l.value){l.value=!1,H.setItem(`campus_buddy_social_mode`,`false`);let e=V();n.value&&e.setStudentSocial(n.value,!1)}let e=V();if(n.value&&e.setStudentPrivacy(n.value,c.value),n.value)try{let e=JSON.parse(H.getItem(`campus_buddy_registered_students`)||`[]`),t=e.find(e=>e.name===n.value);t&&(t.privateMode=c.value,t.socialMode=l.value,H.setItem(`campus_buddy_registered_students`,JSON.stringify(e)))}catch{}}function p(){if(l.value=!l.value,H.setItem(`campus_buddy_social_mode`,l.value?`true`:`false`),l.value&&c.value){c.value=!1,H.setItem(`campus_buddy_private_mode`,`false`);let e=V();n.value&&e.setStudentPrivacy(n.value,!1)}let e=V();if(n.value&&e.setStudentSocial(n.value,l.value),n.value)try{let e=JSON.parse(H.getItem(`campus_buddy_registered_students`)||`[]`),t=e.find(e=>e.name===n.value);t&&(t.privateMode=c.value,t.socialMode=l.value,H.setItem(`campus_buddy_registered_students`,JSON.stringify(e)))}catch{}}let m=u({name:``,avatar:_e[0],selectedInterests:[]}),h=O(()=>{if(!n.value)return[];let e=V();return Array.from(e.graph.get(`student:${n.value}`)??[]).filter(e=>e.startsWith(`interest:`)).map(e=>e.replace(`interest:`,``))}),g=O(()=>{let e=h.value,t=e.length||1;return ye.map(n=>{let r=e.filter(e=>z[n.key].includes(e)).length;return{label:n.label,icon:n.icon,color:n.color,count:r,pct:Math.round(r/t*100)}})}),_=O(()=>{let e=a.value;return e.includes(`科技`)?`badge-orange`:e.includes(`运动`)?`badge-cyan`:e.includes(`文艺`)?`badge-pink`:`badge-green`}),v=O(()=>m.selectedInterests.length===0?`待生成画像...`:Fe(m.selectedInterests)),y=O(()=>{let e=v.value;return e.includes(`科技`)?`text-orange`:e.includes(`运动`)?`text-cyan`:e.includes(`文艺`)?`text-pink`:`text-green`});function b(e){let t=m.selectedInterests.indexOf(e);t>-1?m.selectedInterests.splice(t,1):m.selectedInterests.push(e)}function x(){let e=m.name.trim();if(!e||!Pe.test(e)||m.selectedInterests.length===0)return;n.value=e,r.value=`student`,i.value=m.avatar,a.value=Fe(m.selectedInterests),c.value=!1,l.value=!1,H.setItem(`campus_buddy_user`,e),H.setItem(`campus_buddy_role`,`student`),H.setItem(`campus_buddy_avatar`,m.avatar),H.setItem(`campus_buddy_persona`,a.value),H.setItem(`campus_buddy_interests`,JSON.stringify(m.selectedInterests)),H.setItem(`campus_buddy_private_mode`,`false`),H.setItem(`campus_buddy_social_mode`,`false`);try{let t=JSON.parse(H.getItem(`campus_buddy_registered_students`)||`[]`),n=t.findIndex(t=>t.name===e),r={name:e,avatar:m.avatar,interests:m.selectedInterests,signups:[],privateMode:!1,socialMode:!1};n>-1?t[n]=r:t.push(r),H.setItem(`campus_buddy_registered_students`,JSON.stringify(t))}catch{}let t=V(),o=`student:${e}`;for(let e of m.selectedInterests)t.addEdge(o,`interest:${e}`);t.updateStats()}async function S(e){return await Ie(e.trim())===`3c6a6ef3ab28ad049ea0e4c091d249d6ffe4f8ef69b645a5e855d243980fa877`?(n.value=be,r.value=`admin`,i.value=`🤖`,a.value=be,H.setItem(`campus_buddy_user`,be),H.setItem(`campus_buddy_role`,`admin`),H.setItem(`campus_buddy_avatar`,`🤖`),H.setItem(`campus_buddy_persona`,a.value),H.setItem(`campus_buddy_interests`,JSON.stringify([])),V().updateStats(),!0):!1}function C(){let e=H.getItem(`campus_buddy_user`);if(!e)return;let t=H.getItem(`campus_buddy_role`),o=V(),u=`student:${e}`;if(t===`student`&&!o.graph.has(u)){console.warn(`[AuthStore] Session student "${e}" not found in graph, resetting session.`),w();return}n.value=e,r.value=t===`admin`||t===`student`?t:`student`,i.value=H.getItem(`campus_buddy_avatar`)??`🧭`,a.value=H.getItem(`campus_buddy_persona`)??`普通同学`;let d=[];try{d=JSON.parse(H.getItem(`campus_buddy_interests`)??`[]`),Array.isArray(d)||(d=[])}catch(e){console.warn(`[AuthStore] Failed to parse saved interests from localStorage, falling back to empty list.`,e)}for(let e of d)o.addEdge(u,`interest:${e}`);let f=[];try{f=JSON.parse(H.getItem(`campus_buddy_signups`)??`[]`),Array.isArray(f)||(f=[])}catch(e){console.warn(`[AuthStore] Failed to parse saved signups from localStorage, falling back to empty list.`,e)}s.value=f;for(let e of f)o.addEdge(u,`activity:${e}`);c.value=H.getItem(`campus_buddy_private_mode`)===`true`,c.value&&o.setStudentPrivacy(e,!0),l.value=H.getItem(`campus_buddy_social_mode`)===`true`,l.value&&o.setStudentSocial(e,!0)}async function w(){try{let e=[`campus_buddy_custom_activities`,`campus_buddy_custom_interests`,`campus_buddy_deleted_activities`,`campus_buddy_registered_students`];Object.keys(localStorage).forEach(t=>{t.startsWith(`campus_buddy_`)&&!e.includes(t)&&localStorage.removeItem(t)})}catch{}n.value=null,r.value=null,i.value=_e[0],a.value=`未知`,s.value=[],c.value=!1,l.value=!1,m.selectedInterests=[],m.name=``,m.avatar=_e[0];let e=V();e.graph.clear(),await e.loadGraphData()}function T(e){if(!n.value)return;let t=V(),r=`student:${n.value}`;if(t.addEdge(r,`activity:${e}`),!s.value.includes(e)){s.value.push(e),H.setItem(`campus_buddy_signups`,JSON.stringify(s.value));try{let t=JSON.parse(H.getItem(`campus_buddy_registered_students`)||`[]`),r=t.find(e=>e.name===n.value);r&&!r.signups.includes(e)&&(r.signups.push(e),H.setItem(`campus_buddy_registered_students`,JSON.stringify(t)))}catch{}}t.updateStats()}function E(e){if(!n.value)return;let t=V(),r=`student:${n.value}`,i=`activity:${e}`;t.graph.has(r)&&t.graph.get(r).delete(i),t.graph.has(i)&&t.graph.get(i).delete(r);let a=s.value.indexOf(e);if(a>-1){s.value.splice(a,1),H.setItem(`campus_buddy_signups`,JSON.stringify(s.value));try{let t=JSON.parse(H.getItem(`campus_buddy_registered_students`)||`[]`),r=t.find(e=>e.name===n.value);r&&(r.signups=r.signups.filter(t=>t!==e),H.setItem(`campus_buddy_registered_students`,JSON.stringify(t)))}catch{}}t.updateStats()}function D(e){return s.value.includes(e)}return{currentUser:n,currentUserRole:r,currentUserAvatar:i,userPersona:a,signedUpActivities:s,regForm:m,computePersona:Fe,userInterestTags:h,domainDistribution:g,personaBadgeClass:_,previewPersona:v,previewPersonaClass:y,toggleInterestTag:b,submitRegistration:x,submitAdminLogin:S,restoreSession:C,logout:w,signUpForActivity:T,cancelSignUpForActivity:E,isSignedUp:D,isPrivateMode:c,togglePrivacyMode:d,isSocialMode:l,toggleSocialMode:p}}),W=O(()=>U().currentUser),G=T((e,t)=>({get:()=>(e(),j()?U().currentUserRole:null),set:e=>{j()&&(U().currentUserRole=e,t())}})),Le=O(()=>U().currentUserAvatar),Re=O(()=>U().userPersona),ze=O(()=>U().signedUpActivities);O(()=>U().regForm);var Be=O(()=>U().userInterestTags);O(()=>U().domainDistribution);var Ve=O(()=>U().personaBadgeClass),He=O(()=>U().previewPersona),Ue=O(()=>U().previewPersonaClass),We=e=>{U().toggleInterestTag(e)},Ge=()=>{U().submitRegistration()},Ke=async e=>await U().submitAdminLogin(e),qe=()=>{U().restoreSession()},Je=async()=>{await U().logout()},Ye=e=>{U().signUpForActivity(e)},Xe=e=>{U().cancelSignUpForActivity(e)},Ze=e=>U().isSignedUp(e),Qe=O(()=>U().isPrivateMode),$e=()=>{U().togglePrivacyMode()},et=O(()=>U().isSocialMode),tt=()=>{U().toggleSocialMode()},nt={class:`student-form-section`},rt={class:`form-split-row`},it={class:`form-left-col`},at={class:`form-group`},ot={class:`form-right-col`},st={class:`form-group`},ct={class:`avatar-picker-grid`},lt=[`onClick`],ut={class:`live-identity-card`},dt={class:`live-card-body`},ft={class:`live-avatar-preview`},pt={class:`live-info-preview`},mt={class:`live-name-preview`},ht={class:`live-interests-preview`},gt={key:0,class:`placeholder-text`},_t={class:`interests-picker-container`},vt={class:`picker-section`},yt={class:`tags-grid`},bt=[`onClick`],xt={class:`picker-section`},St={class:`tags-grid`},Ct=[`onClick`],wt={class:`picker-section`},Tt={class:`tags-grid`},Et=[`onClick`],Dt={class:`picker-section`},Ot={class:`tags-grid`},kt=[`onClick`],At={key:0,class:`warning-text`},jt={key:1,class:`warning-text`},Mt=[`disabled`],Nt=e(m({__name:`StudentLoginForm`,emits:[`loading-start`],setup(e,{emit:t}){let r=U().regForm,o=t,l=O(()=>{let e=r.name.trim();return e?Pe.test(e):!1}),u=()=>{!l.value||r.selectedInterests.length===0||o(`loading-start`,{name:r.name.trim(),avatar:r.avatar,interests:[...r.selectedInterests]})};return(e,t)=>(a(),M(`div`,nt,[C(`div`,rt,[C(`div`,it,[C(`div`,at,[t[1]||=C(`label`,{class:`label-bold`},`👤 请输入您的姓名`,-1),n(C(`input`,{"onUpdate:modelValue":t[0]||=e=>s(r).name=e,placeholder:`请输入姓名或代号...`,required:``,onKeyup:b(u,[`enter`])},null,544),[[D,s(r).name]])])]),C(`div`,ot,[C(`div`,st,[t[2]||=C(`label`,{class:`label-bold`},`🤖 选择您的头像`,-1),C(`div`,ct,[(a(!0),M(A,null,i(s(_e),e=>(a(),M(`button`,{key:e,type:`button`,class:c([`avatar-picker-btn`,{"avatar-active":s(r).avatar===e}]),onClick:t=>s(r).avatar=e},F(e),11,lt))),128))])])])]),C(`div`,ut,[t[3]||=C(`h4`,null,`🆔 实时社交画像预览`,-1),C(`div`,dt,[C(`div`,ft,F(s(r).avatar),1),C(`div`,pt,[C(`div`,mt,F(s(r).name||`等待输入姓名...`),1),C(`div`,{class:c([`live-persona-preview`,s(Ue)])},F(s(He)),3)]),C(`div`,ht,[(a(!0),M(A,null,i(s(r).selectedInterests,e=>(a(),M(`span`,{key:e,class:`preview-tag`},`# `+F(e),1))),128)),s(r).selectedInterests.length===0?(a(),M(`span`,gt,`暂未勾选兴趣...`)):g(``,!0)])])]),t[8]||=C(`hr`,{class:`divider`},null,-1),t[9]||=C(`h3`,{class:`section-title`},`🎯 勾选您的兴趣标签`,-1),C(`div`,_t,[C(`div`,vt,[t[4]||=C(`h5`,null,`⚽ 体育运动`,-1),C(`div`,yt,[(a(!0),M(A,null,i(s(z).sports,e=>(a(),M(`span`,{key:e,class:c([`interest-tag`,{"tag-active":s(r).selectedInterests.includes(e)}]),onClick:t=>s(We)(e)},F(e),11,bt))),128))])]),C(`div`,xt,[t[5]||=C(`h5`,null,`🎨 文化艺术`,-1),C(`div`,St,[(a(!0),M(A,null,i(s(z).arts,e=>(a(),M(`span`,{key:e,class:c([`interest-tag`,{"tag-active":s(r).selectedInterests.includes(e)}]),onClick:t=>s(We)(e)},F(e),11,Ct))),128))])]),C(`div`,wt,[t[6]||=C(`h5`,null,`💻 极客技术`,-1),C(`div`,Tt,[(a(!0),M(A,null,i(s(z).tech,e=>(a(),M(`span`,{key:e,class:c([`interest-tag`,{"tag-active":s(r).selectedInterests.includes(e)}]),onClick:t=>s(We)(e)},F(e),11,Et))),128))])]),C(`div`,Dt,[t[7]||=C(`h5`,null,`🤝 志愿社交`,-1),C(`div`,Ot,[(a(!0),M(A,null,i(s(z).social,e=>(a(),M(`span`,{key:e,class:c([`interest-tag`,{"tag-active":s(r).selectedInterests.includes(e)}]),onClick:t=>s(We)(e)},F(e),11,kt))),128))])])]),s(r).name.trim()&&!l.value?(a(),M(`div`,At,` ⚠️ 姓名格式不合法：只允许中文、英文字母、数字和空格/连字符（长度为2-20字）！ `)):g(``,!0),s(r).selectedInterests.length===0?(a(),M(`div`,jt,` ⚠️ 请至少选择一个兴趣标签以建立连接！ `)):g(``,!0),C(`button`,{onClick:u,disabled:s(r).selectedInterests.length===0||!l.value,class:`btn btn-primary glow-orange`,style:{width:`100%`}},` 生成社交画像并登入系统 `,8,Mt)]))}}),[[`__scopeId`,`data-v-6d6869fb`]]),Pt={class:`admin-form-section`},Ft={class:`form-group`,style:{"margin-top":`15px`}},It={key:0,class:`warning-text`,style:{"margin-top":`10px`}},Lt={key:0},Rt={key:1},zt=[`disabled`],Bt={key:0},Vt={key:1},Ht=e(m({__name:`AdminLoginForm`,emits:[`submitted`],setup(e,{emit:t}){let r=t,i=f(``),o=f(!1),s=f(0),c=f(0),l=null,u=async()=>{c.value>0||(await Ke(i.value)?(o.value=!1,s.value=0,r(`submitted`)):(o.value=!0,s.value++,s.value>=3&&(c.value=15,l&&clearInterval(l),l=setInterval(()=>{c.value--,c.value<=0&&(clearInterval(l),s.value=0)},1e3))))};return h(()=>{l&&clearInterval(l)}),(e,t)=>(a(),M(`div`,Pt,[C(`div`,Ft,[t[1]||=C(`label`,{class:`label-bold`},`🔑 请输入管理员安全密码`,-1),n(C(`input`,{type:`password`,"onUpdate:modelValue":t[0]||=e=>i.value=e,placeholder:`请输入管理员授权密钥...`,required:``,style:{width:`100%`,"margin-top":`10px`},onKeyup:b(u,[`enter`])},null,544),[[D,i.value]])]),o.value?(a(),M(`div`,It,[c.value>0?(a(),M(`span`,Lt,`⚠️ 密码错误次数过多！请在 `+F(c.value)+` 秒后重试。`,1)):(a(),M(`span`,Rt,`⚠️ 密钥校验失败，密码输入错误！`))])):g(``,!0),C(`button`,{onClick:u,disabled:c.value>0,class:`btn btn-secondary glow-cyan`,style:{width:`100%`,padding:`12px`,"margin-top":`24px`,"font-weight":`700`}},[c.value>0?(a(),M(`span`,Bt,`🔐 安全锁定中 (`+F(c.value)+`s)`,1)):(a(),M(`span`,Vt,`✅ 验证并进入管理员面板`))],8,zt)]))}}),[[`__scopeId`,`data-v-22953dec`]]),Ut={class:`login-overlay fade-in`},Wt={class:`login-logo-banner`},Gt={class:`logo-main-group`},Kt={class:`login-logo-text-wrap`},qt={class:`login-logo-sub`},Jt={class:`login-tabs`,role:`tablist`},Yt=[`aria-selected`],Xt=[`aria-selected`],Zt={class:`login-github-card`},Qt={href:`https://github.com/bestxby`,target:`_blank`,rel:`noopener`,class:`login-github-item author-link`,title:`访问作者 GitHub 主页`},$t=[`src`],en=e(m({__name:`LoginOverlay`,emits:[`submitted`],setup(e,{emit:r}){let i=r,o=f(`student`),l=f(null),u=e=>{l.value={...e,isAdmin:!1},Ge()},d=()=>{l.value=null,i(`submitted`)},p=()=>{l.value={name:`系统管理员`,avatar:`🤖`,interests:[],isAdmin:!0}};return(e,r)=>(a(),M(`div`,Ut,[l.value?(a(),S(t,{key:0,name:l.value.name,avatar:l.value.avatar,interests:l.value.interests,"is-admin":l.value.isAdmin,onDone:d},null,8,[`name`,`avatar`,`interests`,`is-admin`])):g(``,!0),n(C(`div`,{class:c([`login-card card`,o.value===`student`?`glow-orange student-card-width`:`glow-cyan admin-card-width`])},[C(`div`,Wt,[C(`div`,Gt,[r[3]||=P(`<div class="login-logo-icon" data-v-bfe06cae><svg class="icon-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke-linecap="round" stroke-linejoin="round" data-v-bfe06cae><circle cx="12" cy="12" r="10" stroke="var(--accent-neon-cyan)" stroke-width="1.5" data-v-bfe06cae></circle><polygon points="12,12 16.24,7.76 14.12,14.12" fill="var(--accent-neon-pink)" stroke="var(--accent-neon-pink)" stroke-width="0.5" data-v-bfe06cae></polygon><polygon points="12,12 16.24,7.76 9.88,9.88" fill="#b30059" stroke="#b30059" stroke-width="0.5" data-v-bfe06cae></polygon><polygon points="12,12 7.76,16.24 9.88,9.88" fill="var(--accent-neon-cyan)" stroke="var(--accent-neon-cyan)" stroke-width="0.5" data-v-bfe06cae></polygon><polygon points="12,12 7.76,16.24 14.12,14.12" fill="#0099ab" stroke="#0099ab" stroke-width="0.5" data-v-bfe06cae></polygon><circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="none" data-v-bfe06cae></circle></svg></div>`,1),C(`div`,Kt,[r[2]||=C(`div`,{class:`login-logo-title`},`Campus Buddy`,-1),C(`div`,qt,F(o.value===`student`?`校园社交智能推荐系统`:`管理端安全认证`),1)])])]),C(`div`,Jt,[C(`button`,{type:`button`,class:c([`login-tab-btn`,{"tab-active":o.value===`student`}]),role:`tab`,"aria-selected":o.value===`student`,onClick:r[0]||=e=>o.value=`student`},` 👤 学生登录入口 `,10,Yt),C(`button`,{type:`button`,class:c([`login-tab-btn`,{"tab-active-admin":o.value===`admin`}]),role:`tab`,"aria-selected":o.value===`admin`,onClick:r[1]||=e=>o.value=`admin`},` 🔐 管理员控制台 `,10,Xt)]),o.value===`student`?(a(),S(Nt,{key:0,onLoadingStart:u})):(a(),S(Ht,{key:1,onSubmitted:p})),C(`div`,Zt,[r[5]||=P(`<a href="https://github.com/bestxby/Campus-Buddy" target="_blank" rel="noopener" class="login-github-item repo-link" title="访问 GitHub 项目仓库" data-v-bfe06cae><div class="git-icon-wrap" data-v-bfe06cae><svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true" width="13" height="13" data-v-bfe06cae><path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" data-v-bfe06cae></path></svg></div><div class="git-info" data-v-bfe06cae><span class="git-title" data-v-bfe06cae>Campus-Buddy</span><span class="git-desc" data-v-bfe06cae>开源项目仓库 ➔</span></div></a><div class="git-divider" data-v-bfe06cae></div>`,2),C(`a`,Qt,[C(`img`,{src:s(pe),class:`git-avatar-img`,alt:`bestxby avatar`},null,8,$t),r[4]||=C(`div`,{class:`git-info`},[C(`span`,{class:`git-title`},`bestxby`),C(`span`,{class:`git-desc`},`开发者主页 ➔`)],-1)])])],2),[[re,!l.value]])]))}}),[[`__scopeId`,`data-v-bfe06cae`]]),K=k(`recommendation`,()=>{let e=f(null),t=f(new Set),n=u({activities:[],buddies:[]}),r=f(null),i=f(``),a=f([]),o=f(``),s=f(`全部`),c=f({});function l(e){let r=V(),{activities:i,buddies:a}=ge.calculateJaccardSimilarity(r.graph,e,t.value,r.privateStudents,r.socialStudents);n.activities=i,n.buddies=a}function d(e,t,n){let r=V(),i=R(`student`,e),a=R(n,t),o=Array.from(r.graph.get(i)??[]).filter(e=>e.startsWith(`interest:`)),s=new Set(Array.from(r.graph.get(a)??[]).filter(e=>e.startsWith(`interest:`))),c=o.find(e=>s.has(e));return c?c.replace(`interest:`,``):``}function p(e,t){let r=V(),i=R(`activity`,t),a=r.graph.get(i)??new Set,o=new Set(n.buddies.map(e=>e.name)),s=[];for(let t of a)if(t.startsWith(`student:`)){let n=t.slice(8);n!==e&&o.has(n)&&s.push(n)}return s}function m(t,n){let r=V();e.value=ge.findPath(r.graph,t,n,r.privateStudents)}function h(){n.activities=[],n.buddies=[],e.value=null,r.value=null,i.value=``,a.value=[],o.value=``,s.value=`全部`,c.value={}}return{pathResult:e,promotedActivities:t,recommendations:n,activeStudent:r,searchQuery:i,suggestions:a,searchFriendQuery:o,activeFilter:s,expandedGroups:c,runRecommendations:l,getSharedInterest:d,getBuddiesForActivity:p,calculatePath:m,clearRecommendations:h}}),q=O(()=>V().graph),tn=O(()=>V().stats),J=(e,t)=>R(e,t),nn=(e=!1)=>{V().updateStats(e)},rn=(e,t)=>ge.findPath(V().graph,e,t,V().privateStudents),an=async()=>{await V().loadGraphData()};function on(e,t){if(!j())return t;try{return e()}catch(e){return console.error(`[useRecommendations] Error accessing store property:`,e),t}}var sn=250,cn=300,ln=30,un=O({get:()=>on(()=>K().pathResult,null),set:e=>{j()&&(K().pathResult=e)}}),dn=O({get:()=>on(()=>K().promotedActivities,new Set),set:e=>{j()&&(K().promotedActivities=e)}}),Y=O(()=>on(()=>K().recommendations,{activities:[],buddies:[]})),X=T((e,t)=>({get:()=>(e(),on(()=>K().activeStudent,null)),set:e=>{j()&&(K().activeStudent=e,t())}})),fn=T((e,t)=>({get:()=>(e(),on(()=>K().searchQuery,``)),set:e=>{j()&&(K().searchQuery=e,t())}})),pn=T((e,t)=>({get:()=>(e(),on(()=>K().suggestions,[])),set:e=>{j()&&(K().suggestions=e,t())}})),mn=T((e,t)=>({get:()=>(e(),on(()=>K().searchFriendQuery,``)),set:e=>{j()&&(K().searchFriendQuery=e,t())}})),hn=f(``),gn=null;d(()=>mn.value,e=>{gn&&clearTimeout(gn),gn=setTimeout(()=>{hn.value=e},sn)},{immediate:!0});var _n=T((e,t)=>({get:()=>(e(),on(()=>K().activeFilter,`全部`)),set:e=>{j()&&(K().activeFilter=e,t())}})),vn=T((e,t)=>({get:()=>(e(),on(()=>K().expandedGroups,{})),set:e=>{j()&&(K().expandedGroups=e,t())}})),yn=e=>{K().runRecommendations(e)},bn=(e,t,n)=>K().getSharedInterest(e,t,n),xn=(e,t)=>K().getBuddiesForActivity(e,t),Sn=()=>{let e=fn.value.trim();if(e.length<1){pn.value=[];return}let t=[],n=V();for(let r of n.graph.keys())if(r.startsWith(`student:`)){let n=r.replace(`student:`,``);n.toLowerCase().includes(e.toLowerCase())&&t.push(n)}pn.value=t.slice(0,5)},Cn=e=>{fn.value=e,pn.value=[],mn.value=``,gn&&clearTimeout(gn),hn.value=``,X.value=e,_n.value=`全部`,vn.value={},yn(e)},wn=()=>{fn.value=``,X.value=null,mn.value=``,gn&&clearTimeout(gn),hn.value=``,pn.value=[],_n.value=`全部`,vn.value={},K().clearRecommendations()},Tn=O(()=>{if(!X.value)return[`全部`];let e=J(`student`,X.value),t=V();return[`全部`,...Array.from(t.graph.get(e)??[]).filter(e=>e.startsWith(`interest:`)).map(e=>e.replace(`interest:`,``)).sort()]}),En=O(()=>{let e={};if(!X.value)return e;let t=V(),n=J(`student`,X.value),r=Array.from(t.graph.get(n)??[]).filter(e=>e.startsWith(`interest:`));for(let n of Y.value.activities){let i=J(`activity`,n),a=new Set(Array.from(t.graph.get(i)??[]).filter(e=>e.startsWith(`interest:`))),o=r.find(e=>a.has(e)),s=o?o.replace(`interest:`,``):``;(_n.value===`全部`||s===_n.value)&&(e[s]||(e[s]=[]),e[s].push(n))}return e}),Dn=O(()=>Y.value.activities.length>0);O(()=>{let e=hn.value.trim().toLowerCase();if(!e||!X.value)return[];let t=V(),n=J(`student`,X.value),r=new Set(Array.from(t.graph.get(n)??[]).filter(e=>e.startsWith(`interest:`))),i=[];for(let n of t.studentsList){let a=n.slice(8);if(a===X.value||!a.toLowerCase().includes(e))continue;let o=Array.from(t.graph.get(n)??[]).filter(e=>r.has(e)).map(e=>e.replace(`interest:`,``));i.push({name:a,sharedCount:o.length,sharedInterests:o})}return i.sort((e,t)=>t.sharedCount===e.sharedCount?e.name.localeCompare(t.name):t.sharedCount-e.sharedCount),i.slice(0,ln)});var On=null;d([()=>{try{let e=V();return[e.graph,e.privateStudents,e.socialStudents]}catch{return null}},()=>X.value],()=>{On&&clearTimeout(On),On=setTimeout(()=>{X.value&&yn(X.value),On=null},cn)});var Z=class e{static instance;topSocialStudents=f([]);bridgeStudents=f([]);isolatedCount=f(0);popularInterests=f([]);popularActivities=f([]);themeCommunities=f([]);connectivityRate=f(0);averagePathLength=f(0);clusteringCoefficient=f(0);networkDensity=f(0);unsubscribe=null;debounceTimer=null;constructor(){}initialize(){if(!this.unsubscribe)try{this.unsubscribe=V().registerOnStatsUpdate(()=>{this.recalculateGraphInsights()}),this.recalculateGraphInsights()}catch{}}destroy(){this.unsubscribe&&=(this.unsubscribe(),null),this.debounceTimer&&=(clearTimeout(this.debounceTimer),null)}static getInstance(){return e.instance||=new e,e.instance}recalculateGraphInsights(e=!1){this.debounceTimer&&=(clearTimeout(this.debounceTimer),null);try{if(U().currentUserRole!==`admin`)return}catch{}let t=()=>{try{let e=V(),t=e.graph,n=e.stats;this.topSocialStudents.value=we(t),this.bridgeStudents.value=Te(t),this.isolatedCount.value=Ee(t),this.connectivityRate.value=De(this.isolatedCount.value,n.studentsCount),this.averagePathLength.value=Ae(t),this.clusteringCoefficient.value=je(t),this.networkDensity.value=Me(t,n.studentsCount,n.interestsCount,n.activitiesCount);let r=[];for(let[e,n]of t.entries())if(e.startsWith(`interest:`)){let t=e.slice(9),i=0;for(let e of n)e.startsWith(`student:`)&&i++;r.push({name:t,count:i})}this.popularInterests.value=r.sort((e,t)=>t.count-e.count),this.popularActivities.value=Oe(t),this.themeCommunities.value=ke(t)}catch(e){let t=e?.message||``;t.includes(`Active Pinia`)||t.includes(`pinia`)?console.warn(`[GraphAnalyticsService] Recalculate skipped: Pinia is not active (expected during unmount or tests).`):console.error(`[GraphAnalyticsService] Recalculate failed with unexpected error:`,e)}finally{this.debounceTimer=null}};e?t():this.debounceTimer=setTimeout(t,150)}}.getInstance();function Q(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function kn(e,t){let n=new Map,r=new Set,i=[];try{let e=V();n=e.graph,r=e.privateStudents,i=Z.bridgeStudents.value}catch{}let a=Array.from(n.keys()).filter(e=>e.startsWith(`student:`)).map(e=>({name:e.substring(8),degree:n.get(e)?.size||0})).sort((e,t)=>t.degree-e.degree),o=a.findIndex(t=>t.name===e)+1,s=n.get(`student:${e}`)?.size||0,c=a.length>0?((a.length-o)/a.length*100).toFixed(1):`0.0`,l=i.some(t=>t.name===e),u=i.find(t=>t.name===e)?.score||0,d=`普通社交参与者`,f=`🟡`,p=`该同学社交连接度一般，建议尝试参与更多跨主题活动，拓展本校社交圈。`;s===0?(d=`暂无网络连接 (可积极建连)`,f=`🚨`,p=`提示：该同学目前在校园社交网络中尚未与其他同学建立边连接。建议可以补充一些兴趣标签或报名一些热门的校园活动，以便系统更好地为其推荐校园搭子。`):o<=15?(d=`校园社交达人 (活跃核心)`,f=`👑`,p=`分析：该同学在校园网络中具有极高的社交连接度，属于非常活跃的社交核心。可以继续保持积极的活动参与度，带动和发起更多有趣的搭子活动。`):l?(d=`社群桥梁枢纽 (跨界联络人)`,f=`🌉`,p=`分析：该同学在不同兴趣社群和朋友圈子中起着纽带桥梁作用（社交桥梁指数: ${u}）。非常适合发起跨界活动，帮助更多不同领域的同学建立社交连接。`):s>=6&&(d=`活跃社交成员 (活动探索者)`,f=`🟢`,p=`分析：该同学积极参与多项校园活动，兴趣广泛且社交连接度良好。建议保持活跃，发掘更多志趣相投的校园搭子。`);let m=new Set,h=[`student:${e}`],g=0;for(m.add(`student:${e}`);g<h.length;){let e=h[g++];for(let t of n.get(e)??[])m.has(t)||(m.add(t),h.push(t))}let _=Array.from(m).filter(e=>e.startsWith(`student:`)).length,v=a.length,y=v>0?(_/v*100).toFixed(1):`0.0`,b=e=>t?`<strong>${e}</strong>`:`**${e}**`,x=``;x=_===1?`🚨 ${b(`社交孤立状态提示`)}：该同学当前暂未在校园社交网络中建立任何连接。建议可以通过添加个人兴趣标签或报名参与活动来开启第一步。`:Number(y)>=80?`✅ ${b(`社交圈连通度极佳`)}：该同学已融入全校的核心主社交网络，该网络覆盖了全校 ${_} 名同学（占比 ${b(y+`%`)}），在全局网络中具备非常广泛的社交潜在匹配空间。`:`⚠️ ${b(`处于局部社交圈`)}：该同学当前被包含在一个包含 ${_} 人（全校占比 ${b(y+`%`)}）的局部兴趣圈子中。如果希望结识更多不同领域的伙伴，可以尝试探索和报名其他跨学科/跨主题的活动。`;let S=a[0]?.name,C=``;if(S&&S!==e){let i=ge.findPath(n,e,S,r);C=i?i.path.map(e=>{let n=e.indexOf(`:`),r=e.substring(0,n),i=e.substring(n+1);return`${r===`student`?`👤`:r===`interest`?`🎯`:`🎉`}${t?Q(i):i}`}).join(` ➔ `):`❌ 无法建立联系：该同学与学校社交达人处于两个互不连通的独立社交分支中。`}else C=`👑 该同学本身即为全校社交活跃度最高的核心达人之一。`;return{studentsList:a,studentRank:o,studentDegree:s,studentPercentile:c,isBridge:l,bridgeScore:u,socialRole:d,socialRoleIcon:f,diagnosisNote:p,componentSize:_,totalStudents:v,compPct:y,communityDiagnosis:x,hubStudent:S,hubPathStr:C,graph:n,privateStudents:r}}function An(e,t){return e.length>0?e.map(e=>`<span class="tag tag-primary">${Q(e)}</span>`).join(``):`<p class="empty-state">${t}</p>`}function jn(e,t,n,r){if(t.length===0)return`<p class="empty-state">${r}</p>`;let i=``;return t.forEach((t,r)=>{let a=n(e,t,`activity`),o=Q(e),s=Q(t),c=Q(a),l=`student:${o} --(🎯${c})--&gt; activity:${s}`;i+=`
      <div class="activity-item">
        <div class="activity-name">${r+1}. ${s}</div>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">所属兴趣圈: 🎯 <strong>${c}</strong></div>
        <div class="activity-path">推荐纽带: ${l}</div>
      </div>
    `}),i}function Mn(e,t){if(e.length===0)return`<p class="empty-state">${t}</p>`;let n=``;return e.forEach((e,t)=>{let r=`${(e.jaccard*100).toFixed(1)}%`,i=e.sharedInterests.map(e=>Q(e)).join(`、`);n+=`
      <tr>
        <td>#${t+1}</td>
        <td><strong>${Q(e.name)}</strong></td>
        <td><span class="badge-percent">${r}</span></td>
        <td>${i}</td>
      </tr>
    `}),`
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>推荐搭子</th>
          <th>匹配契合度</th>
          <th>共同兴趣</th>
        </tr>
      </thead>
      <tbody>
        ${n}
      </tbody>
    </table>
  `}function Nn(e,t,n,r,i){let a=[];if(a.push(`# 🧭 Campus Buddy 个性化校园推荐报告 — ${e}`),a.push(`\n> **报告生成时间**: ${new Date().toLocaleDateString(`zh-CN`)}`),a.push(`
---
`),a.push(`## 👤 个人画像与标签`),t.length>0){a.push(`您目前在系统登记的兴趣倾向：
`);for(let e of t)a.push(`* **${e}** (兴趣等级: \`已设定\`)`)}else a.push(`您目前尚未登记 any 兴趣。`);if(a.push(`
---
`),a.push(`## 🎉 智能活动推荐`),n.length>0){a.push(`系统根据您的兴趣，为您推荐了以下尚未报名的活动：
`);for(let t=0;t<n.length;t++){let r=n[t],o=i(e,r,`activity`),s=`student:${e} --(🎯${o})--> activity:${r}`;a.push(`### ${t+1}. ${r}`),a.push(`* **所属兴趣圈**: 🎯 \`${o}\``),a.push(`* **推荐纽带**:`),a.push(`  \`${s}\`\n`)}}else a.push(`暂时没有基于您的兴趣推荐的活动。您可以尝试在侧边栏添加更多兴趣标签！`);if(a.push(`
---
`),a.push(`## 🤝 志同道合的活动搭子`),r.length>0){a.push(`系统为您匹配了拥有共同兴趣圈子的同学：
`),a.push(`| 排名 | 推荐搭子 | 匹配契合度 | 共同的兴趣 |`),a.push(`| --- | --- | --- | --- |`);for(let e=0;e<r.length;e++){let t=r[e],n=`${(t.jaccard*100).toFixed(1)}%`,i=t.sharedInterests.join(`、`);a.push(`| #${e+1} | **${t.name}** | ${n} | ${i} |`)}}else a.push(`暂时没有找到与您拥有共同兴趣的学生。`);return a.push(`
---
`),a.push(`
*快叫上新匹配的搭子，一起报名参加推荐的活动吧！*`),a.join(`
`)}function Pn(e,t,n,r,i){let a=An(t,`您目前尚未登记 any 兴趣。`),o=jn(e,n,i,`暂时没有基于您的兴趣推荐的活动。`),s=Mn(r,`暂时没有找到与您拥有共同兴趣的学生。`),c=t.slice(0,4),l=[{id:`student:${e}`,label:e,type:`student`,x:350,y:200,size:9,color:`#f43f5e`}],u=[];c.forEach((t,n)=>{let r=n*Math.PI*2/Math.max(c.length,1),i=350+Math.cos(r)*95,a=200+Math.sin(r)*95;l.push({id:`interest:${t}`,label:t,type:`interest`,x:i,y:a,size:6.5,color:`#22d3ee`}),u.push({source:`student:${e}`,target:`interest:${t}`})});let d=[];return n.slice(0,3).forEach(t=>{let n=i(e,t,`activity`);d.push({name:t,type:`activity`,interest:n,color:`#c084fc`})}),r.slice(0,4).forEach(e=>{let t=e.sharedInterests[0]||``;d.push({name:e.name,type:`buddy`,interest:t,color:`#10b981`})}),d.forEach((t,n)=>{let r=(n+.5)*Math.PI*2/Math.max(d.length,1),i=350+Math.cos(r)*170,a=200+Math.sin(r)*170;l.push({id:`${t.type}:${t.name}`,label:t.name,type:t.type,x:i,y:a,size:5.5,color:t.color}),t.interest?u.push({source:`interest:${t.interest}`,target:`${t.type}:${t.name}`}):u.push({source:`student:${e}`,target:`${t.type}:${t.name}`})}),`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Campus Buddy 个性化校园推荐报告 — ${Q(e)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: rgba(30, 41, 59, 0.45);
      --text-color: #f1f5f9;
      --primary-color: #22d3ee;
      --accent-color: #c084fc;
      --border-color: rgba(6, 182, 212, 0.25);
    }
    body {
      font-family: "Outfit", "Inter", "Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: linear-gradient(135deg, #090d16 0%, #0d121f 100%);
      color: var(--text-color);
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      width: 100%;
    }
    .header {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid var(--border-color);
      color: white;
      padding: 30px 40px;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.08);
      margin-bottom: 24px;
      position: relative;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--primary-color);
      text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
    }
    .header p {
      margin: 0;
      color: #94a3b8;
      font-size: 13px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 18px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(8px);
    }
    .card h2 {
      margin-top: 0;
      font-size: 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tag {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .tag-primary {
      background-color: rgba(6, 182, 212, 0.08);
      border-color: rgba(6, 182, 212, 0.25);
      color: var(--primary-color);
      box-shadow: 0 0 8px rgba(6, 182, 212, 0.05);
    }
    .activity-item {
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-name {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 4px;
    }
    .activity-path {
      background-color: rgba(0, 0, 0, 0.2);
      border-left: 3px solid var(--primary-color);
      padding: 10px;
      font-family: Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #94a3b8;
      border-radius: 6px;
      margin-top: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      text-align: left;
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    th {
      background-color: rgba(0, 0, 0, 0.15);
      font-weight: 600;
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      font-size: 14px;
    }
    .badge-percent {
      background-color: rgba(52, 199, 89, 0.1);
      color: #34c759;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
    }
    .empty-state {
      color: #8e8e93;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }
    .graph-hint {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧭 Campus Buddy 匹配推荐报告</h1>
      <p>报告学生: <strong>${Q(e)}</strong> &nbsp;|&nbsp; 生成时间: ${new Date().toLocaleDateString(`zh-CN`)}</p>
    </div>
    
    <div class="card">
      <h2>👤 个人画像与登记兴趣</h2>
      <div>${a}</div>
    </div>
 
    <!-- Interactive Canvas Graph Box -->
    <div class="card">
      <h2>📡 我的校园社交圈 (互动图谱)</h2>
      <div class="graph-container" style="display: flex; flex-direction: column; align-items: center;">
        <canvas id="interactive-canvas" width="1400" height="800" style="width: 700px; height: 400px; background: rgba(0,0,0,0.15); border-radius: 12px; border: 1px solid var(--border-color);"></canvas>
        <div class="graph-hint">💡 提示：将鼠标悬停在节点上，可以高亮显示并查看兴趣、搭子与活动关联的匹配细节。</div>
      </div>
    </div>
 
    <div class="card">
      <h2>🎉 智能活动推荐</h2>
      <div>${o}</div>
    </div>
 
    <div class="card">
      <h2>🤝 志同道合的活动搭子</h2>
      <div>${s}</div>
    </div>
  </div>
 
  <script>
    (function() {
      const nodes = ${JSON.stringify(l)};
      const links = ${JSON.stringify(u)};
      
      const canvas = document.getElementById('interactive-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      let hoveredNode = null;

      const isPrintMode = document.body.classList.contains('print-mode');
      if (isPrintMode) {
        nodes.forEach(node => {
          if (node.type === 'student') node.color = '#e11d48';
          else if (node.type === 'interest') node.color = '#0284c7';
          else if (node.type === 'activity') node.color = '#7c3aed';
          else if (node.type === 'buddy') node.color = '#059669';
        });
      }
 
      function drawRoundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
      }
 
      function draw() {
        ctx.clearRect(0, 0, 700, 400);
 
        // Draw connections
        links.forEach(link => {
          const sourceNode = nodes.find(n => n.id === link.source);
          const targetNode = nodes.find(n => n.id === link.target);
          if (!sourceNode || !targetNode) return;
 
          const isHighlighted = hoveredNode && 
            (hoveredNode.id === link.source || hoveredNode.id === link.target);
 
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          
          if (isHighlighted) {
            ctx.strokeStyle = isPrintMode ? '#0284c7' : '#22d3ee';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = isPrintMode ? 'transparent' : '#22d3ee';
            ctx.shadowBlur = isPrintMode ? 0 : 8;
          } else {
            ctx.strokeStyle = isPrintMode ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1.2;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
 
        // Draw nodes
        nodes.forEach(node => {
          const isHovered = hoveredNode && hoveredNode.id === node.id;
          const size = isHovered ? node.size + 3.5 : node.size;
 
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          if (isHovered && !isPrintMode) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 12;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
 
          // Label text styling
          ctx.font = isPrintMode 
            ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' 
            : (isHovered ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' : '10px "Outfit", "Inter", "Fira Sans", sans-serif');
          ctx.textAlign = 'center';

          // Label text vertical offset
          const textY = node.y - size - 8;

          if (!isPrintMode) {
            const textWidth = ctx.measureText(node.label).width;
            ctx.fillStyle = isHovered ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = isHovered ? node.color : 'rgba(6, 182, 212, 0.15)';
            ctx.lineWidth = 1;
            drawRoundRect(ctx, node.x - textWidth / 2 - 6, textY - 11, textWidth + 12, 16, 4);
            ctx.fill();
            ctx.stroke();
          }

          // Label text fill
          ctx.fillStyle = isPrintMode ? '#334155' : (isHovered ? '#ffffff' : '#cbd5e1');
          ctx.fillText(node.label, node.x, textY);
        });
 
        // Tooltip
        if (hoveredNode && !isPrintMode) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = hoveredNode.color;
          ctx.lineWidth = 1.5;
          drawRoundRect(ctx, 15, 15, 180, 55, 8);
          ctx.fill();
          ctx.stroke();
 
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(hoveredNode.label, 25, 33);
 
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px "Outfit", "Inter", "Fira Sans", sans-serif';
          const typeLabel = hoveredNode.type === 'student' ? '个人姓名' : 
                            (hoveredNode.type === 'interest' ? '兴趣标签' : 
                            (hoveredNode.type === 'activity' ? '推荐活动' : '匹配同学'));
          ctx.fillText('类型: ' + typeLabel, 25, 48);
        }
      }
 
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (700 / rect.width);
        const my = (e.clientY - rect.top) * (400 / rect.height);
 
        let found = null;
        for (const node of nodes) {
          const dx = node.x - mx;
          const dy = node.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < node.size + 6) {
            found = node;
            break;
          }
        }
 
        if (found !== hoveredNode) {
          hoveredNode = found;
          draw();
        }
      });
 
      draw();
    })();
  <\/script>
</body>
</html>
  `}function Fn(e,t,n,r,i){let a=kn(e,!1),o=[];if(o.push(`# 📊 Campus Buddy 社交匹配与社交圈分析报告 — ${e}`),o.push(`\n> **报告生成时间**: ${new Date().toLocaleDateString(`zh-CN`)} | **管理权限**: 全局管理员`),o.push(`
---
`),o.push(`## 🧭 一、校园社交定位与中心度分析`),o.push(`* **网络定位**: ${a.socialRoleIcon} **${a.socialRole}**`),o.push(`* **直连度数 (Degree)**: \`${a.studentDegree}\``),o.push(`* **全校排名**: 第 **${a.studentRank}** 名 (超越全校 \`${a.studentPercentile}%\` 的学生)`),o.push(`* **社群连通覆盖率**: \`${a.compPct}%\` (共 ${a.componentSize} 名学生与该生连通)`),o.push(`\n**分析建议**：\n> ${a.diagnosisNote}`),o.push(`\n**连通状态**：\n> ${a.communityDiagnosis}`),o.push(`
---
`),o.push(`## 🔗 二、与校园核心社交达人的连接路径`),o.push(`与学校最活跃核心达人 (**${a.hubStudent}**) 的最短路径：\n`),o.push(`\`${a.hubPathStr}\``),o.push(`
*注：该路径基于 BFS 最短路径算法生成，已自动屏蔽途中开启了隐私模式的同学节点。*`),o.push(`
---
`),o.push(`## 👤 三、登记的兴趣与个人标签`),t.length>0)for(let e of t)o.push(`* **${e}**`);else o.push(`该同学目前在系统内尚未登记任何兴趣倾向。`);if(o.push(`
---
`),o.push(`## 🎉 四、定向智能活动推荐`),n.length>0)for(let t=0;t<n.length;t++){let r=n[t],a=i(e,r,`activity`),s=`student:${e} --(🎯${a})--> activity:${r}`;o.push(`### ${t+1}. ${r}`),o.push(`* **匹配兴趣**: 🎯 \`${a}\``),o.push(`* **匹配路径**: \`${s}\``)}else o.push(`暂无活动推荐。`);if(o.push(`
---
`),o.push(`## 🤝 五、推荐的同行匹配搭子`),r.length>0){o.push(`| 排名 | 推荐搭子 | 匹配契合度 | 共同兴趣 |`),o.push(`| --- | --- | --- | --- |`);for(let e=0;e<r.length;e++){let t=r[e],n=`${(t.jaccard*100).toFixed(1)}%`,i=t.sharedInterests.join(`、`);o.push(`| #${e+1} | **${t.name}** | ${n} | ${i} |`)}}else o.push(`暂无匹配的同伴。`);return o.join(`
`)}function In(e,t,n,r,i){let a=kn(e,!0),o=An(t,`目前尚未登记任何兴趣倾向。`),s=jn(e,n,i,`暂时没有基于该生兴趣推荐的活动。`),c=Mn(r,`暂时没有找到具有共同兴趣的搭子。`),l=t.slice(0,4),u=[{id:`student:${e}`,label:e,type:`student`,x:350,y:200,size:9,color:`#f43f5e`}],d=[];l.forEach((t,n)=>{let r=n*Math.PI*2/Math.max(l.length,1),i=350+Math.cos(r)*95,a=200+Math.sin(r)*95;u.push({id:`interest:${t}`,label:t,type:`interest`,x:i,y:a,size:6.5,color:`#22d3ee`}),d.push({source:`student:${e}`,target:`interest:${t}`})});let f=[];return n.slice(0,3).forEach(t=>{let n=i(e,t,`activity`);f.push({name:t,type:`activity`,interest:n,color:`#c084fc`})}),r.slice(0,4).forEach(e=>{let t=e.sharedInterests[0]||``;f.push({name:e.name,type:`buddy`,interest:t,color:`#10b981`})}),f.forEach((t,n)=>{let r=(n+.5)*Math.PI*2/Math.max(f.length,1),i=350+Math.cos(r)*170,a=200+Math.sin(r)*170;u.push({id:`${t.type}:${t.name}`,label:t.name,type:t.type,x:i,y:a,size:5.5,color:t.color}),t.interest?d.push({source:`interest:${t.interest}`,target:`${t.type}:${t.name}`}):d.push({source:`student:${e}`,target:`${t.type}:${t.name}`})}),`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Campus Buddy 社交匹配与社交圈分析报告 — ${Q(e)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: rgba(30, 41, 59, 0.45);
      --text-color: #f1f5f9;
      --primary-color: #ffb74d;
      --accent-color: #c084fc;
      --border-color: rgba(245, 158, 11, 0.25);
    }
    body {
      font-family: "Outfit", "Inter", "Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: linear-gradient(135deg, #090d16 0%, #0d121f 100%);
      color: var(--text-color);
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      width: 100%;
    }
    .header {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid var(--border-color);
      color: white;
      padding: 30px 40px;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.08);
      margin-bottom: 24px;
      position: relative;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--primary-color);
      text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
    }
    .header p {
      margin: 0;
      color: #94a3b8;
      font-size: 13px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 18px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(8px);
    }
    .card h2 {
      margin-top: 0;
      font-size: 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tag {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .tag-primary {
      background-color: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.25);
      color: var(--primary-color);
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.05);
    }
    .activity-item {
      padding: 16px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-name {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 4px;
    }
    .activity-path {
      background-color: rgba(0, 0, 0, 0.2);
      border-left: 3px solid var(--primary-color);
      padding: 10px;
      font-family: Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #94a3b8;
      border-radius: 6px;
      margin-top: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      text-align: left;
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    th {
      background-color: rgba(0, 0, 0, 0.15);
      font-weight: 600;
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      font-size: 14px;
    }
    .badge-percent {
      background-color: rgba(52, 199, 89, 0.1);
      color: #34c759;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
    }
    .empty-state {
      color: #8e8e93;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }
    .graph-hint {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 10px;
      text-align: center;
    }
    .diag-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .diag-item-cell {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .diag-item-cell strong {
      color: #94a3b8;
      font-size: 13px;
    }
    .diag-item-cell span {
      font-weight: 600;
      font-size: 13px;
    }
    .diag-card {
      border-color: #ffb74d !important;
      background: rgba(255, 183, 77, 0.04) !important;
    }
    .diag-card h2 {
      color: #ffb74d !important;
      border-color: rgba(255, 183, 77, 0.15) !important;
    }
    .diag-note-box, .diag-status-box {
      margin-top: 12px;
      padding: 12px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 13px;
      line-height: 1.5;
      color: #cbd5e1;
    }
    .diag-note-box {
      margin-top: 18px;
    }
    .path-container {
      padding: 12px;
      background: rgba(0,0,0,0.25);
      border-left: 3px solid #ffb74d;
      border-radius: 6px;
      font-size: 13px;
      color: #e2e8f0;
      font-family: monospace;
      overflow-x: auto;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Campus Buddy 社交匹配与社交圈分析报告</h1>
      <p>报告学生: <strong>${Q(e)}</strong> &nbsp;|&nbsp; 生成时间: ${new Date().toLocaleDateString(`zh-CN`)} &nbsp;|&nbsp; 级别: 全局管理员</p>
    </div>

    <!-- Diagnostic Panel -->
    <div class="card diag-card">
      <h2>🧭 校园社交定位与分析指标</h2>
      <div class="diag-grid">
        <div class="diag-item-cell">
          <strong>网络位置定位</strong>
          <span style="color: #ffb74d;">${a.socialRoleIcon} ${Q(a.socialRole)}</span>
        </div>
        <div class="diag-item-cell">
          <strong>直连度数 (Degree)</strong>
          <span class="badge-percent" style="background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.2); font-size: 13px; padding: 2px 6px;">${a.studentDegree}</span>
        </div>
        <div class="diag-item-cell">
          <strong>全校度数排名</strong>
          <span>第 ${a.studentRank} 名 (超越全校 ${a.studentPercentile}% 的学生)</span>
        </div>
        <div class="diag-item-cell">
          <strong>社群连通覆盖率</strong>
          <span>${a.compPct}% (共 ${a.componentSize} 人)</span>
        </div>
      </div>
      <div class="diag-note-box">
        <strong>分析建议：</strong>${a.diagnosisNote}
      </div>
      <div class="diag-status-box">
        <strong>连通状态：</strong>${a.communityDiagnosis}
      </div>
    </div>

    <!-- Relationship Path to Hub -->
    <div class="card">
      <h2>🔗 与全校核心社交人物的关联路径</h2>
      <div class="path-container">
        ${a.hubPathStr}
      </div>
      <p style="font-size: 11px; color: #64748b; margin-top: 6px; margin-bottom: 0;">* 注：路径通过广度优先搜索 (BFS) 遍历，已自动避开途中开启了隐私保护模式的同学节点。</p>
    </div>
    
    <div class="card">
      <h2>👤 登记兴趣</h2>
      <div>${o}</div>
    </div>
 
    <!-- Interactive Canvas Graph Box -->
    <div class="card">
      <h2>📡 局部社交网络图谱 (互动)</h2>
      <div class="graph-container" style="display: flex; flex-direction: column; align-items: center;">
        <canvas id="interactive-canvas" width="1400" height="800" style="width: 700px; height: 400px; background: rgba(0,0,0,0.15); border-radius: 12px; border: 1px solid var(--border-color);"></canvas>
        <div class="graph-hint">💡 提示：将鼠标悬停在节点上，可以高亮显示并查看兴趣、搭子与活动关联的匹配细节。</div>
      </div>
    </div>
  
    <div class="card">
      <h2>🎉 智能活动推荐</h2>
      <div>${s}</div>
    </div>
 
    <div class="card">
      <h2>🤝 志同道合的活动搭子</h2>
      <div>${c}</div>
    </div>
  </div>
 
  <script>
    (function() {
      const nodes = ${JSON.stringify(u)};
      const links = ${JSON.stringify(d)};
      
      const canvas = document.getElementById('interactive-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      let hoveredNode = null;
 
      const isPrintMode = document.body.classList.contains('print-mode');
      if (isPrintMode) {
        nodes.forEach(node => {
          if (node.type === 'student') node.color = '#e11d48';
          else if (node.type === 'interest') node.color = '#0284c7';
          else if (node.type === 'activity') node.color = '#7c3aed';
          else if (node.type === 'buddy') node.color = '#059669';
        });
      }
 
      function drawRoundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
      }
 
      function draw() {
        ctx.clearRect(0, 0, 700, 400);
 
        // Draw connections
        links.forEach(link => {
          const sourceNode = nodes.find(n => n.id === link.source);
          const targetNode = nodes.find(n => n.id === link.target);
          if (!sourceNode || !targetNode) return;
 
          const isHighlighted = hoveredNode && 
            (hoveredNode.id === link.source || hoveredNode.id === link.target);
 
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          
          if (isHighlighted) {
            ctx.strokeStyle = isPrintMode ? '#0284c7' : '#ffb74d';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = isPrintMode ? 'transparent' : '#ffb74d';
            ctx.shadowBlur = isPrintMode ? 0 : 8;
          } else {
            ctx.strokeStyle = isPrintMode ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1.2;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
 
        // Draw nodes
        nodes.forEach(node => {
          const isHovered = hoveredNode && hoveredNode.id === node.id;
          const size = isHovered ? node.size + 3.5 : node.size;
 
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          if (isHovered && !isPrintMode) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 12;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
 
          // Label text styling
          ctx.font = isPrintMode 
            ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' 
            : (isHovered ? 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif' : '10px "Outfit", "Inter", "Fira Sans", sans-serif');
          ctx.textAlign = 'center';
 
          // Label text vertical offset
          const textY = node.y - size - 8;
 
          if (!isPrintMode) {
            const textWidth = ctx.measureText(node.label).width;
            ctx.fillStyle = isHovered ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = isHovered ? node.color : 'rgba(6, 182, 212, 0.15)';
            ctx.lineWidth = 1;
            drawRoundRect(ctx, node.x - textWidth / 2 - 6, textY - 11, textWidth + 12, 16, 4);
            ctx.fill();
            ctx.stroke();
          }
 
          // Label text fill
          ctx.fillStyle = isPrintMode ? '#334155' : (isHovered ? '#ffffff' : '#cbd5e1');
          ctx.fillText(node.label, node.x, textY);
        });
 
        // Tooltip
        if (hoveredNode && !isPrintMode) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = hoveredNode.color;
          ctx.lineWidth = 1.5;
          drawRoundRect(ctx, 15, 15, 180, 55, 8);
          ctx.fill();
          ctx.stroke();
 
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "Outfit", "Inter", "Fira Sans", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(hoveredNode.label, 25, 33);
 
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px "Outfit", "Inter", "Fira Sans", sans-serif';
          const typeLabel = hoveredNode.type === 'student' ? '个人姓名' : 
                            (hoveredNode.type === 'interest' ? '兴趣标签' : 
                            (hoveredNode.type === 'activity' ? '推荐活动' : '匹配同学'));
          ctx.fillText('类型: ' + typeLabel, 25, 48);
        }
      }
 
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (700 / rect.width);
        const my = (e.clientY - rect.top) * (400 / rect.height);
 
        let found = null;
        for (const node of nodes) {
          const dx = node.x - mx;
          const dy = node.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < node.size + 6) {
            found = node;
            break;
          }
        }
 
        if (found !== hoveredNode) {
          hoveredNode = found;
          draw();
        }
      });
 
      draw();
    })();
  <\/script>
</body>
</html>
  `}var Ln=(e,t,n,r,i,a)=>{e.beginPath(),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.quadraticCurveTo(t+r,n,t+r,n+a),e.lineTo(t+r,n+i-a),e.quadraticCurveTo(t+r,n+i,t+r-a,n+i),e.lineTo(t+a,n+i),e.quadraticCurveTo(t,n+i,t,n+i-a),e.lineTo(t,n+a),e.quadraticCurveTo(t,n,t+a,n),e.closePath()};function Rn(e,t,n,r,i,a,o){let s=document.createElement(`canvas`);s.width=3600,s.height=5400;let c=s.getContext(`2d`);if(!c)return;c.scale(3,3),c.imageSmoothingEnabled=!0,c.imageSmoothingQuality=`high`;let l=i,u=`#a855f7`;if(o){let t=new Map,n=[];try{t=V().graph,n=Z.bridgeStudents.value}catch{}let r=Array.from(t.keys()).filter(e=>e.startsWith(`student:`)).map(e=>({name:e.substring(8),degree:t.get(e)?.size||0})).sort((e,t)=>t.degree-e.degree).findIndex(t=>t.name===e)+1,i=t.get(`student:${e}`)?.size||0,a=n.some(t=>t.name===e);i===0?(l=`🚨 社交孤立`,u=`#ef4444`):r<=15?(l=`👑 意见领袖`,u=`#ffb74d`):a?(l=`🌉 社交枢纽`,u=`#3b82f6`):i>=6?(l=`积极探索`,u=`#10b981`):(l=`参与学生`,u=`#6b7280`)}let d=c.createLinearGradient(0,0,0,1800);d.addColorStop(0,`#090d16`),d.addColorStop(.3,`#0b1120`),d.addColorStop(.8,`#1e1b4b`),d.addColorStop(1,`#080710`),c.fillStyle=d,c.fillRect(0,0,1200,1800),c.strokeStyle=`rgba(6, 182, 212, 0.04)`,c.lineWidth=1;for(let e=0;e<1200;e+=60)c.beginPath(),c.moveTo(e,0),c.lineTo(e,1800),c.stroke();for(let e=0;e<1800;e+=60)c.beginPath(),c.moveTo(0,e),c.lineTo(1200,e),c.stroke();let f=[];f.push({x:600,y:625,size:15,color:`#f43f5e`,label:`我: ${e}`});let p=t.slice(0,3);p.forEach((e,t)=>{let n=t*Math.PI*2/Math.max(p.length,1);f.push({x:600+Math.cos(n)*120,y:625+Math.sin(n)*120,size:10,color:`#06b6d4`,label:e})});let m=r.slice(0,3);m.forEach((e,t)=>{let n=(t+.5)*Math.PI*2/Math.max(m.length,1);f.push({x:600+Math.cos(n)*210,y:625+Math.sin(n)*210,size:8.5,color:`#10b981`,label:e.name})});for(let e=0;e<40;e++)f.push({x:150+Math.random()*900,y:405+Math.random()*440,size:2+Math.random()*2.5,color:Math.random()>.55?`rgba(34, 211, 238, 0.25)`:`rgba(168, 85, 247, 0.25)`});c.lineWidth=1.5;for(let e=0;e<f.length;e++)for(let t=e+1;t<f.length;t++){let n=f[e].x-f[t].x,r=f[e].y-f[t].y,i=Math.sqrt(n*n+r*r);i<200&&(c.strokeStyle=`rgba(34, 211, 238, ${(1-i/200)*.16})`,c.beginPath(),c.moveTo(f[e].x,f[e].y),c.lineTo(f[t].x,f[t].y),c.stroke())}c.fillStyle=`rgba(15, 23, 42, 0.3)`,c.strokeStyle=`rgba(6, 182, 212, 0.2)`,c.lineWidth=2,Ln(c,120,375,960,500,18),c.fill(),c.stroke(),f.forEach(e=>{if(c.shadowColor=e.color,c.shadowBlur=e.size*2,c.fillStyle=e.color,c.beginPath(),c.arc(e.x,e.y,e.size,0,Math.PI*2),c.fill(),c.shadowBlur=0,e.label){c.font=`bold 14px "Outfit", "Inter", "Fira Sans", sans-serif`,c.textAlign=`center`;let t=e.y-e.size-12,n=c.measureText(e.label).width;c.fillStyle=`rgba(15, 23, 42, 0.85)`,c.strokeStyle=`rgba(6, 182, 212, 0.3)`,c.lineWidth=1,Ln(c,e.x-n/2-8,t-14,n+16,20,6),c.fill(),c.stroke(),c.fillStyle=`#cbd5e1`,c.fillText(e.label,e.x,t)}}),c.textAlign=`left`,c.fillStyle=`#64748b`,c.font=`14px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`💡 该图谱基于您的兴趣和报名情况计算生成，展示您的直接兴趣圈及搭子关联关系`,150,840),c.textAlign=`center`,c.fillStyle=o?`#ffb74d`:`#22d3ee`,c.font=`bold 32px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(o?`📊 CAMPUS ANALYSIS`:`🧭 CAMPUS BUDDY`,600,100),c.fillStyle=`#94a3b8`,c.font=`16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(o?`— 校园社交定位与社交圈图谱 —`:`— 校园智能活动与社交匹配网络图谱 —`,600,140),c.fillStyle=`rgba(255, 255, 255, 0.02)`,c.strokeStyle=o?`rgba(255, 183, 77, 0.25)`:`rgba(6, 182, 212, 0.25)`,c.lineWidth=1,Ln(c,120,180,960,110,18),c.fill(),c.stroke(),c.textAlign=`left`,c.textBaseline=`middle`,c.fillStyle=`#ffb74d`,c.font=`bold 30px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(e,160,235),c.fillStyle=u;let h=c.measureText(e).width;Ln(c,160+h+20,217,120,36,18),c.fill(),c.fillStyle=`#ffffff`,c.font=`bold 16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.textAlign=`center`,c.fillText(l,160+h+20+60,235),c.textAlign=`right`,c.fillStyle=`#64748b`,c.font=`16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`匹配报告生成时间: ${new Date().toLocaleDateString(`zh-CN`)}`,1040,235),c.textBaseline=`alphabetic`,c.textAlign=`left`,c.fillStyle=`#f8fafc`,c.font=`bold 22px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`📡 我的校园社交关系图谱`,120,350),[{value:t.length.toString(),label:`登记兴趣倾向`},{value:n.length.toString(),label:`推荐校园活动`},{value:r.length.toString(),label:`智能匹配搭子`}].forEach((e,t)=>{let n=120+t*335;c.fillStyle=`rgba(255, 255, 255, 0.015)`,c.strokeStyle=`rgba(255, 255, 255, 0.06)`,Ln(c,n,910,290,95,14),c.fill(),c.stroke(),c.textAlign=`center`,c.fillStyle=`#22d3ee`,c.font=`bold 32px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(e.value,n+290/2,954),c.fillStyle=`#94a3b8`,c.font=`16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(e.label,n+290/2,984)}),c.textAlign=`left`,c.fillStyle=`#f8fafc`,c.font=`bold 22px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`🎯 智能活动推荐`,120,1055),c.fillStyle=`rgba(255, 255, 255, 0.015)`,c.strokeStyle=`rgba(6, 182, 212, 0.18)`,Ln(c,120,1080,960,260,18),c.fill(),c.stroke(),n.length>0?n.slice(0,2).forEach((t,n)=>{let r=1110+n*110,i=`student:${e} --(🎯${a(e,t,`activity`)})--> activity:${t}`;c.fillStyle=`rgba(34, 211, 238, 0.08)`,c.beginPath(),c.arc(165,r+25,22,0,Math.PI*2),c.fill(),c.textAlign=`center`,c.textBaseline=`middle`,c.fillStyle=`#22d3ee`,c.font=`bold 18px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText((n+1).toString(),165,r+25),c.textBaseline=`alphabetic`,c.textAlign=`left`,c.fillStyle=`#f1f5f9`,c.font=`bold 20px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(t,210,r+20),c.fillStyle=`#94a3b8`,c.font=`15px "Fira Code", Menlo, Monaco, Consolas, monospace`,c.fillText(i,210,r+48)}):(c.textAlign=`center`,c.fillStyle=`#64748b`,c.font=`16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`您目前尚未登记兴趣，去侧边栏添加兴趣来获取匹配吧！`,600,1210)),c.textAlign=`left`,c.fillStyle=`#f8fafc`,c.font=`bold 22px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`🤝 志同道合的活动搭子匹配`,120,1385),c.fillStyle=`rgba(255, 255, 255, 0.015)`,c.strokeStyle=`rgba(16, 185, 129, 0.18)`,Ln(c,120,1410,960,290,18),c.fill(),c.stroke(),r.length>0?r.slice(0,3).forEach((e,t)=>{let n=1435+t*85;c.textAlign=`left`,c.fillStyle=`#10b981`,c.font=`bold 20px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`#${t+1}`,160,n+32),c.fillStyle=`#f1f5f9`,c.font=`bold 20px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(e.name,220,n+32);let r=`${(e.jaccard*100).toFixed(0)}%`;c.fillStyle=`rgba(255, 255, 255, 0.04)`,Ln(c,330,n+14,220,18,9),c.fill(),c.fillStyle=`#10b981`,Ln(c,330,n+14,Math.max(18,220*e.jaccard),18,9),c.fill(),c.fillStyle=`#e2e8f0`,c.font=`bold 16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(r,575,n+28),c.fillStyle=`#64748b`,c.font=`16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`共同兴趣: `+e.sharedInterests.slice(0,3).join(`, `),650,n+28)}):(c.textAlign=`center`,c.fillStyle=`#64748b`,c.font=`16px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`暂时没有找到匹配的搭子，完善您的兴趣圈子试试吧！`,600,1555)),c.textAlign=`center`,c.fillStyle=`#475569`,c.font=`14px "Outfit", "Inter", "Fira Sans", sans-serif`,c.fillText(`CAMPUS BUDDY · 智能校园活动与社交关系图谱`,600,1740),c.fillText(`帮助你在校园里结识志同道合的朋友`,600,1765);let g=document.createElement(`a`);g.download=`${e}_${o?`校园社交分析海报`:`校园活动搭子匹配海报`}.png`,g.href=s.toDataURL(`image/png`),document.body.appendChild(g),g.click(),document.body.removeChild(g)}var zn={class:`export-modal-card`},Bn={class:`export-modal-header`},Vn={class:`export-header-glow`},Hn={class:`export-options-list`},Un={class:`export-option-info`},Wn={class:`export-option-desc`},Gn={class:`export-option-info`},Kn={class:`export-option-desc`},qn={class:`export-option-info`},Jn={class:`export-option-desc`},Yn={class:`export-option-info`},Xn={class:`export-option-desc`},Zn=e(m({__name:`ExportModal`,props:{visible:{type:Boolean},isAdminMode:{type:Boolean},studentName:{}},emits:[`close`],setup(e,{emit:t}){let n=e,r=t,i=f(null),o=()=>{r(`close`)},s=()=>n.studentName||W.value||``,c=()=>{if(n.isAdminMode&&n.studentName){let e=`student:${n.studentName}`;try{let t=V();return Array.from(t.graph.get(e)??[]).filter(e=>e.startsWith(`interest:`)).map(e=>e.replace(`interest:`,``))}catch{return[]}}return Be.value},l=()=>n.isAdminMode&&n.studentName?Fe(c()):Re.value||`校园探索者`,u=(e,t,n)=>K().getSharedInterest(e,t,n),d=()=>{let e=s();if(!e)return``;let t=c(),r=Y.value.activities,i=Y.value.buddies.slice(0,10);return n.isAdminMode?Fn(e,t,r,i,u):Nn(e,t,r,i,u)},p=()=>{let e=s();if(!e)return``;let t=c(),r=Y.value.activities,i=Y.value.buddies.slice(0,10);return n.isAdminMode?In(e,t,r,i,u):Pn(e,t,r,i,u)},m=()=>{let e=d();if(!e)return;let t=new Blob([`﻿`+e],{type:`text/markdown;charset=utf-8;`}),r=URL.createObjectURL(t),i=document.createElement(`a`);i.href=r;let a=n.isAdminMode?`${s()}_社交匹配与社交圈分析报告.md`:`${s()}_校园活动搭子匹配推荐报告.md`;i.setAttribute(`download`,a),document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)},h=()=>{let e=p();if(!e)return;let t=new Blob([`﻿`+e],{type:`text/html;charset=utf-8;`}),r=URL.createObjectURL(t),i=document.createElement(`a`);i.href=r;let a=n.isAdminMode?`${s()}_社交匹配与社交圈分析报告.html`:`${s()}_校园活动搭子匹配推荐报告.html`;i.setAttribute(`download`,a),document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)},_=()=>{if(!s())return;let e=i.value;if(!e)return;let t=p(),r=`
    <style>
      @media print {
        body {
          font-family: 'Outfit', 'Inter', 'Fira Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif !important;
          background-color: #f8fafc !important;
          color: #0f172a !important;
          padding: 0 !important;
          margin: 15mm 15mm !important;
        }
        .container {
          box-shadow: none !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        .header {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-top: 4px solid ${n.isAdminMode?`#ffb74d`:`#0ea5e9`} !important;
          border-radius: 12px !important;
          padding: 24px 30px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          margin-bottom: 24px !important;
        }
        .header h1 {
          color: #0f172a !important;
          font-size: 22px !important;
          font-weight: 800 !important;
          margin-bottom: 6px !important;
          margin-top: 0 !important;
        }
        .header p {
          color: #64748b !important;
          font-size: 13px !important;
        }
        .card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 24px 30px !important;
          margin-bottom: 24px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          page-break-inside: avoid !important;
        }
        .card h2 {
          font-size: 15px !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          padding-bottom: 10px !important;
          margin-top: 0 !important;
          margin-bottom: 15px !important;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tag {
          border: 1px solid #e2e8f0 !important;
          background-color: #f1f5f9 !important;
          color: #334155 !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          display: inline-block !important;
          margin-right: 8px !important;
          margin-bottom: 8px !important;
        }
        .activity-item {
          padding: 12px 0 !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .activity-item:last-child {
          border-bottom: none !important;
        }
        .activity-name {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        .activity-path {
          background-color: #f8fafc !important;
          border-left: 3px solid #0ea5e9 !important;
          border-radius: 6px !important;
          color: #475569 !important;
          padding: 8px 12px !important;
          font-size: 11px !important;
          font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace !important;
          margin-top: 6px !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-top: 10px !important;
        }
        th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          border-bottom: 2px solid #cbd5e1 !important;
          padding: 10px 12px !important;
          font-size: 12px !important;
        }
        td {
          padding: 10px 12px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 13px !important;
          color: #334155 !important;
        }
        .badge-percent {
          background-color: #f0fdf4 !important;
          border: 1px solid #bbf7d0 !important;
          color: #16a34a !important;
          padding: 2px 8px !important;
          border-radius: 6px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
        }
        .graph-hint {
          display: none !important;
        }
        #interactive-canvas {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
        }
        .diag-card {
          border-color: #ffb74d !important;
          background-color: #fffbeb !important;
        }
        .diag-card h2 {
          color: #b45309 !important;
          border-bottom: 1px solid #fde68a !important;
        }
        .diag-item-cell {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 5px !important;
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 10px 0 !important;
        }
        .diag-item-cell strong {
          color: #4b5563 !important;
          font-size: 13px !important;
        }
        .diag-item-cell span {
          color: #111827 !important;
          font-size: 13px !important;
          font-weight: 600 !important;
        }
        .diag-note-box, .diag-status-box {
          background-color: #fffdf5 !important;
          border: 1px solid #fde68a !important;
          color: #1f2937 !important;
        }
        .path-container {
          background-color: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
          border-left: 4px solid #ffb74d !important;
          color: #1f2937 !important;
        }
      }
    </style>
  `,a=t.replace(`<body>`,`<body class="print-mode">`).replace(`</head>`,`${r}</head>`),o=e.contentDocument||e.contentWindow?.document;o&&(o.open(),o.write(a),o.close(),setTimeout(()=>{e.contentWindow?.focus(),e.contentWindow?.print()},250))},y=()=>{let e=s();if(!e)return;let t=c(),r=Y.value.activities;Rn(e,t,r,Y.value.buddies.slice(0,10),l(),u,n.isAdminMode)};return(t,n)=>e.visible?(a(),M(`div`,{key:0,class:`export-modal-overlay`,onClick:x(o,[`self`])},[C(`div`,zn,[C(`button`,{onClick:o,class:`close-export-btn`,title:`关闭`,"aria-label":`关闭`},[...n[0]||=[C(`svg`,{viewBox:`0 0 24 24`,width:`14`,height:`14`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`},[C(`line`,{x1:`18`,y1:`6`,x2:`6`,y2:`18`}),C(`line`,{x1:`6`,y1:`6`,x2:`18`,y2:`18`})],-1)]]),C(`div`,Bn,[C(`h3`,null,[C(`span`,Vn,F(e.isAdminMode?`📊`:`🧭`),1),v(` `+F(e.isAdminMode?`导出社交匹配与社交圈分析报告`:`导出个性化匹配与方向推荐报告`),1)]),C(`p`,null,F(e.isAdminMode?`包含全局网络中心度分析、社群归属占比、搭子推荐及连通分量指标分析`:`支持将您的专属画像、活动匹配路径、相似搭子及社区拓扑指标一键保存至本地`),1)]),C(`div`,Hn,[C(`div`,{class:`export-option-card opt-md`,onClick:m},[n[2]||=P(`<div class="export-icon-wrap" data-v-139975e3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-139975e3><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" data-v-139975e3></path><polyline points="14 2 14 8 20 8" data-v-139975e3></polyline><line x1="10" y1="9" x2="8" y2="11" data-v-139975e3></line><line x1="8" y1="11" x2="10" y2="13" data-v-139975e3></line><line x1="14" y1="9" x2="16" y2="11" data-v-139975e3></line><line x1="16" y1="11" x2="14" y2="13" data-v-139975e3></line><line x1="12" y1="9" x2="12" y2="15" data-v-139975e3></line></svg></div>`,1),C(`div`,Un,[n[1]||=C(`span`,{class:`export-option-title`},`Markdown 匹配报告 (.md)`,-1),C(`span`,Wn,F(e.isAdminMode?`包含该生网络中心度分析、连通社群归属以及隐私关系链路径`:`便于导入 Obsidian 或 Notion 知识库，轻量纯文本`),1)])]),C(`div`,{class:`export-option-card opt-html`,onClick:h},[n[4]||=P(`<div class="export-icon-wrap" data-v-139975e3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-139975e3><circle cx="12" cy="12" r="10" data-v-139975e3></circle><line x1="2" y1="12" x2="22" y2="12" data-v-139975e3></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" data-v-139975e3></path></svg></div>`,1),C(`div`,Gn,[n[3]||=C(`span`,{class:`export-option-title`},`离线 HTML 网页 (.html)`,-1),C(`span`,Kn,F(e.isAdminMode?`集成全局网络拓扑对比、介数中心度统计及交互图谱`:`包含苹果风卡片式排版与色彩设计，支持双击离线浏览`),1)])]),C(`div`,{class:`export-option-card opt-pdf`,onClick:_},[n[6]||=P(`<div class="export-icon-wrap" data-v-139975e3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-139975e3><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" data-v-139975e3></path><polyline points="14 2 14 8 20 8" data-v-139975e3></polyline><line x1="16" y1="13" x2="8" y2="13" data-v-139975e3></line><line x1="16" y1="17" x2="8" y2="17" data-v-139975e3></line><polyline points="10 9 9 9 8 9" data-v-139975e3></polyline></svg></div>`,1),C(`div`,qn,[n[5]||=C(`span`,{class:`export-option-title`},`个性化 PDF 报告 (.pdf)`,-1),C(`span`,Jn,F(e.isAdminMode?`高对比度双栏排版，集成社交圈定位与搭子推荐分析`:`高对比度分页排版，自动调起浏览器打印，完美输出为PDF文件`),1)])]),C(`div`,{class:`export-option-card opt-png`,onClick:y},[n[8]||=P(`<div class="export-icon-wrap" data-v-139975e3><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-139975e3><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03457 19.176 5.12257 19.264 5.16315 19.373C5.20373 19.482 5.19502 19.5992 5.17761 19.8337L5.07447 21.2185C5.03666 21.7251 5.48512 22.1242 5.98687 22.0468L7.49132 21.8148C7.68367 21.7852 7.77984 21.7704 7.87157 21.7951C7.9633 21.8197 8.04169 21.8812 8.19846 22.0042C9.35122 22.909 10.793 23.4357 12.3333 23.4357" data-v-139975e3></path><circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" data-v-139975e3></circle><circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" data-v-139975e3></circle><circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" data-v-139975e3></circle><circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" data-v-139975e3></circle></svg></div>`,1),C(`div`,Yn,[n[7]||=C(`span`,{class:`export-option-title`},`个性化分享海报 (.png)`,-1),C(`span`,Xn,F(e.isAdminMode?`生成高对比度分析海报，包含社交定位及关键路径分析`:`生成极具科技感的立体点云匹配海报，适合朋友圈及群分享`),1)])])]),C(`iframe`,{ref_key:`printIframeRef`,ref:i,class:`hidden-print-iframe`},null,512)])])):g(``,!0)}}),[[`__scopeId`,`data-v-139975e3`]]),Qn={class:`profile-top-row`},$n={class:`profile-avatar-wrap`},er={class:`profile-avatar-big`},tr={key:1,class:`icon-svg`,viewBox:`0 0 24 24`,width:`20`,height:`20`,fill:`none`,"stroke-linecap":`round`,"stroke-linejoin":`round`},nr={key:0,class:`avatar-private-overlay`},rr={key:1,class:`avatar-social-overlay`},ir={class:`profile-identity`},ar={class:`identity-row`},or={class:`profile-name`},sr={key:0,class:`mode-toggle-row`},cr=[`title`],lr={class:`mode-icon`},ur={key:0,class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},dr={key:1,class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},fr={class:`mode-label`},pr=[`title`],mr={class:`mode-icon`},hr={key:0,class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`currentColor`,stroke:`currentColor`,"stroke-width":`1`},gr={key:1,class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},_r={class:`mode-label`},vr={key:1,class:`admin-access-badge`},yr={key:2,class:`privacy-status-bar`},br={key:3,class:`social-status-bar`},xr={key:4,class:`export-report-row`},Sr=e(m({__name:`SidebarProfile`,emits:[`logout`],setup(e,{emit:t}){let n=t,r=f(!1),i=()=>{$e()},o=()=>{tt()},l=async()=>{await Je(),n(`logout`)};return(e,t)=>(a(),M(`div`,{class:c([`profile-card`,{"admin-card-border":s(G)===`admin`}])},[C(`div`,Qn,[C(`div`,$n,[C(`span`,er,[s(Le)?(a(),M(A,{key:0},[v(F(s(Le)),1)],64)):(a(),M(`svg`,tr,[...t[2]||=[P(`<circle cx="12" cy="12" r="10" stroke="var(--accent-neon-cyan)" stroke-width="1.5" data-v-e5488588></circle><polygon points="12,12 16.24,7.76 14.12,14.12" fill="var(--accent-neon-pink)" stroke="var(--accent-neon-pink)" stroke-width="0.5" data-v-e5488588></polygon><polygon points="12,12 16.24,7.76 9.88,9.88" fill="#b30059" stroke="#b30059" stroke-width="0.5" data-v-e5488588></polygon><polygon points="12,12 7.76,16.24 9.88,9.88" fill="var(--accent-neon-cyan)" stroke="var(--accent-neon-cyan)" stroke-width="0.5" data-v-e5488588></polygon><polygon points="12,12 7.76,16.24 14.12,14.12" fill="#0099ab" stroke="#0099ab" stroke-width="0.5" data-v-e5488588></polygon><circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="none" data-v-e5488588></circle>`,6)]]))]),t[5]||=C(`div`,{class:`profile-avatar-ring`},null,-1),s(Qe)&&s(G)!==`admin`?(a(),M(`div`,nr,[...t[3]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`8`,height:`8`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`},[C(`rect`,{x:`3`,y:`11`,width:`18`,height:`11`,rx:`2`,ry:`2`}),C(`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`})],-1)]])):g(``,!0),s(et)&&s(G)!==`admin`?(a(),M(`div`,rr,[...t[4]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`8`,height:`8`,fill:`currentColor`,stroke:`currentColor`,"stroke-width":`1`},[C(`polygon`,{points:`12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2`})],-1)]])):g(``,!0)]),C(`div`,ir,[C(`div`,ar,[C(`div`,or,F(s(W)),1),C(`div`,{class:c([`profile-persona-badge`,s(Ve)])},F(s(Re)),3)])]),C(`button`,{onClick:l,class:`logout-btn`,title:`退出登录`},[...t[6]||=[C(`span`,{class:`logout-icon`},`⏻`,-1)]])]),s(G)===`admin`?(a(),M(`div`,vr,[...t[11]||=[C(`span`,{class:`pulse-dot`},null,-1),C(`span`,{class:`badge-text`},`Root Access · 全局管理员`,-1)]])):(a(),M(`div`,sr,[C(`button`,{class:c([`mode-btn`,s(Qe)?`mode-btn-active-private`:`mode-btn-inactive`]),onClick:i,title:s(Qe)?`隐身保护中，点击关闭`:`开启隐身模式（不被推荐给他人）`},[C(`span`,lr,[s(Qe)?(a(),M(`svg`,ur,[...t[7]||=[C(`rect`,{x:`3`,y:`11`,width:`18`,height:`11`,rx:`2`,ry:`2`},null,-1),C(`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`},null,-1)]])):(a(),M(`svg`,dr,[...t[8]||=[C(`rect`,{x:`3`,y:`11`,width:`18`,height:`11`,rx:`2`,ry:`2`},null,-1),C(`path`,{d:`M7 11V7a5 5 0 0 1 9.9-1`},null,-1)]]))]),C(`span`,fr,F(s(Qe)?`隐身中`:`隐身模式`),1)],10,cr),C(`button`,{class:c([`mode-btn`,s(et)?`mode-btn-active-social`:`mode-btn-inactive`]),onClick:o,title:s(et)?`达人模式开启中，点击关闭`:`开启达人模式（优先被推荐给有共同活动的同学）`},[C(`span`,mr,[s(et)?(a(),M(`svg`,hr,[...t[9]||=[C(`polygon`,{points:`12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2`},null,-1)]])):(a(),M(`svg`,gr,[...t[10]||=[C(`polygon`,{points:`12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2`},null,-1)]]))]),C(`span`,_r,F(s(et)?`达人中`:`达人模式`),1)],10,pr)])),s(Qe)&&s(G)!==`admin`?(a(),M(`div`,yr,[...t[12]||=[C(`span`,{class:`privacy-status-dot`},null,-1),C(`span`,null,`隐身保护中 · 您的社交关系已对他人隐藏`,-1)]])):g(``,!0),s(et)&&s(G)!==`admin`?(a(),M(`div`,br,[...t[13]||=[C(`span`,{class:`social-status-dot`},null,-1),C(`span`,null,`社交达人中 · 您将被优先推荐给有共同兴趣的同学`,-1)]])):g(``,!0),s(G)===`admin`?g(``,!0):(a(),M(`div`,xr,[C(`button`,{class:`export-report-btn`,onClick:t[0]||=e=>r.value=!0,title:`导出我的个性化匹配与方向推荐报告`},[...t[14]||=[C(`span`,{class:`export-icon`},`📥`,-1),C(`span`,{class:`export-label`},`导出我的个性化匹配报告`,-1)]])])),N(Zn,{visible:r.value,onClose:t[1]||=e=>r.value=!1},null,8,[`visible`])],2))}}),[[`__scopeId`,`data-v-e5488588`]]),Cr=k(`log`,()=>{let e=f([]),t=0;function n(n,r){let i={id:`log-${++t}`,timestamp:new Date().toLocaleTimeString(),type:n,message:r};e.value.unshift(i)}return{logs:e,addLog:n}}),wr=O(()=>Cr().logs),$=(e,t)=>{Cr().addLog(e,t)},Tr={class:`admin-controls-wrapper`},Er={class:`stats-grid-panel admin-global-panel`},Dr={class:`stats-grid-title`},Or={class:`icon-svg`,viewBox:`0 0 24 24`,width:`11`,height:`11`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},kr={class:`stats-grid-panel admin-individual-panel`},Ar={class:`stats-grid-title`},jr={class:`icon-svg`,viewBox:`0 0 24 24`,width:`11`,height:`11`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},Mr={class:`control-cards-grid`},Nr={class:`control-card search-card`,style:{"--control-color":`#3b82f6`}},Pr={class:`search-input-field`},Fr={key:0,class:`suggestions-dropdown card`},Ir=[`onMousedown`],Lr={class:`icon-svg`,viewBox:`0 0 24 24`,width:`10`,height:`10`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,opacity:`0.7`}},Rr={key:0,class:`selected-student-actions card glow-orange fade-in`},zr={class:`selected-student-header`},Br={class:`selected-icon`},Vr={class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{color:`var(--accent-orange)`}},Hr={class:`selected-info`},Ur={class:`selected-name`},Wr={class:`selected-buttons-row`},Gr={style:{display:`flex`,gap:`6px`}},Kr=e(m({__name:`SidebarAdminControl`,emits:[`logout`,`open-graph`,`create-activity`,`create-interest`],setup(e,{emit:t}){let r=f(!1),o=()=>{setTimeout(()=>{pn.value=[]},200)},c=t,u=()=>{c(`open-graph`,!1)},d=()=>{c(`create-activity`)},p=()=>{c(`create-interest`)},m=async()=>{confirm(`确认要重置系统数据吗？这将清除当前所有动态修改，并重新加载校园关系网络。`)&&(c(`logout`),await an(),$(`action`,`🔄 重置系统数据：成功重新生成了校园社交网络，包含 4 名需要关怀帮扶的同学`))};return(e,t)=>(a(),M(`div`,Tr,[C(`div`,Er,[C(`div`,Dr,[(a(),M(`svg`,Or,[...t[5]||=[C(`circle`,{cx:`12`,cy:`12`,r:`10`},null,-1),C(`line`,{x1:`2`,y1:`12`,x2:`22`,y2:`12`},null,-1),C(`path`,{d:`M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z`},null,-1)]])),t[6]||=v(` 全局网络与数据控制 `,-1)]),C(`div`,{class:`control-cards-grid`},[C(`div`,{onClick:d,class:`control-card action-card`,style:{"--control-color":`#34d399`}},[...t[7]||=[P(`<div class="control-card-content" data-v-37734b14><div class="control-card-header" data-v-37734b14><span class="control-icon" data-v-37734b14><svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" data-v-37734b14><line x1="12" y1="5" x2="12" y2="19" data-v-37734b14></line><line x1="5" y1="12" x2="19" y2="12" data-v-37734b14></line></svg></span><span class="control-label" data-v-37734b14>发布校园新活动</span></div><span class="action-hint" data-v-37734b14>创建新活动并设置相关兴趣圈标签</span></div><span class="action-arrow" data-v-37734b14>➔</span>`,2)]]),C(`div`,{onClick:p,class:`control-card action-card`,style:{"--control-color":`#06b6d4`}},[...t[8]||=[P(`<div class="control-card-content" data-v-37734b14><div class="control-card-header" data-v-37734b14><span class="control-icon" data-v-37734b14><svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" data-v-37734b14><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" data-v-37734b14></path><line x1="7" y1="7" x2="7.01" y2="7" data-v-37734b14></line></svg></span><span class="control-label" data-v-37734b14>发布新兴趣标签</span></div><span class="action-hint" data-v-37734b14>创建新兴趣并设置相关归属领域类别</span></div><span class="action-arrow" data-v-37734b14>➔</span>`,2)]]),C(`div`,{onClick:m,class:`control-card action-card`,style:{"--control-color":`#fd971f`}},[...t[9]||=[P(`<div class="control-card-content" data-v-37734b14><div class="control-card-header" data-v-37734b14><span class="control-icon" data-v-37734b14><svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" data-v-37734b14><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" data-v-37734b14></path></svg></span><span class="control-label" data-v-37734b14>重置系统数据</span></div><span class="action-hint" data-v-37734b14>重置为系统默认网络关系</span></div><span class="action-arrow" data-v-37734b14>➔</span>`,2)]])])]),C(`div`,kr,[C(`div`,Ar,[(a(),M(`svg`,jr,[...t[10]||=[C(`circle`,{cx:`12`,cy:`12`,r:`10`},null,-1),C(`path`,{d:`M12 8v4`},null,-1),C(`path`,{d:`M12 16h.01`},null,-1)]])),t[11]||=v(` 个人社交匹配与检索 `,-1)]),C(`div`,Mr,[C(`div`,Nr,[t[13]||=P(`<div class="control-card-header" data-v-37734b14><span class="control-icon" data-v-37734b14><svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" data-v-37734b14><circle cx="11" cy="11" r="8" data-v-37734b14></circle><line x1="21" y1="21" x2="16.65" y2="16.65" data-v-37734b14></line></svg></span><span class="control-label" data-v-37734b14>网络检索</span></div>`,1),C(`div`,Pr,[n(C(`input`,{"onUpdate:modelValue":t[0]||=e=>l(fn)?fn.value=e:null,onInput:t[1]||=(...e)=>s(Sn)&&s(Sn)(...e),onBlur:o,placeholder:`输入姓名检索个人社交画像...`,class:`sidebar-search-input`},null,544),[[D,s(fn)]]),s(pn).length?(a(),M(`div`,Fr,[(a(!0),M(A,null,i(s(pn),e=>(a(),M(`div`,{key:e,class:`sug-item`,onMousedown:t=>s(Cn)(e)},[(a(),M(`svg`,Lr,[...t[12]||=[C(`path`,{d:`M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2`},null,-1),C(`circle`,{cx:`12`,cy:`7`,r:`4`},null,-1)]])),v(` `+F(e),1)],40,Ir))),128))])):g(``,!0)])]),s(X)?(a(),M(`div`,Rr,[C(`div`,zr,[C(`span`,Br,[(a(),M(`svg`,Vr,[...t[14]||=[C(`path`,{d:`M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2`},null,-1),C(`circle`,{cx:`12`,cy:`7`,r:`4`},null,-1)]]))]),C(`div`,Hr,[t[15]||=C(`span`,{class:`selected-label`},`当前选中`,-1),C(`span`,Ur,F(s(X)),1)])]),C(`div`,Wr,[C(`div`,Gr,[C(`button`,{onClick:u,class:`btn btn-xs btn-secondary glow-cyan`,style:{display:`flex`,"align-items":`center`,gap:`4px`}},[...t[16]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`10`,height:`10`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[C(`polygon`,{points:`12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2`})],-1),v(` 查看拓扑图 `,-1)]]),C(`button`,{onClick:t[2]||=e=>r.value=!0,class:`btn btn-xs btn-primary glow-orange`,style:{display:`flex`,"align-items":`center`,gap:`4px`}},[...t[17]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`10`,height:`10`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[C(`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}),C(`polyline`,{points:`7 10 12 15 17 10`}),C(`line`,{x1:`12`,y1:`15`,x2:`12`,y2:`3`})],-1),v(` 导出分析报告 `,-1)]])]),C(`button`,{onClick:t[3]||=(...e)=>s(wn)&&s(wn)(...e),class:`btn-text btn-xs`},`清除`)])])):g(``,!0)])]),N(Zn,{visible:r.value,isAdminMode:!0,studentName:s(X)||``,onClose:t[4]||=e=>r.value=!1},null,8,[`visible`,`studentName`])]))}}),[[`__scopeId`,`data-v-37734b14`]]),qr={class:`stats-grid-panel`},Jr={class:`stats-grid-title`},Yr={class:`icon-svg`,viewBox:`0 0 24 24`,width:`11`,height:`11`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},Xr={class:`stats-grid`},Zr={class:`stat-card`,style:{"--stat-color":`#ffb74d`}},Qr={class:`stat-card-val`,style:{color:`#ffb74d`}},$r={class:`stat-card`,style:{"--stat-color":`#22d3ee`}},ei={class:`stat-card-val`,style:{color:`#22d3ee`}},ti={class:`stat-card`,style:{"--stat-color":`#a78bfa`}},ni={class:`stat-card-val`,style:{color:`#a78bfa`}},ri={class:`stat-card`,style:{"--stat-color":`#34d399`}},ii={class:`stat-card-val`,style:{color:`#34d399`}},ai=e(m({__name:`SidebarStats`,setup(e){return(e,t)=>(a(),M(`div`,qr,[C(`div`,Jr,[(a(),M(`svg`,Yr,[...t[0]||=[C(`circle`,{cx:`12`,cy:`12`,r:`10`},null,-1),C(`line`,{x1:`2`,y1:`12`,x2:`22`,y2:`12`},null,-1),C(`path`,{d:`M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z`},null,-1)]])),t[1]||=v(` 图谱规模 `,-1)]),C(`div`,Xr,[C(`div`,Zr,[t[2]||=P(`<div class="stat-card-label" data-v-c4078a28><svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" data-v-c4078a28><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" data-v-c4078a28></path><circle cx="9" cy="7" r="4" data-v-c4078a28></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87" data-v-c4078a28></path><path d="M16 3.13a4 4 0 0 1 0 7.75" data-v-c4078a28></path></svg> 学生节点 </div>`,1),C(`div`,Qr,F(s(tn).studentsCount),1)]),C(`div`,$r,[t[3]||=C(`div`,{class:`stat-card-label`},[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`10`,height:`10`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[C(`path`,{d:`M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z`}),C(`line`,{x1:`7`,y1:`7`,x2:`7.01`,y2:`7`})]),v(` 兴趣类型 `)],-1),C(`div`,ei,F(s(tn).interestsCount),1)]),C(`div`,ti,[t[4]||=P(`<div class="stat-card-label" data-v-c4078a28><svg class="icon-svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" data-v-c4078a28><rect x="3" y="4" width="18" height="18" rx="2" ry="2" data-v-c4078a28></rect><line x1="16" y1="2" x2="16" y2="6" data-v-c4078a28></line><line x1="8" y1="2" x2="8" y2="6" data-v-c4078a28></line><line x1="3" y1="10" x2="21" y2="10" data-v-c4078a28></line></svg> 活动数量 </div>`,1),C(`div`,ni,F(s(tn).activitiesCount),1)]),C(`div`,ri,[t[5]||=C(`div`,{class:`stat-card-label`},[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`10`,height:`10`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[C(`path`,{d:`M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71`}),C(`path`,{d:`M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71`})]),v(` 连通社区 `)],-1),C(`div`,ii,F(s(tn).componentsCount),1)])])]))}}),[[`__scopeId`,`data-v-c4078a28`]]),oi={class:`activities-timeline-panel`},si={class:`timeline-title`},ci={class:`icon-svg`,viewBox:`0 0 24 24`,width:`11`,height:`11`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},li={key:0,class:`timeline-list`},ui={class:`timeline-act-name`},di=[`onClick`],fi={key:1,class:`timeline-empty`},pi={class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,style:{"margin-right":`4px`,"vertical-align":`-1px`,opacity:`0.5`}},mi=e(m({__name:`SidebarTimeline`,setup(e){let t=e=>{Xe(e),$(`action`,`【取消报名】学生【${W.value}】在侧边栏取消报名了活动【${e}】`),$(`info`,`推荐系统重算：已从侧边栏移除【${W.value}】在社交图谱中的报名连线，关联推荐权重更新中...`)};return(e,n)=>(a(),M(`div`,oi,[C(`div`,si,[(a(),M(`svg`,ci,[...n[0]||=[C(`circle`,{cx:`12`,cy:`12`,r:`10`},null,-1),C(`circle`,{cx:`12`,cy:`12`,r:`6`},null,-1),C(`circle`,{cx:`12`,cy:`12`,r:`2`},null,-1)]])),n[1]||=v(` 已报名校园活动 `,-1)]),s(ze).length?(a(),M(`div`,li,[(a(!0),M(A,null,i(s(ze),(e,n)=>(a(),M(`div`,{key:e,class:`timeline-item`},[C(`div`,{class:`timeline-dot`,style:p({animationDelay:n*.08+`s`})},null,4),C(`span`,ui,F(e),1),C(`button`,{onClick:n=>t(e),class:`timeline-cancel-btn`,title:`取消报名此活动`},` 取消 `,8,di)]))),128))])):(a(),M(`div`,fi,[(a(),M(`svg`,pi,[...n[2]||=[C(`rect`,{x:`3`,y:`4`,width:`18`,height:`18`,rx:`2`,ry:`2`},null,-1),C(`line`,{x1:`16`,y1:`2`,x2:`16`,y2:`6`},null,-1),C(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`6`},null,-1),C(`line`,{x1:`3`,y1:`10`,x2:`21`,y2:`10`},null,-1)]])),n[3]||=v(` 还没有报名任何活动 `,-1)]))]))}}),[[`__scopeId`,`data-v-4870de3a`]]),hi={class:`sidebar-interests-panel`},gi={class:`panel-title`},_i={class:`icon-svg`,viewBox:`0 0 24 24`,width:`11`,height:`11`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},vi={key:0,class:`profile-interests-strip`},yi={key:1,class:`interests-empty`},bi=e(m({__name:`SidebarInterests`,setup(e){let t=e=>z.sports.includes(e)?`tag-sports`:z.arts.includes(e)?`tag-arts`:z.tech.includes(e)?`tag-tech`:`tag-social`;return(e,n)=>(a(),M(`div`,hi,[C(`div`,gi,[(a(),M(`svg`,_i,[...n[0]||=[C(`path`,{d:`M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z`},null,-1),C(`line`,{x1:`7`,y1:`7`,x2:`7.01`,y2:`7`},null,-1)]])),n[1]||=v(` 我的兴趣标签 `,-1)]),s(Be).length?(a(),M(`div`,vi,[(a(!0),M(A,null,i(s(Be),e=>(a(),M(`span`,{key:e,class:c([`profile-interest-chip`,t(e)])},`# `+F(e),3))),128))])):(a(),M(`div`,yi,`暂无兴趣标签`))]))}}),[[`__scopeId`,`data-v-cba991fe`]]),xi={class:`sidebar-icebreaker-panel`},Si={class:`panel-title`},Ci={class:`icon-svg`,viewBox:`0 0 24 24`,width:`11`,height:`11`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},wi={class:`tip-content`,style:{display:`flex`,"align-items":`flex-start`,gap:`6px`}},Ti={class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`var(--accent-orange)`,"stroke-width":`2`,style:{"margin-top":`2px`}},Ei={style:{flex:`1`}},Di={class:`highlight-buddy`},Oi={class:`highlight-interest`},ki=e(m({__name:`SidebarIcebreaker`,setup(e){let t=O(()=>{let e=Y.value.buddies;if(e&&e.length>0){let t=e.find(e=>e.sharedInterests&&e.sharedInterests.length>0);if(t)return{hasBuddy:!0,buddyName:t.name,interest:t.sharedInterests[0],text:``}}return{hasBuddy:!1,text:`建议多去【智能推荐活动】一键报名心仪活动，偶遇更多契合的活动搭子！`}});return(e,n)=>(a(),M(`div`,xi,[C(`div`,Si,[(a(),M(`svg`,Ci,[...n[0]||=[C(`path`,{d:`M9 18h6`},null,-1),C(`path`,{d:`M10 22h4`},null,-1),C(`path`,{d:`M15.09 14c.18-.33.3-.68.37-1.04A5 5 0 0 0 16 9a5 5 0 0 0-10 0 5 5 0 0 0 .54 2.96c.07.36.19.7.37 1.04l1.59 2h7l1.59-2z`},null,-1)]])),n[1]||=v(` 社交破冰小贴士 `,-1)]),C(`div`,wi,[(a(),M(`svg`,Ti,[...n[2]||=[C(`path`,{d:`M9 18h6`},null,-1),C(`path`,{d:`M10 22h4`},null,-1),C(`path`,{d:`M15.09 14c.18-.33.3-.68.37-1.04A5 5 0 0 0 16 9a5 5 0 0 0-10 0 5 5 0 0 0 .54 2.96c.07.36.19.7.37 1.04l1.59 2h7l1.59-2z`},null,-1)]])),C(`div`,Ei,[t.value.hasBuddy?(a(),M(A,{key:0},[n[3]||=v(` 建议与 `,-1),C(`span`,Di,F(t.value.buddyName),1),n[4]||=v(` 交流 `,-1),C(`span`,Oi,`# `+F(t.value.interest),1),n[5]||=v(` 话题，你们有共同的兴趣契合点！ `,-1)],64)):(a(),M(A,{key:1},[v(F(t.value.text),1)],64))])])]))}}),[[`__scopeId`,`data-v-8b78930b`]]),Ai={href:`https://github.com/bestxby/Campus-Buddy`,target:`_blank`,rel:`noopener`,class:`sidebar-logo-banner`,title:`访问 GitHub 项目仓库`},ji={key:0,class:`admin-dashboard-title-badge`},Mi=e(m({__name:`AppSidebar`,props:{width:{}},emits:[`logout`,`open-graph`,`create-activity`,`create-interest`],setup(e,{emit:t}){let n=e,r=t;return(e,t)=>(a(),M(`aside`,{class:`sidebar`,style:p({width:n.width+`px`})},[C(`a`,Ai,[t[6]||=P(`<div class="logo-main-group" data-v-3107e250><div class="sidebar-logo-icon" data-v-3107e250><svg class="icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-linecap="round" stroke-linejoin="round" data-v-3107e250><circle cx="12" cy="12" r="10" stroke="var(--accent-neon-cyan)" stroke-width="1.5" data-v-3107e250></circle><polygon points="12,12 16.24,7.76 14.12,14.12" fill="var(--accent-neon-pink)" stroke="var(--accent-neon-pink)" stroke-width="0.5" data-v-3107e250></polygon><polygon points="12,12 16.24,7.76 9.88,9.88" fill="#b30059" stroke="#b30059" stroke-width="0.5" data-v-3107e250></polygon><polygon points="12,12 7.76,16.24 9.88,9.88" fill="var(--accent-neon-cyan)" stroke="var(--accent-neon-cyan)" stroke-width="0.5" data-v-3107e250></polygon><polygon points="12,12 7.76,16.24 14.12,14.12" fill="#0099ab" stroke="#0099ab" stroke-width="0.5" data-v-3107e250></polygon><circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="none" data-v-3107e250></circle></svg></div><div class="sidebar-logo-text-wrap" data-v-3107e250><div class="sidebar-logo-title" data-v-3107e250>Campus Buddy</div><div class="sidebar-logo-sub" data-v-3107e250>校园社交智能推荐系统</div></div></div>`,1),s(G)===`admin`?(a(),M(`div`,ji,[...t[5]||=[C(`span`,{class:`pulse-dot`},null,-1),C(`span`,null,`管理端`,-1)]])):g(``,!0)]),N(Sr,{onLogout:t[0]||=e=>r(`logout`)}),s(G)===`admin`?(a(),S(ai,{key:0})):g(``,!0),s(G)===`admin`?(a(),S(Kr,{key:1,onLogout:t[1]||=e=>r(`logout`),onOpenGraph:t[2]||=e=>r(`open-graph`,e),onCreateActivity:t[3]||=e=>r(`create-activity`),onCreateInterest:t[4]||=e=>r(`create-interest`)})):g(``,!0),s(G)===`admin`?g(``,!0):(a(),M(A,{key:2},[N(bi),N(ki),N(mi)],64)),t[7]||=P(`<a href="https://github.com/bestxby" target="_blank" rel="noopener" class="sidebar-footer" title="访问作者 GitHub 主页" data-v-3107e250><div class="footer-content" data-v-3107e250><div class="footer-icon-wrap" data-v-3107e250><svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true" data-v-3107e250><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" data-v-3107e250></path></svg></div><div class="footer-info" data-v-3107e250><div class="name-val" data-v-3107e250>bestxby</div><div class="author-sub" data-v-3107e250>GitHub 开发者主页 →</div></div></div></a>`,1)],4))}}),[[`__scopeId`,`data-v-3107e250`]]),Ni={class:`card result-card`},Pi={key:0,class:`interest-filters`},Fi=[`onClick`],Ii={key:1,class:`activities-scroll-area`},Li={class:`activities-grid`},Ri={class:`activity-card-header-row`},zi={class:`header-left`},Bi=[`title`],Vi={class:`activity-card-tags-right`},Hi={class:`network-flow-path`},Ui={class:`flow-step`},Wi={class:`flow-node node-student`,title:`您`},Gi=[`title`],Ki=[`title`],qi={class:`match-reason-line`},Ji={key:0,class:`buddy-signup-text`},Yi={key:0},Xi={key:1,class:`recommend-reason-text`},Zi={class:`activity-card-footer`},Qi={class:`activity-card-members`},$i={class:`members-text`},ea={class:`action-buttons`},ta=[`onClick`],na=[`onClick`],ra={key:2,class:`empty-msg`},ia=e(m({__name:`RecommendedActivities`,emits:[`signed-up`,`cancelled`],setup(e,{emit:t}){let n=t,r=e=>{Ye(e),$(`action`,`【学生报名】学生【${W.value}】成功报名了活动【${e}】`),$(`info`,`推荐系统重算：已更新【${W.value}】在社交图谱中的报名连线，关联推荐权重更新中...`),n(`signed-up`,e)},o=e=>{Xe(e),$(`action`,`【取消报名】学生【${W.value}】取消报名了活动【${e}】`),$(`info`,`推荐系统重算：已移除【${W.value}】在社交图谱中的报名连线，关联推荐权重更新中...`),n(`cancelled`,e)},l=O(()=>{let e=new Map;for(let t of V().allActivitiesList)e.set(t.name,{interests:t.interests,studentCount:t.studentCount});return e}),u=O(()=>{let e=[],t=En.value,n=new Set;for(let r in t){let i=t[r];for(let t of i){if(n.has(t))continue;n.add(t);let i=l.value.get(t)??{interests:[],studentCount:0},a=xn(X.value??``,t);e.push({name:t,matchingInterest:r,interests:i.interests,studentCount:i.studentCount,buddiesSigned:a})}}return e}),d=e=>z.sports.includes(e)?`tag-sports`:z.arts.includes(e)?`tag-arts`:z.tech.includes(e)?`tag-tech`:`tag-social`;return(e,t)=>(a(),M(`div`,Ni,[t[6]||=C(`div`,{class:`result-card-header`},[C(`h3`,null,`🎯 智能推荐活动`)],-1),s(Tn).length>1?(a(),M(`div`,Pi,[(a(!0),M(A,null,i(s(Tn),e=>(a(),M(`button`,{key:e,class:c([`filter-pill`,{"tab-active":s(_n)===e}]),onClick:t=>_n.value=e},F(e===`全部`?`🌟 全部推荐`:e),11,Fi))),128))])):g(``,!0),s(Dn)?(a(),M(`div`,Ii,[C(`div`,Li,[(a(!0),M(A,null,i(u.value,e=>(a(),M(`div`,{key:e.name,class:c([`activity-card-item`,{"card-signed":s(Ze)(e.name)}])},[C(`div`,Ri,[C(`div`,zi,[t[0]||=C(`span`,{class:`activity-card-icon`},`🎯`,-1),C(`h4`,{class:`activity-card-title`,title:e.name},F(e.name),9,Bi)]),C(`div`,Vi,[C(`span`,{class:c([`activity-tag-chip`,d(e.matchingInterest)])},`# `+F(e.matchingInterest),3)])]),C(`div`,Hi,[C(`div`,Ui,[C(`span`,Wi,F(s(X)),1),t[1]||=C(`span`,{class:`flow-arrow`},`➔`,-1),C(`span`,{class:`flow-node node-interest`,title:`匹配兴趣: ${e.matchingInterest}`},F(e.matchingInterest),9,Gi),t[2]||=C(`span`,{class:`flow-arrow`},`➔`,-1),C(`span`,{class:`flow-node node-activity`,title:`推荐活动: ${e.name}`},F(e.name),9,Ki)])]),C(`div`,qi,[e.buddiesSigned.length>0?(a(),M(`span`,Ji,[v(` 👥 `+F(e.buddiesSigned.slice(0,2).join(`、`)),1),e.buddiesSigned.length>2?(a(),M(`span`,Yi,`等`+F(e.buddiesSigned.length)+`人`,1)):g(``,!0),t[3]||=v(`也报名了 `,-1)])):(a(),M(`span`,Xi,` 💡 基于共同兴趣推荐 `))]),C(`div`,Zi,[C(`div`,Qi,[t[4]||=C(`span`,{class:`members-icon`},`👥`,-1),C(`span`,$i,F(e.studentCount)+` 人已报名`,1)]),C(`div`,ea,[s(Ze)(e.name)?(a(),M(A,{key:0},[t[5]||=C(`span`,{class:`signed-badge`},`✓ 已报名`,-1),s(X)===s(W)?(a(),M(`button`,{key:0,onClick:t=>o(e.name),class:`btn-action cancel-btn`,title:`取消报名此活动`},` 取消报名 `,8,ta)):g(``,!0)],64)):s(X)===s(W)?(a(),M(`button`,{key:1,onClick:t=>r(e.name),class:`btn-action signup-btn glow-cyan`},` 一键报名 `,8,na)):g(``,!0)])])],2))),128))])])):(a(),M(`p`,ra,`暂时没有匹配该兴趣推荐的校园活动。`))]))}}),[[`__scopeId`,`data-v-af73c8e8`]]),aa={class:`card result-card`},oa={class:`all-activities-container`},sa={class:`activity-search-wrapper`},ca={key:0,class:`activities-scroll-area`},la={class:`activities-grid`},ua={class:`activity-card-header-row`},da={class:`header-left`},fa=[`title`],pa={class:`activity-card-tags-right`},ma={class:`activity-card-footer`},ha={class:`activity-card-members`},ga={class:`members-text`},_a={class:`action-buttons`},va=[`onClick`],ya=[`onClick`],ba={key:1,class:`empty-msg`},xa=e(m({__name:`AllActivities`,emits:[`signed-up`,`cancelled`],setup(e,{emit:t}){let r=t,o=f(``),l=e=>{Ye(e),$(`action`,`【学生报名】学生【${W.value}】成功报名了活动【${e}】`),$(`info`,`推荐系统重算：已更新【${W.value}】在社交图谱中的报名连线，关联推荐权重更新中...`),r(`signed-up`,e)},u=e=>{Xe(e),$(`action`,`【取消报名】学生【${W.value}】取消报名了活动【${e}】`),$(`info`,`推荐系统重算：已移除【${W.value}】在社交图谱中的报名连线，关联推荐权重更新中...`),r(`cancelled`,e)},d=O(()=>[...V().allActivitiesList].sort((e,t)=>e.name.localeCompare(t.name))),p=O(()=>{let e=o.value.trim().toLowerCase();return e?d.value.filter(t=>{let n=t.name.toLowerCase().includes(e),r=t.interests.some(t=>t.toLowerCase().includes(e));return n||r}):d.value}),m=e=>z.sports.includes(e)?`tag-sports`:z.arts.includes(e)?`tag-arts`:z.tech.includes(e)?`tag-tech`:`tag-social`;return(e,t)=>(a(),M(`div`,aa,[t[4]||=C(`div`,{class:`result-card-header`},[C(`h3`,null,`🌐 全校所有活动`)],-1),C(`div`,oa,[C(`div`,sa,[n(C(`input`,{"onUpdate:modelValue":t[0]||=e=>o.value=e,placeholder:`🔍 搜索活动名称或关联兴趣标签...`,class:`activity-search-input`},null,512),[[D,o.value]])]),p.value.length>0?(a(),M(`div`,ca,[C(`div`,la,[(a(!0),M(A,null,i(p.value,e=>(a(),M(`div`,{key:e.name,class:c([`activity-card-item`,{"card-signed":s(Ze)(e.name)}])},[C(`div`,ua,[C(`div`,da,[t[1]||=C(`span`,{class:`activity-card-icon`},`🎉`,-1),C(`h4`,{class:`activity-card-title`,title:e.name},F(e.name),9,fa)]),C(`div`,pa,[(a(!0),M(A,null,i(e.interests,e=>(a(),M(`span`,{key:e,class:c([`activity-tag-chip`,m(e)])},`# `+F(e),3))),128))])]),C(`div`,ma,[C(`div`,ha,[t[2]||=C(`span`,{class:`members-icon`},`👥`,-1),C(`span`,ga,F(e.studentCount)+` 人已报名`,1)]),C(`div`,_a,[s(Ze)(e.name)?(a(),M(A,{key:0},[t[3]||=C(`span`,{class:`signed-badge`},`✓ 已报名`,-1),s(X)===s(W)?(a(),M(`button`,{key:0,onClick:t=>u(e.name),class:`btn-action cancel-btn`,title:`取消报名此活动`},` 取消 `,8,va)):g(``,!0)],64)):s(X)===s(W)?(a(),M(`button`,{key:1,onClick:t=>l(e.name),class:`btn-action signup-btn glow-orange`},` 一键报名 `,8,ya)):g(``,!0)])])],2))),128))])])):(a(),M(`p`,ba,`未找到符合搜索条件的校园活动。`))])]))}}),[[`__scopeId`,`data-v-083d0960`]]),Sa={class:`pathfinder-container`},Ca={class:`pathfinder-search-row`},wa={key:0,class:`path-sug-dropdown card`},Ta=[`onMousedown`],Ea={key:1,class:`pathfinder-result card glow-orange fade-in`},Da={class:`pathfinder-result-header`},Oa={class:`pathfinder-flow`},ka={key:0,class:`pathfinder-arrow`},Aa={key:2,class:`pathfinder-error`},ja=e(m({__name:`PathFinder`,emits:[`open-graph-highlight`],setup(e,{emit:t}){let r=t,o=f(``),l=f([]),u=f(!1),p=()=>{let e=o.value.trim();if(e.length<1){l.value=[];return}let t=[];for(let n of q.value.keys())if(n.startsWith(`student:`)){let r=n.slice(8);r!==X.value&&r.toLowerCase().includes(e.toLowerCase())&&t.push(r)}l.value=t.slice(0,5)},m=e=>{o.value=e,l.value=[],_()},h=()=>{setTimeout(()=>{l.value=[]},200)},_=()=>{l.value=[];let e=o.value.trim();if(!e||!X.value)return;let t=rn(X.value,e);t?(un.value=t,u.value=!1):(un.value=null,u.value=!0)},v=()=>{o.value=``,un.value=null,u.value=!1},y=()=>{r(`open-graph-highlight`)};return d(X,()=>{v()}),(e,t)=>(a(),M(`div`,Sa,[t[1]||=C(`h4`,null,`🔍 BFS 人脉社交通路寻人`,-1),C(`div`,Ca,[n(C(`input`,{"onUpdate:modelValue":t[0]||=e=>o.value=e,onInput:p,onKeyup:b(_,[`enter`]),onBlur:h,placeholder:`输入同学姓名，寻找最短相识通路...`,class:`pathfinder-input`},null,544),[[D,o.value]]),C(`button`,{onClick:_,class:`btn btn-xs btn-secondary glow-cyan`},`寻找连结`)]),l.value.length?(a(),M(`div`,wa,[(a(!0),M(A,null,i(l.value,e=>(a(),M(`div`,{key:e,class:`path-sug-item`,onMousedown:t=>m(e)},`👤 `+F(e),41,Ta))),128))])):g(``,!0),s(un)?(a(),M(`div`,Ea,[C(`div`,Da,[C(`span`,null,`✨ 最短 `+F(s(un).hops)+` 度人脉关联通路：`,1),C(`button`,{onClick:v,class:`path-clear-btn`,title:`清除通路`},`❌`)]),C(`div`,Oa,[(a(!0),M(A,null,i(s(un).readable,(e,t)=>(a(),M(A,{key:t},[C(`span`,{class:c([`pathfinder-node`,t%2==0?`node-person`:`node-link`])},F(t%2==0?`👤 `+e:`🎯 `+e),3),t<s(un).readable.length-1?(a(),M(`span`,ka,`➔`)):g(``,!0)],64))),128))]),C(`button`,{onClick:y,class:`btn btn-xs btn-primary glow-orange path-highlight-btn`},` 👁️ 在关系图谱中高亮显示 `)])):u.value?(a(),M(`div`,Aa,` ⚠️ 未找到社交连结通路（该同学处于另一个连通分量或名字不存在） `)):g(``,!0)]))}}),[[`__scopeId`,`data-v-57c15f3c`]]),Ma={class:`card result-card`},Na={key:1,class:`buddy-list`},Pa={class:`buddy-row`},Fa={class:`path-flow`},Ia=[`title`],La={key:0,class:`social-star`,title:`社交达人`},Ra=[`title`],za=[`title`],Ba={key:0,class:`social-star`,title:`社交达人`},Va=[`title`],Ha={class:`jaccard-count`},Ua={class:`jaccard-score`},Wa={key:2,class:`empty-msg`},Ga=e(m({__name:`BuddyList`,emits:[`open-graph-highlight`],setup(e,{emit:t}){let n=t,r=V(),o=e=>r.socialStudents.has(e),l=O(()=>G.value===`admin`?30:10);return(e,t)=>(a(),M(`div`,Ma,[t[4]||=C(`h3`,null,`🤝 兴趣契合的活动搭子`,-1),s(G)===`admin`?(a(),S(ja,{key:0,onOpenGraphHighlight:t[0]||=e=>n(`open-graph-highlight`)})):g(``,!0),s(Y).buddies.length?(a(),M(`ul`,Na,[(a(!0),M(A,null,i(s(Y).buddies.slice(0,l.value),e=>(a(),M(`li`,{key:e.name,class:c([`path-item`,{"social-buddy-item":o(e.name)}])},[C(`div`,Pa,[C(`div`,Fa,[C(`span`,{class:c([`node student`,{"social-buddy-node":o(s(X))}]),title:s(X)||``},[v(F(s(X))+` `,1),o(s(X))?(a(),M(`span`,La,`🌟`)):g(``,!0)],10,Ia),t[1]||=C(`span`,{class:`arrow`},`➔`,-1),C(`span`,{class:`node interest`,title:s(bn)(s(X),e.name,`student`)},F(s(bn)(s(X),e.name,`student`)),9,Ra),t[2]||=C(`span`,{class:`arrow`},`➔`,-1),C(`span`,{class:c([`node student`,{"social-buddy-node":o(e.name)}]),title:e.name},[v(F(e.name)+` `,1),o(e.name)?(a(),M(`span`,Ba,`🌟`)):g(``,!0)],10,za)]),C(`div`,{class:`jaccard-badge`,title:`Jaccard 相似度: ${(e.jaccard*100).toFixed(0)}%`},[t[3]||=C(`span`,{class:`jaccard-icon`},`🎯`,-1),C(`span`,Ha,F(e.sharedCount)+`个共同`,1),C(`span`,Ua,F((e.jaccard*100).toFixed(0))+`%`,1)],8,Va)])],2))),128))])):(a(),M(`p`,Wa,`暂时没有相同兴趣的搭子。`))]))}}),[[`__scopeId`,`data-v-2c7db6f0`]]),Ka=class{static build(e){let{activeStudent:t,pathResult:n,showGlobal:r,privateStudents:i}=e;if(r||!t)return{nodes:[],links:[]};let a=i??new Set,o=[],s=new Map,c=new Set,l=(e,t,n=`default`)=>{let r=e<t?`${e}->${t}`:`${t}->${e}`;s.has(r)||s.set(r,{source:e,target:t,type:n})},u=J(`student`,t);c.add(u),o.push({id:u,type:`student`,name:t});let d=this.getAllowedBuddies(t,e.recommendations,e.graph,e.buddyLimit);return this.addFocalNeighbors({config:e,focalNode:u,allowedBuddies:d,privateStudentsSet:a,addedNodes:c,nodesToDraw:o,addLink:l}),this.addBuddyActivityEdges(c,u,e.graph,l),n&&this.injectShortestPath(n,c,o,s),{nodes:o,links:Array.from(s.values())}}static getAllowedBuddies(e,t,n,r){let i=J(`student`,e),a=Array.from(n.get(i)??[]).filter(e=>e.startsWith(`interest:`)),o=t.buddies.map(e=>{let t=J(`student`,e.name),r=Array.from(n.get(t)??[]).filter(e=>e.startsWith(`interest:`));return{name:e.name,overlap:a.filter(e=>r.includes(e)).length}});return o.sort((e,t)=>t.overlap-e.overlap),new Set(o.slice(0,r).map(e=>e.name))}static addFocalNeighbors(e){let{config:t,focalNode:n,allowedBuddies:r,privateStudentsSet:i,addedNodes:a,nodesToDraw:o,addLink:s}=e,{graph:c,hideBuddies:l,hideActivities:u,recommendations:d,currentUser:f,currentUserRole:p}=t,m=c.get(n)??[];for(let e of m){if(e.startsWith(`activity:`)){if(u)continue;let t=e.replace(`activity:`,``);a.has(e)||(a.add(e),o.push({id:e,type:`activity`,name:t})),s(n,e,`registration-active`);continue}if(e.startsWith(`interest:`)){a.has(e)||(a.add(e),o.push({id:e,type:`interest`,name:e.replace(`interest:`,``)})),s(n,e);for(let t of c.get(e)??[]){let n=t.substring(t.indexOf(`:`)+1),c=t.startsWith(`student:`)&&!l&&r.has(n),m=t.startsWith(`activity:`)&&!u&&d.activities.includes(n);if(c||m){if(c&&i.has(n)&&n!==f&&p!==`admin`)continue;a.has(t)||(a.add(t),o.push({id:t,type:t.startsWith(`student:`)?`student`:`activity`,name:n})),s(e,t)}}}}}static addBuddyActivityEdges(e,t,n,r){for(let i of e)if(i.startsWith(`student:`)&&i!==t)for(let t of n.get(i)??[])t.startsWith(`activity:`)&&e.has(t)&&r(i,t,`registration`)}static injectShortestPath(e,t,n,r){let i=e.path;for(let e=0;e<i.length;e++){let a=i[e];if(!t.has(a)){t.add(a);let e=a.split(`:`);n.push({id:a,type:e[0],name:e.slice(1).join(`:`)})}if(e<i.length-1){let t=i[e+1],n=a<t?`${a}->${t}`:`${t}->${a}`,o=r.get(n);o?o.type=`shortest-path`:r.set(n,{source:a,target:t,type:`shortest-path`})}}}},qa=class{static getTooltipDetails(e,t,n,r){let i=e,a=J(`student`,t);if(i.type===`student`){if(i.name===t)return{title:`${i.name} (您)`,type:`student`,details:`当前推荐的起点中心节点。围绕着您的是您勾选的兴趣标签以及报名的校园活动。`};{let e=Array.from(r.get(a)??[]).filter(e=>e.startsWith(`interest:`)),t=Array.from(r.get(J(`student`,i.name))??[]).filter(e=>e.startsWith(`interest:`)),n=new Set(t),o=Array.from(r.get(a)??[]).filter(e=>e.startsWith(`activity:`)),s=new Set(Array.from(r.get(J(`student`,i.name))??[]).filter(e=>e.startsWith(`activity:`))),c=e.filter(e=>n.has(e)).map(e=>e.replace(`interest:`,``)),l=o.filter(e=>s.has(e)).map(e=>e.replace(`activity:`,``)),u=`【活动搭子】您与 ${i.name} 共同关注的兴趣：${c.join(`、`)||`暂无`}。`;return u+=l.length>0?` 你们都报名了相同的活动：${l.join(`、`)}。`:` 匹配度较高，不妨约他一起报名下方的推荐活动吧！`,{title:i.name,type:`student`,details:u}}}else if(i.type===`activity`){let e=Array.from(r.get(a)??[]).filter(e=>e.startsWith(`interest:`)),o=Array.from(r.get(J(`activity`,i.name))??[]).filter(e=>e.startsWith(`interest:`)),s=new Set(o),c=e.filter(e=>s.has(e)).map(e=>e.replace(`interest:`,``)),l=r.get(a)?.has(J(`activity`,i.name)),u=t===n,d=l?`【已报名活动】${u?`您`:t}已成功报名此活动，在图上以绿色虚线直接连接。`:u?`【活动推荐】基于您的兴趣「${c.join(`、`)}」向您匹配推荐。您尚未报名该活动，一键报名后可在图中建立绿色连接！`:`【活动推荐】基于该同学的兴趣「${c.join(`、`)}」向其匹配推荐。目前尚未报名该活动。`;return{title:i.name,type:`activity`,details:d}}else return{title:`🎯 兴趣圈：${i.name}`,type:`interest`,details:`连接您与匹配学生/活动的桥梁纽带节点。通过该兴趣标签进行社交推荐。`}}},Ja=class{static draw(e,t,n,r,i,a,o,s){e.save(),e.resetTransform(),e.clearRect(0,0,e.canvas.width,e.canvas.height),e.restore(),e.save(),e.translate(a.x,a.y),e.scale(a.k,a.k);let c=o?.activeStudent,l=c?J(`student`,c):null,u=o?.graph,d=o?.pathResult,f=!1,p=new Set;if(s){f=!0;let e=s.id;p.add(e);for(let t of i){let n=typeof t.source==`object`?t.source.id:t.source,r=typeof t.target==`object`?t.target.id:t.target;n===e?p.add(r):r===e&&p.add(n)}}let m=(e,t)=>{if(!d)return!1;let n=d.path;for(let r=0;r<n.length-1;r++)if(n[r]===e&&n[r+1]===t||n[r]===t&&n[r+1]===e)return!0;return!1},h=[],g=[],_=[],v=[],y=[];for(let e of i){let t=e.source,n=e.target;if(!t||!n||t.x===void 0||t.y===void 0||n.x===void 0||n.y===void 0)continue;let r=t.id,i=n.id;if(m(r,i))h.push(e);else if(e.type===`registration-active`)g.push(e);else if(e.type===`registration`)_.push(e);else{let r=t.type,i=n.type;r===`student`&&i===`activity`||r===`activity`&&i===`student`?v.push(e):y.push(e)}}let b=(t,n,r,i=[],a=1)=>{if(t.length!==0)if(f){let o=[],c=[],l=s.id;for(let e of t){let t=e.source,n=e.target;t.id===l||n.id===l?o.push(e):c.push(e)}if(c.length>0){e.beginPath(),e.strokeStyle=`rgba(${n}, ${a*.12})`,e.lineWidth=r,e.setLineDash(i);for(let t of c)e.moveTo(t.source.x,t.source.y),e.lineTo(t.target.x,t.target.y);e.stroke()}if(o.length>0){e.beginPath(),e.strokeStyle=`rgba(${n}, ${a})`,e.lineWidth=r,e.setLineDash(i);for(let t of o)e.moveTo(t.source.x,t.source.y),e.lineTo(t.target.x,t.target.y);e.stroke()}}else{e.beginPath(),e.strokeStyle=`rgba(${n}, ${a})`,e.lineWidth=r,e.setLineDash(i);for(let n of t)e.moveTo(n.source.x,n.source.y),e.lineTo(n.target.x,n.target.y);e.stroke()}};b(y,`255, 255, 255`,1.5,[],.08),b(v,`6, 182, 212`,1.5,[],.6),b(_,`253, 151, 31`,1.5,[3,3],.45),b(g,`74, 222, 128`,2.5,[4,4],.9),b(h,`250, 204, 21`,4,[],1),e.setLineDash([]);for(let t of r){if(t.x===void 0||t.y===void 0)continue;let n=1;f&&(n=p.has(t.id)?1:.15);let r=d&&d.path.includes(t.id),i=l&&t.id===l,a=i?22:t.type===`interest`?14:10,o=`#06b6d4`;i?o=`#ec4899`:t.type===`student`?o=`#fd971f`:t.type===`interest`?o=`#3b82f6`:t.type===`activity`&&c&&u?.get(J(`student`,c))?.has(t.id)&&(o=`#4ade80`);let m=`#0f172a`,h=2;r?(m=i?`#ec4899`:`#facc15`,h=3.5):i?(m=`#facc15`,h=3.5):c&&t.type===`activity`&&u?.get(J(`student`,c))?.has(t.id)&&(m=`#22c55e`),e.beginPath(),e.arc(t.x,t.y,a,0,2*Math.PI);let g=s&&t.id===s.id;g||i||r||t.type===`interest`&&n>.5?(e.shadowBlur=i||g?15:8,e.shadowColor=o):e.shadowBlur=0,e.fillStyle=o,e.globalAlpha=n,e.fill(),e.shadowBlur=0,e.strokeStyle=m,e.lineWidth=h,e.stroke(),e.globalAlpha=1}for(let i of r){if(i.x===void 0||i.y===void 0)continue;let r=1;f&&(r=p.has(i.id)?1:.15);let o=l&&i.id===l,c=d&&d.path.includes(i.id);s&&(i.id,s.id);let u=o?26:i.type===`interest`?18:14,m=-a.x/a.k-80,h=(t-a.x)/a.k+80,g=-a.y/a.k-80,_=(n-a.y)/a.k+80;i.x<m||i.x>h||i.y<g||i.y>_||(e.save(),e.globalAlpha=r,e.fillStyle=`#f8fafc`,e.font=o||c?`bold 11px "Outfit", "Inter", sans-serif`:`10px "Outfit", "Inter", sans-serif`,e.textAlign=`left`,e.textBaseline=`middle`,e.strokeStyle=`rgba(15, 23, 42, 0.8)`,e.lineWidth=3,e.strokeText(i.name,i.x+u,i.y),e.fillText(i.name,i.x+u,i.y),e.restore())}e.restore()}},Ya=.028,Xa=.45,Za=80,Qa=70,$a=120,eo=-80,to=-40,no=-15,ro=-260,io=1,ao=18,oo=10,so=35,co=20,lo=120,uo=45,fo=class{simulation=null;getSimulation(){return this.simulation}setup(e,t,n,r,i){let{activeStudent:a,showGlobal:o}=i,s=o||!a,c=new Map;if(this.simulation){for(let e of this.simulation.nodes())c.set(e.id,{x:e.x,y:e.y,vx:e.vx,vy:e.vy,fx:e.fx,fy:e.fy});this.simulation.stop()}else this.simulation=se();let l=this.simulation;for(let t of e){let e=c.get(t.id);e&&(t.x=e.x,t.y=e.y,t.vx=e.vx,t.vy=e.vy,t.fx=e.fx,t.fy=e.fy)}l.nodes(e).alphaDecay(Ya).velocityDecay(Xa),l.force(`center`,de(n/2,r/2));let u=l.force(`link`);u||(u=ae().id(e=>e.id),l.force(`link`,u)),u.links(t).distance(e=>{if(s)return Za;let t=typeof e.source==`object`?e.source.id:e.source,n=typeof e.target==`object`?e.target.id:e.target,r=J(`student`,a??``);return t===r||n===r?Qa:$a});let d=l.force(`charge`);d||(d=ue(),l.force(`charge`,d)),d.strength(e=>s?e.type===`interest`?eo:e.type===`activity`?to:no:ro).theta(io);let f=l.force(`collision`);f||(f=le(),l.force(`collision`,f)),f.radius(e=>s?e.type===`interest`?ao:oo:e.id===J(`student`,a??``)?so:co);let p=s?lo:uo;for(let e=0;e<p;e++)l.tick();return l}stop(){this.simulation&&=(this.simulation.stop(),this.simulation.on(`tick`,null),null)}},po=20,mo=.1,ho=5,go=200,_o=300,vo=1.25,yo=.8,bo=class{canvasElement;callbacks;physics;transform=ce;zoomBehavior=null;currentConfig=null;hoveredNode=null;constructor(e,t={}){this.canvasElement=e,this.callbacks=t,this.physics=new fo}destroy(){this.physics.stop(),this.zoomBehavior&&=(this.zoomBehavior.on(`zoom`,null),null);let e=L(this.canvasElement);e.on(`.zoom`,null),e.on(`.drag`,null),e.on(`click`,null),e.on(`mousemove`,null),e.on(`mouseout`,null),this.currentConfig=null,this.hoveredNode=null}zoomIn(){this.zoomBehavior&&L(this.canvasElement).transition().duration(go).call(this.zoomBehavior.scaleBy,vo)}zoomOut(){this.zoomBehavior&&L(this.canvasElement).transition().duration(go).call(this.zoomBehavior.scaleBy,yo)}resetZoom(){this.zoomBehavior&&L(this.canvasElement).transition().duration(_o).call(this.zoomBehavior.transform,ce)}draw(e){this.currentConfig=e;let t=e.graph,{activeStudent:n,currentUser:r}=e,i=n?J(`student`,n):`global`,a=i!==this.canvasElement.getAttribute(`data-focal-id`);this.canvasElement.setAttribute(`data-focal-id`,i);let o=this.canvasElement,s=o.parentElement?.clientWidth,c=o.parentElement?.clientHeight;if(o.parentElement&&(s===0||c===0))return;let l=s||o.clientWidth||900,u=c||o.clientHeight||600,d=window.devicePixelRatio||1,f=l*d,p=u*d,m=o.width/d,h=o.height/d,g=Math.abs(m-l),_=Math.abs(h-u);(o.width===0||o.height===0||g>30||_>30)&&(o.width=f,o.height=p,o.style.width=`${l}px`,o.style.height=`${u}px`);let v=o.getContext(`2d`);if(!v){console.error(`[ForceGraphRenderer] Failed to get 2D context`);return}v.resetTransform(),v.scale(d,d);let{nodes:y,links:b}=Ka.build(e),x=this.physics.setup(y,b,l,u,e);this.zoomBehavior||(this.zoomBehavior=fe().scaleExtent([mo,ho]),L(o).call(this.zoomBehavior)),this.zoomBehavior.on(`zoom`,e=>{this.transform=e.transform,this.renderCanvas(v,l,u,y,b)}),a&&(L(o).call(this.zoomBehavior.transform,ce),this.transform=ce),L(o).call(oe().subject(e=>{let[t,n]=I(e,o),r=this.transform.invertX(t),i=this.transform.invertY(n);return x.find(r,i,po)}).on(`start`,e=>{e.subject&&(e.active||x.alphaTarget(.3).restart(),e.subject.fx=e.subject.x,e.subject.fy=e.subject.y)}).on(`drag`,e=>{if(!e.subject)return;let[t,n]=I(e,o);e.subject.fx=this.transform.invertX(t),e.subject.fy=this.transform.invertY(n)}).on(`end`,e=>{e.subject&&(e.active||x.alphaTarget(0),e.subject.fx=null,e.subject.fy=null)})),L(o).on(`click`,e=>{let[t,n]=I(e,o),r=this.transform.invertX(t),i=this.transform.invertY(n),a=x.find(r,i,po);a&&this.callbacks.onNodeClick&&this.callbacks.onNodeClick(a)}),L(o).on(`mousemove`,e=>{let[i,a]=I(e,o),s=this.transform.invertX(i),c=this.transform.invertY(a),d=x.find(s,c,po);if(d!==this.hoveredNode&&(this.hoveredNode=d,this.renderCanvas(v,l,u,y,b),this.callbacks.onHover))if(d){let e;if(n)e=qa.getTooltipDetails(d,n,r,t);else if(d.type===`student`){let n=Array.from(t.get(d.id)??[]).filter(e=>e.startsWith(`interest:`)).map(e=>e.replace(`interest:`,``)),r=Array.from(t.get(d.id)??[]).filter(e=>e.startsWith(`activity:`)).map(e=>e.replace(`activity:`,``));e={title:`👤 同学: ${d.name}`,type:`student`,details:`拥有的兴趣圈：${n.join(`、`)||`暂无`}。已报名活动：${r.join(`、`)||`暂无`}。`}}else if(d.type===`activity`){let n=Array.from(t.get(d.id)??[]).filter(e=>e.startsWith(`interest:`)).map(e=>e.replace(`interest:`,``)),r=Array.from(t.get(d.id)??[]).filter(e=>e.startsWith(`student:`)).map(e=>e.replace(`student:`,``));e={title:`🎉 活动: ${d.name}`,type:`activity`,details:`分类标签：${n.join(`、`)||`暂无`}。目前已报名学生人数：${r.length} 人。`}}else e={title:`🎯 兴趣圈: ${d.name}`,type:`interest`,details:`校园兴趣主题标签。连接具有此共同爱好的学生与相关活动。`};this.callbacks.onHover(e)}else this.callbacks.onHover(null)}),L(o).on(`mouseout`,()=>{this.hoveredNode!==null&&(this.hoveredNode=null,this.renderCanvas(v,l,u,y,b),this.callbacks.onHover&&this.callbacks.onHover(null))}),x.on(`tick`,()=>{this.renderCanvas(v,l,u,y,b)}),x.alpha(1).restart()}renderCanvas(e,t,n,r,i){Ja.draw(e,t,n,r,i,this.transform,this.currentConfig,this.hoveredNode)}},xo=class{static draw(e,t,n,r,i,a,o,s,c,l,u,d,f){let{rows:p,cols:m,totalRows:h,totalCols:g,gridX:_,gridY:v,gridW:y,gridH:b,cellWidth:x,cellHeight:S,needsHorizontalScroll:C}=t,w=C?14:0,T=b-w,E=Math.floor(a/S),D=Math.min(h,Math.ceil((a+T)/S)),O=Math.floor(s/x),k=Math.min(g,Math.ceil((s+y)/x));e.save(),e.beginPath(),e.rect(_,v,y,T),e.clip();for(let t=E;t<D;t++){let r=p[t],o=v+t*S-a;n!==`interest-cooccurrence`&&r===i&&(e.fillStyle=`rgba(6, 182, 212, 0.08)`,e.fillRect(_,o,y,S))}if(u!==null&&d!==null){e.fillStyle=`rgba(255, 255, 255, 0.04)`;let t=v+u*S-a;e.fillRect(_,t,y,S);let n=_+d*x-s;e.fillRect(n,v,x,T)}let ee=1;if(n===`interest-cooccurrence`)for(let e=0;e<h;e++){let t=p[e],n=r.get(`interest:${t}`)||new Set;for(let t=0;t<g;t++){if(e===t)continue;let i=m[t],a=r.get(`interest:${i}`)||new Set,o=0;for(let e of n)e.startsWith(`student:`)&&a.has(e)&&o++;o>ee&&(ee=o)}}for(let t=E;t<D;t++){let i=p[t],o=v+t*S-a;for(let a=O;a<k;a++){let c=m[a],l=_+a*x-s,f=!1,p=`rgba(255, 255, 255, 0.02)`,h=``;if(n===`student-interest`)f=r.get(`student:${i}`)?.has(`interest:${c}`)||!1,p=f?`rgba(6, 182, 212, 0.85)`:`rgba(255, 255, 255, 0.02)`;else if(n===`student-activity`)f=r.get(`student:${i}`)?.has(`activity:${c}`)||!1,p=f?`rgba(74, 222, 128, 0.85)`:`rgba(255, 255, 255, 0.02)`;else if(n===`interest-cooccurrence`)if(t===a){let e=Array.from(r.get(`interest:${i}`)||[]).filter(e=>e.startsWith(`student:`));p=`rgba(15, 23, 42, 0.5)`,h=`${e.length}`}else{let e=r.get(`interest:${i}`)||new Set,t=r.get(`interest:${c}`)||new Set,n=0;for(let r of e)r.startsWith(`student:`)&&t.has(r)&&n++;n>0&&(p=`rgba(253, 151, 31, ${.15+n/ee*.85})`,h=`${n}`)}e.fillStyle=p,e.fillRect(l+1,o+1,x-2,S-2),h&&x>=16&&(e.save(),e.fillStyle=`#f8fafc`,e.font=`bold 8.5px "Outfit", "Inter", sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(h,l+x/2,o+S/2),e.restore()),u===t&&d===a&&(e.strokeStyle=`#ffb74d`,e.lineWidth=1.2,e.strokeRect(l+.5,o+.5,x-1,S-1))}}e.restore(),e.save(),e.beginPath(),e.rect(0,v,_,T),e.clip();for(let t=E;t<D;t++){let r=p[t],o=v+t*S-a,s=u===t,c=n!==`interest-cooccurrence`&&r===i;if(c&&(e.fillStyle=`rgba(6, 182, 212, 0.12)`,e.fillRect(0,o,_,S)),n!==`interest-cooccurrence`)if(e.canvas.width<768)c&&(e.fillStyle=`#06b6d4`,e.font=`bold 9px "Outfit", monospace`,e.textAlign=`left`,e.textBaseline=`middle`,e.fillText(`▶`,6,o+S/2));else if(c)e.fillStyle=`#06b6d4`,e.font=`bold 9px "Outfit", monospace`,e.textAlign=`left`,e.textBaseline=`middle`,e.fillText(`▶`,10,o+S/2);else{e.fillStyle=s?`rgba(253, 151, 31, 0.45)`:`rgba(255, 255, 255, 0.18)`,e.font=`9px "Outfit", monospace`,e.textAlign=`left`,e.textBaseline=`middle`;let n=String(t+1).padStart(2,`0`);e.fillText(`#${n}`,10,o+S/2)}c?(e.fillStyle=`#06b6d4`,e.font=`bold 11px "Outfit", "Inter", sans-serif`):(e.fillStyle=s?`#ffb74d`:`#94a3b8`,e.font=s?`bold 11px "Outfit", "Inter", sans-serif`:`10px "Outfit", "Inter", sans-serif`),e.textAlign=`right`;let l=n===`interest-cooccurrence`?`🎯 ${r}`:r;e.fillText(l,_-8,o+S/2)}e.restore(),e.save(),e.beginPath(),e.rect(_,0,y,v),e.clip();for(let t=O;t<k;t++){let r=m[t],i=_+t*x-s+x/2,a=d===t;e.save(),e.translate(i,v-8),e.rotate(-Math.PI/3),e.fillStyle=a?`#ffb74d`:`#94a3b8`,e.font=a?`bold 10px "Outfit", "Inter", sans-serif`:`9px "Outfit", "Inter", sans-serif`,e.textAlign=`left`,e.textBaseline=`middle`;let o=r;n===`student-activity`&&o.length>8&&(o=o.substring(0,7)+`..`),e.fillText(o,0,0),e.restore()}if(e.restore(),o>0){let t=_+y,n=T/(h*S),r=Math.max(30,n*T),i=v+a/o*(T-r);e.fillStyle=`rgba(255, 255, 255, 0.01)`,e.fillRect(t,v,f,T),e.fillStyle=l?`rgba(6, 182, 212, 0.5)`:`rgba(255, 255, 255, 0.08)`,e.strokeStyle=l?`#00f0ff`:`rgba(255, 255, 255, 0.15)`,e.lineWidth=1,e.beginPath(),e.roundRect(t+3,i,f-6,r,4),e.fill(),e.stroke()}if(C&&c>0){let n=v+T,r=w,i=y/t.totalContentWidth,a=Math.max(30,i*y),o=_+s/c*(y-a);e.fillStyle=`rgba(255, 255, 255, 0.01)`,e.fillRect(_,n,y,r),e.fillStyle=`rgba(255, 255, 255, 0.08)`,e.strokeStyle=`rgba(255, 255, 255, 0.15)`,e.lineWidth=1,e.beginPath(),e.roundRect(o,n+3,a,r-6,4),e.fill(),e.stroke()}e.strokeStyle=`rgba(255, 255, 255, 0.08)`,e.lineWidth=1,e.strokeRect(_,v,y,T)}},So=class{static getLayoutSpecs(e,t,n,r,i){let a=n===`interest-cooccurrence`,o=e<768,s=o?65:85,c=a?0:o?5:15,l=s,u=n===`student-interest`||n===`interest-cooccurrence`?70:90,d=e-l-i-c,f=t-u,p=[],m=[];n===`student-interest`?(p=Array.from(r.keys()).filter(e=>e.startsWith(`student:`)&&!e.endsWith(`Admin`)).map(e=>e.replace(`student:`,``)).sort((e,t)=>e.localeCompare(t,`zh`)),m=Array.from(r.keys()).filter(e=>e.startsWith(`interest:`)).map(e=>e.replace(`interest:`,``)).sort((e,t)=>e.localeCompare(t,`zh`))):n===`student-activity`?(p=Array.from(r.keys()).filter(e=>e.startsWith(`student:`)&&!e.endsWith(`Admin`)).map(e=>e.replace(`student:`,``)).sort((e,t)=>e.localeCompare(t,`zh`)),m=Array.from(r.keys()).filter(e=>e.startsWith(`activity:`)).map(e=>e.replace(`activity:`,``)).sort((e,t)=>e.localeCompare(t,`zh`))):(p=Array.from(r.keys()).filter(e=>e.startsWith(`interest:`)).map(e=>e.replace(`interest:`,``)).sort((e,t)=>e.localeCompare(t,`zh`)),m=p);let h=p.length,g=m.length,_=g>0?d/g:20,v=Math.max(28,_),y=g*v,b=y>d,x=18;return n===`interest-cooccurrence`&&h>0&&(x=f/h),{rows:p,cols:m,totalRows:h,totalCols:g,gridX:l,gridY:u,gridW:d,gridH:f,cellWidth:v,cellHeight:x,totalContentWidth:y,needsHorizontalScroll:b}}static getScrollbarThumbHeight(e,t,n){let r=e/(t*n);return Math.max(30,r*e)}},Co=class{canvas;callbacks;scrollbarWidth;dragStartMouseY=0;dragStartScrollTop=0;touchStartClientX=0;touchStartClientY=0;touchStartScrollTop=0;touchStartScrollLeft=0;isTouching=!1;handleWheelFn=null;handleMouseMoveFn=null;handleMouseDownFn=null;handleMouseUpFn=null;handleMouseOutFn=null;handleClickFn=null;handleTouchStartFn=null;handleTouchMoveFn=null;handleTouchEndFn=null;constructor(e,t,n){this.canvas=e,this.callbacks=t,this.scrollbarWidth=n,this.bindEvents()}destroy(){this.unbindEvents()}bindEvents(){let e=this.canvas;this.handleWheelFn=e=>{let t=this.callbacks.getMaxScrollTop(),n=this.callbacks.getMaxScrollLeft();if(!(t<=0&&n<=0)){if(e.preventDefault(),t>0&&Math.abs(e.deltaY)>=Math.abs(e.deltaX)){let n=Math.max(0,Math.min(t,this.callbacks.getScrollTop()+e.deltaY));this.callbacks.setScrollTop(n)}if(n>0&&Math.abs(e.deltaX)>0){let t=Math.max(0,Math.min(n,this.callbacks.getScrollLeft()+e.deltaX));this.callbacks.setScrollLeft(t)}if(n>0&&e.shiftKey&&Math.abs(e.deltaY)>0){let t=Math.max(0,Math.min(n,this.callbacks.getScrollLeft()+e.deltaY));this.callbacks.setScrollLeft(t)}this.callbacks.onRedraw()}},this.handleMouseMoveFn=t=>{let n=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top,{totalRows:a,totalCols:o,gridY:s,gridX:c,gridH:l,gridW:u,cellWidth:d,cellHeight:f}=this.callbacks.getLayoutSpecs();if(this.callbacks.isDraggingScrollbar()){let e=t.clientY-this.dragStartMouseY,n=a*f-l,r=l-So.getScrollbarThumbHeight(l,a,f);if(r>0){let t=e/r*n,i=this.callbacks.getMaxScrollTop(),a=Math.max(0,Math.min(i,this.dragStartScrollTop+t));this.callbacks.setScrollTop(a),this.callbacks.onRedraw()}return}let p=null,m=null,h=this.callbacks.getScrollLeft();r>=c&&r<c+u&&i>=s&&i<s+l&&(p=Math.floor((i-s+this.callbacks.getScrollTop())/f),m=Math.floor((r-c+h)/d),p>=a&&(p=null),m>=o&&(m=null));let g=this.callbacks.getHoveredState();(p!==g.rowIdx||m!==g.colIdx)&&(this.callbacks.setHoveredState(p,m),this.callbacks.onRedraw(),this.callbacks.onHoverTrigger(p,m))},this.handleMouseDownFn=t=>{let n=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top,{totalRows:a,gridY:o,gridH:s,cellHeight:c,gridX:l,gridW:u}=this.callbacks.getLayoutSpecs(),d=l+u;if(r>=d&&r<=d+this.scrollbarWidth&&i>=o&&i<=o+s){let e=So.getScrollbarThumbHeight(s,a,c),n=this.callbacks.getMaxScrollTop(),r=o+(n>0?this.callbacks.getScrollTop()/n:0)*(s-e);i>=r&&i<=r+e&&(this.callbacks.setDraggingScrollbar(!0),this.dragStartMouseY=t.clientY,this.dragStartScrollTop=this.callbacks.getScrollTop(),t.preventDefault())}},this.handleMouseUpFn=()=>{this.callbacks.setDraggingScrollbar(!1)},this.handleMouseOutFn=()=>{this.callbacks.setDraggingScrollbar(!1);let e=this.callbacks.getHoveredState();(e.rowIdx!==null||e.colIdx!==null)&&(this.callbacks.setHoveredState(null,null),this.callbacks.onRedraw(),this.callbacks.onHoverTrigger(null,null))},this.handleClickFn=t=>{if(this.callbacks.isDraggingScrollbar())return;let n=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top,{totalRows:a,totalCols:o,gridY:s,gridX:c,gridH:l,gridW:u,rows:d,cols:f,cellWidth:p,cellHeight:m}=this.callbacks.getLayoutSpecs(),h=this.callbacks.getScrollLeft();if(r>=0&&r<c+u&&i>=s&&i<s+l){let e=Math.floor((i-s+this.callbacks.getScrollTop())/m);if(e>=0&&e<a){let t=d[e];this.callbacks.onRowClick(t)}}else if(r>=c&&r<c+u&&i>=0&&i<s){let e=Math.floor((r-c+h)/p);if(e>=0&&e<o){let t=f[e];this.callbacks.onColClick(t)}}},this.handleTouchStartFn=e=>{e.touches.length===1&&(this.isTouching=!0,this.touchStartClientX=e.touches[0].clientX,this.touchStartClientY=e.touches[0].clientY,this.touchStartScrollTop=this.callbacks.getScrollTop(),this.touchStartScrollLeft=this.callbacks.getScrollLeft())},this.handleTouchMoveFn=t=>{let n=this.callbacks.getMaxScrollTop(),r=this.callbacks.getMaxScrollLeft();if(!this.isTouching||t.touches.length!==1||n<=0&&r<=0)return;let i=e.getBoundingClientRect(),a=t.touches[0].clientX-i.left,o=t.touches[0].clientY-i.top,{gridY:s,gridH:c,gridX:l,gridW:u}=this.callbacks.getLayoutSpecs();if(a>=l&&a<l+u&&o>=s&&o<=s+c){t.preventDefault();let e=t.touches[0].clientY-this.touchStartClientY,i=t.touches[0].clientX-this.touchStartClientX;if(n>0){let t=Math.max(0,Math.min(n,this.touchStartScrollTop-e));this.callbacks.setScrollTop(t)}if(r>0){let e=Math.max(0,Math.min(r,this.touchStartScrollLeft-i));this.callbacks.setScrollLeft(e)}this.callbacks.onRedraw()}},this.handleTouchEndFn=()=>{this.isTouching=!1},e.addEventListener(`wheel`,this.handleWheelFn,{passive:!1}),e.addEventListener(`mousemove`,this.handleMouseMoveFn),e.addEventListener(`mousedown`,this.handleMouseDownFn),window.addEventListener(`mouseup`,this.handleMouseUpFn),e.addEventListener(`mouseout`,this.handleMouseOutFn),e.addEventListener(`click`,this.handleClickFn),e.addEventListener(`touchstart`,this.handleTouchStartFn,{passive:!0}),e.addEventListener(`touchmove`,this.handleTouchMoveFn,{passive:!1}),e.addEventListener(`touchend`,this.handleTouchEndFn,{passive:!0})}unbindEvents(){let e=this.canvas;this.handleWheelFn&&e.removeEventListener(`wheel`,this.handleWheelFn),this.handleMouseMoveFn&&e.removeEventListener(`mousemove`,this.handleMouseMoveFn),this.handleMouseDownFn&&e.removeEventListener(`mousedown`,this.handleMouseDownFn),window.removeEventListener(`mouseup`,this.handleMouseUpFn),this.handleMouseOutFn&&e.removeEventListener(`mouseout`,this.handleMouseOutFn),this.handleClickFn&&e.removeEventListener(`click`,this.handleClickFn),this.handleTouchStartFn&&e.removeEventListener(`touchstart`,this.handleTouchStartFn),this.handleTouchMoveFn&&e.removeEventListener(`touchmove`,this.handleTouchMoveFn),this.handleTouchEndFn&&e.removeEventListener(`touchend`,this.handleTouchEndFn)}},wo=class{canvasElement;callbacks;currentConfig=null;scrollTop=0;maxScrollTop=0;scrollLeft=0;maxScrollLeft=0;isDraggingScrollbar=!1;hoveredRowIdx=null;hoveredColIdx=null;scrollbarWidth=14;interactionHandler;constructor(e,t={}){this.canvasElement=e,this.callbacks=t,this.interactionHandler=new Co(e,{onRedraw:()=>this.redraw(),onHoverTrigger:(e,t)=>this.triggerHoverCallback(e,t),onRowClick:e=>this.handleRowClick(e),onColClick:e=>this.handleColClick(e),getLayoutSpecs:()=>this.getLayoutSpecs(),getMaxScrollTop:()=>this.maxScrollTop,getScrollTop:()=>this.scrollTop,setScrollTop:e=>{this.scrollTop=e},getMaxScrollLeft:()=>this.maxScrollLeft,getScrollLeft:()=>this.scrollLeft,setScrollLeft:e=>{this.scrollLeft=e},isDraggingScrollbar:()=>this.isDraggingScrollbar,setDraggingScrollbar:e=>{this.isDraggingScrollbar=e},getHoveredState:()=>({rowIdx:this.hoveredRowIdx,colIdx:this.hoveredColIdx}),setHoveredState:(e,t)=>{this.hoveredRowIdx=e,this.hoveredColIdx=t}},this.scrollbarWidth)}destroy(){this.interactionHandler.destroy(),this.currentConfig=null}draw(e){this.currentConfig=e,this.redraw()}redraw(){if(!this.currentConfig)return;let e=this.canvasElement,t=e.parentElement?.clientWidth,n=e.parentElement?.clientHeight;if(e.parentElement&&(t===0||n===0))return;let r=t||e.clientWidth||900,i=n||e.clientHeight||600,a=window.devicePixelRatio||1,o=r*a,s=i*a,c=e.width/a,l=e.height/a,u=Math.abs(c-r),d=Math.abs(l-i);(e.width===0||e.height===0||u>30||d>30)&&(e.width=o,e.height=s,e.style.width=`${r}px`,e.style.height=`${i}px`);let f=e.getContext(`2d`);if(!f)return;f.resetTransform(),f.clearRect(0,0,e.width,e.height),f.scale(a,a);let p=this.getLayoutSpecs(),m=this.currentConfig.matrixMode||`student-interest`,h=this.currentConfig.graph,g=this.currentConfig.activeStudent||null,_=p.totalRows*p.cellHeight;this.maxScrollTop=Math.max(0,_-p.gridH),this.scrollTop>this.maxScrollTop&&(this.scrollTop=this.maxScrollTop),this.maxScrollLeft=Math.max(0,p.totalContentWidth-p.gridW),this.scrollLeft>this.maxScrollLeft&&(this.scrollLeft=this.maxScrollLeft),xo.draw(f,p,m,h,g,this.scrollTop,this.maxScrollTop,this.scrollLeft,this.maxScrollLeft,this.isDraggingScrollbar,this.hoveredRowIdx,this.hoveredColIdx,this.scrollbarWidth)}cachedSpecs=null;cachedWidth=0;cachedHeight=0;cachedMatrixMode=``;cachedGraph=null;getLayoutSpecs(){let e=this.canvasElement,t=e.style.width?parseInt(e.style.width):e.clientWidth,n=e.style.height?parseInt(e.style.height):e.clientHeight,r=this.currentConfig?.matrixMode||`student-interest`,i=this.currentConfig?.graph||new Map;return this.cachedSpecs&&this.cachedWidth===t&&this.cachedHeight===n&&this.cachedMatrixMode===r&&this.cachedGraph===i?this.cachedSpecs:(this.cachedWidth=t,this.cachedHeight=n,this.cachedMatrixMode=r,this.cachedGraph=i,this.cachedSpecs=So.getLayoutSpecs(t,n,r,i,this.scrollbarWidth),this.cachedSpecs)}handleRowClick(e){if(!this.currentConfig||!this.callbacks.onNodeClick)return;let t=this.currentConfig.matrixMode||`student-interest`;t===`student-interest`||t===`student-activity`?this.callbacks.onNodeClick({type:`student`,name:e}):t===`interest-cooccurrence`&&this.callbacks.onNodeClick({type:`interest`,name:e})}handleColClick(e){if(!this.currentConfig||!this.callbacks.onNodeClick)return;let t=this.currentConfig.matrixMode||`student-interest`;t===`student-interest`?this.callbacks.onNodeClick({type:`interest`,name:e}):t===`student-activity`?this.callbacks.onNodeClick({type:`activity`,name:e}):t===`interest-cooccurrence`&&this.callbacks.onNodeClick({type:`interest`,name:e})}triggerHoverCallback(e,t){if(!this.callbacks.onHover)return;if(e===null||t===null||!this.currentConfig){this.callbacks.onHover(null);return}let{rows:n,cols:r}=this.getLayoutSpecs(),i=n[e],a=r[t],o=this.currentConfig.matrixMode||`student-interest`,s=this.currentConfig.graph,c;if(o===`student-interest`){let e=s.get(`student:${i}`)?.has(`interest:${a}`)||!1;c={title:`${i} 与 ${a}`,type:`student`,details:e?`【关联】${i} 对兴趣“${a}”表现出浓厚的兴趣，并在关系网中通过此兴趣建立连线。`:`【未关联】${i} 目前尚未将“${a}”设为自己的兴趣标签。`}}else if(o===`student-activity`){let e=s.get(`student:${i}`)?.has(`activity:${a}`)||!1;c={title:`${i} 与 ${a}`,type:`activity`,details:e?`【报名】${i} 已经成功报名参与了校园活动“${a}”，是活跃的参与者。`:`【未报名】${i} 目前尚未报名活动“${a}”。`}}else if(e===t){let e=Array.from(s.get(`interest:${i}`)||[]).filter(e=>e.startsWith(`student:`)).length;c={title:`${i} (兴趣圈规模)`,type:`interest`,details:`全校共有 ${e} 位同学勾选了“${i}”作为自己的兴趣爱好圈子。`}}else{let e=s.get(`interest:${i}`)||new Set,t=s.get(`interest:${a}`)||new Set,n=0,r=[];for(let i of e)i.startsWith(`student:`)&&t.has(i)&&(n++,r.length<5&&r.push(i.replace(`student:`,``)));let o=`【兴趣交叉分析】共有 ${n} 位同学同时对“${i}”和“${a}”感兴趣。`;n>0?o+=` 包括：${r.join(`、`)}${n>5?` 等人`:``}。此热力表示了这两个兴趣社群的融合度。`:o+=` 这两个兴趣社群目前完全独立，没有任何学生交叉，可发布跨界活动来打破社交壁垒。`,c={title:`${i} 与 ${a}`,type:`interest`,details:o}}this.callbacks.onHover(c)}},To={class:`fullscreen-graph-overlay fade-in`},Eo={class:`fullscreen-modal-card card glow-cyan`},Do={class:`fullscreen-modal-header`},Oo={class:`vis-title-group`},ko={class:`icon-svg`,viewBox:`0 0 24 24`,width:`15`,height:`15`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`6px`,"vertical-align":`-1px`,color:`var(--accent-cyan)`}},Ao={class:`vis-subtitle`},jo={class:`modal-controls-row`},Mo={key:1,class:`matrix-mode-select-wrap`},No={key:2,class:`canvas-toggles`},Po={class:`toggle-group`},Fo={class:`neon-checkbox`,style:{display:`inline-flex`,"align-items":`center`}},Io={class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},Lo={class:`neon-checkbox`,style:{display:`inline-flex`,"align-items":`center`}},Ro={class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`,style:{"margin-right":`4px`,"vertical-align":`-1px`}},zo={key:0,class:`limit-slider-group`},Bo={class:`slider-label`,style:{display:`inline-flex`,"align-items":`center`,gap:`4px`}},Vo=[`max`],Ho={key:3,class:`zoom-controls-modal`},Uo={key:0,class:`vis-tooltip fade-in`},Wo={class:`tooltip-header`},Go={class:`tooltip-icon`},Ko={class:`tooltip-body`},qo=e(m({__name:`GraphModal`,setup(e,{expose:t}){let i=f(!1),o=f(null),c=f(null),l=f(!1),u=f(!1),p=O(()=>G.value===`admin`?40:10),m=f(G.value===`admin`?30:10),_=f(!1),b=f(null),x=f(`network`),S=f(`student-interest`),w=null,T=null,E=null,k=O(()=>G.value===`admin`?_.value||!X.value:!1);d(p,e=>{m.value>e&&(m.value=e)},{immediate:!0});let A=()=>{c.value&&(window.ResizeObserver?(E&&E.disconnect(),E=new ResizeObserver(e=>{let t=!1;for(let n of e){let{width:e,height:r}=n.contentRect;e>0&&r>0&&(t=!0)}t&&N()}),E.observe(c.value)):(window.addEventListener(`resize`,N),N()))},j=()=>{E?(E.disconnect(),E=null):window.removeEventListener(`resize`,N)},te=(e,t,n)=>{i.value=!0,document.body.style.overflow=`hidden`,e===!0&&G.value===`admin`&&(_.value=!0),t?x.value=t:_.value||!X.value?x.value=`matrix`:x.value=`network`,n&&(S.value=n),r(()=>{A()})},ne=()=>{i.value=!1,document.body.style.overflow=``,j(),w&&=(w.destroy(),null),T&&=(T.destroy(),null),b.value=null},N=()=>{i.value&&ce()};t({open:te,close:ne,redraw:N});let ae=()=>{x.value===`network`&&w?.zoomIn()},oe=()=>{x.value===`network`&&w?.zoomOut()},se=()=>{x.value===`network`&&w?.resetZoom()},I=null,ce=()=>{o.value&&(I!==null&&cancelAnimationFrame(I),I=requestAnimationFrame(()=>{I=null,o.value&&(x.value===`network`?(T&&=(T.destroy(),null),w||=new bo(o.value,{onNodeClick:e=>{e.type===`student`&&G.value===`admin`&&Cn(e.name)},onHover:e=>{b.value=e}}),w.draw({graph:q.value,activeStudent:X.value,recommendations:Y.value,hideBuddies:l.value,hideActivities:u.value,buddyLimit:m.value,pathResult:un.value,currentUser:W.value,currentUserRole:G.value,showGlobal:G.value===`admin`?_.value:!1,privateStudents:V().privateStudents})):(w&&=(w.destroy(),null),T||=new wo(o.value,{onNodeClick:e=>{e.type===`student`&&G.value===`admin`&&Cn(e.name)},onHover:e=>{b.value=e}}),T.draw({graph:q.value,activeStudent:X.value,matrixMode:S.value})))}))};return d([l,u,m,_,x,S,X,un,()=>ze.value],([e,t,n,r,a,o,s],[c,l,u,d,f,p,m])=>{s!==m&&(_.value=!1,s||(x.value=`matrix`)),i.value&&ce()},{deep:!0}),ie(()=>{i.value&&A()}),h(()=>{document.body.style.overflow=``,j(),I!==null&&cancelAnimationFrame(I),w&&=(w.destroy(),null),T&&=(T.destroy(),null)}),(e,t)=>n((a(),M(`div`,To,[C(`div`,Eo,[C(`button`,{onClick:ne,class:`close-modal-btn`,title:`关闭拓扑图`,"aria-label":`关闭`},[...t[6]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`14`,height:`14`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`},[C(`line`,{x1:`18`,y1:`6`,x2:`6`,y2:`18`}),C(`line`,{x1:`6`,y1:`6`,x2:`18`,y2:`18`})],-1)]]),C(`div`,Do,[C(`div`,Oo,[C(`h3`,null,[(a(),M(`svg`,ko,[...t[7]||=[C(`circle`,{cx:`12`,cy:`12`,r:`10`},null,-1),C(`line`,{x1:`2`,y1:`12`,x2:`22`,y2:`12`},null,-1),C(`path`,{d:`M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z`},null,-1)]])),v(` `+F(x.value===`matrix`?`校园人脉邻接关联矩阵`:k.value?`校园全局人脉拓扑网络`:`局域关联拓扑网络`),1)]),C(`span`,Ao,F(x.value===`matrix`?`通过二维网格交叉分析兴趣重合与活动参与`:k.value?`全校兴趣社群与活动分布骨干网络图谱`:s(G)===`admin`?`${s(X)} 的双跳聚焦关系网络`:`您的双跳聚焦关系网络`),1)]),C(`div`,jo,[s(G)===`admin`&&s(X)&&x.value===`network`?(a(),M(`button`,{key:0,class:`return-matrix-btn-neon`,onClick:t[0]||=e=>x.value=`matrix`,title:`返回全校人脉邻接关联矩阵`,style:{display:`inline-flex`,"align-items":`center`,gap:`6px`}},[...t[8]||=[P(`<svg class="icon-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" data-v-27bce8b9><rect x="3" y="3" width="7" height="9" data-v-27bce8b9></rect><rect x="14" y="3" width="7" height="5" data-v-27bce8b9></rect><rect x="14" y="12" width="7" height="9" data-v-27bce8b9></rect><rect x="3" y="16" width="7" height="5" data-v-27bce8b9></rect></svg> 返回人脉矩阵 `,2)]])):g(``,!0),x.value===`matrix`?(a(),M(`div`,Mo,[n(C(`select`,{"onUpdate:modelValue":t[1]||=e=>S.value=e,class:`matrix-select-neon`},[...t[9]||=[C(`option`,{value:`student-interest`},`学生个人兴趣倾向`,-1),C(`option`,{value:`interest-cooccurrence`},`兴趣社群交叉共现`,-1),C(`option`,{value:`student-activity`},`校园活动参与分布`,-1)]],512),[[y,S.value]]),s(X)?(a(),M(`button`,{key:0,class:`view-network-btn-neon`,onClick:t[2]||=e=>x.value=`network`,title:`切换至该学生的双跳拓扑关系网络`,style:{display:`inline-flex`,"align-items":`center`,gap:`6px`}},[t[10]||=C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[C(`polygon`,{points:`12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2`})],-1),v(` 查看 `+F(s(X))+` 的聚焦关系网络 `,1)])):g(``,!0)])):g(``,!0),x.value===`network`?(a(),M(`div`,No,[C(`div`,Po,[C(`label`,Fo,[n(C(`input`,{type:`checkbox`,"onUpdate:modelValue":t[3]||=e=>l.value=e},null,512),[[ee,l.value]]),t[12]||=C(`span`,{class:`checkbox-box`},null,-1),(a(),M(`svg`,Io,[...t[11]||=[C(`path`,{d:`M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z`},null,-1),C(`circle`,{cx:`12`,cy:`12`,r:`3`},null,-1)]])),t[13]||=v(` 隐藏同学 `,-1)]),C(`label`,Lo,[n(C(`input`,{type:`checkbox`,"onUpdate:modelValue":t[4]||=e=>u.value=e},null,512),[[ee,u.value]]),t[15]||=C(`span`,{class:`checkbox-box`},null,-1),(a(),M(`svg`,Ro,[...t[14]||=[C(`path`,{d:`M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z`},null,-1),C(`circle`,{cx:`12`,cy:`12`,r:`3`},null,-1)]])),t[16]||=v(` 隐藏活动 `,-1)])]),k.value?g(``,!0):(a(),M(`div`,zo,[C(`span`,Bo,[t[17]||=C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[C(`path`,{d:`M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2`}),C(`circle`,{cx:`9`,cy:`7`,r:`4`})],-1),v(` 推荐搭子限额: `+F(m.value)+`人 `,1)]),n(C(`input`,{type:`range`,min:`0`,max:p.value,step:`1`,"onUpdate:modelValue":t[5]||=e=>m.value=e,class:`neon-slider`},null,8,Vo),[[D,m.value,void 0,{number:!0}]])]))])):g(``,!0),x.value===`network`?(a(),M(`div`,Ho,[C(`button`,{onClick:ae,class:`zoom-btn`,title:`放大`,"aria-label":`放大`,style:{display:`inline-flex`,"align-items":`center`,"justify-content":`center`}},[...t[18]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`},[C(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`19`}),C(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`})],-1)]]),C(`button`,{onClick:oe,class:`zoom-btn`,title:`缩小`,"aria-label":`缩小`,style:{display:`inline-flex`,"align-items":`center`,"justify-content":`center`}},[...t[19]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2.5`},[C(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`})],-1)]]),C(`button`,{onClick:se,class:`zoom-btn`,title:`重置`,"aria-label":`重置`,style:{display:`inline-flex`,"align-items":`center`,"justify-content":`center`}},[...t[20]||=[C(`svg`,{class:`icon-svg`,viewBox:`0 0 24 24`,width:`12`,height:`12`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[C(`path`,{d:`M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67`})],-1)]])])):g(``,!0)])]),C(`div`,{class:`fullscreen-canvas-container`,ref_key:`canvasContainerRef`,ref:c},[C(`canvas`,{ref_key:`canvasRef`,ref:o,style:{width:`100%`,height:`100%`,display:`block`}},null,512),b.value?(a(),M(`div`,Uo,[C(`div`,Wo,[C(`span`,Go,F(b.value.type===`student`?`👤`:b.value.type===`activity`?`🎉`:`🎯`),1),C(`h4`,null,F(b.value.title),1)]),C(`div`,Ko,[C(`p`,null,F(b.value.details),1)])])):g(``,!0)],512)])],512)),[[re,i.value]])}}),[[`__scopeId`,`data-v-27bce8b9`]]),Jo=Z.topSocialStudents,Yo=Z.bridgeStudents,Xo=Z.isolatedCount,Zo=Z.popularInterests,Qo=Z.popularActivities,$o=Z.themeCommunities,es=Z.connectivityRate,ts=Z.averagePathLength,ns=Z.clusteringCoefficient,rs=Z.networkDensity,is=(e=!1)=>{Z.recalculateGraphInsights(e)},as={class:`bridge-plan-box card glow-orange fade-in`},os={class:`bridge-header`},ss={class:`bridge-body`},cs={class:`bridge-options-list`},ls={class:`option-content`},us={class:`option-title`},ds={class:`opt-sub`},fs={class:`option-content`},ps={class:`option-title`},ms={class:`opt-sub`},hs={class:`option-content`},gs={class:`option-title`},_s={class:`opt-sub`},vs=e(m({__name:`BridgePlanPanel`,props:{studentName:{}},emits:[`close`,`applied`],setup(e,{emit:t}){let r=e,i=t,o=f(`interest`),s=O(()=>Zo.value.length===0?{name:`读书`,count:0}:Zo.value[0]),l=O(()=>Jo.value.length===0?{name:`小明`,score:0}:Jo.value[0]),u=O(()=>{let e=[];for(let[t,n]of q.value.entries())if(t.startsWith(`activity:`)){let r=t.slice(9),i=Array.from(n).filter(e=>e.startsWith(`student:`)).length;e.push({name:r,count:i})}return e.length===0?{name:`校园讲座`,count:0}:e.sort((e,t)=>t.count-e.count)[0]}),d=()=>{let e=r.studentName,t=``,n=``;o.value===`interest`?(t=s.value.name,n=`兴趣圈`):o.value===`student`?(t=l.value.name,n=`社交枢纽同学`):(t=u.value.name,n=`热门校园活动`),$(`action`,`【人脉桥接建议】已成功向孤立同学【${e}】推送${n}【${t}】的帮扶建议`),$(`info`,`系统状态：已向用户端下发建议通知，等待该生确认加入以融入校园网。`),i(`applied`,e)};return(e,t)=>(a(),M(`div`,as,[C(`div`,os,[t[4]||=C(`h4`,null,`⚡ 人脉拓扑桥接方案`,-1),C(`button`,{onClick:t[0]||=e=>i(`close`),class:`close-promo-btn`},`×`)]),C(`div`,ss,[C(`div`,cs,[C(`label`,{class:c([`bridge-option-item`,{"option-checked":o.value===`interest`}])},[n(C(`input`,{type:`radio`,value:`interest`,"onUpdate:modelValue":t[1]||=e=>o.value=e,class:`hidden-radio`},null,512),[[te,o.value]]),C(`div`,ls,[t[7]||=C(`span`,{class:`option-badge opt-interest`},`兴趣圈`,-1),C(`span`,us,[t[5]||=v(`关联 `,-1),C(`b`,null,F(s.value.name),1),t[6]||=v(),C(`span`,ds,`(`+F(s.value.count)+`人)`,1)])])],2),C(`label`,{class:c([`bridge-option-item`,{"option-checked":o.value===`student`}])},[n(C(`input`,{type:`radio`,value:`student`,"onUpdate:modelValue":t[2]||=e=>o.value=e,class:`hidden-radio`},null,512),[[te,o.value]]),C(`div`,fs,[t[10]||=C(`span`,{class:`option-badge opt-student`},`社交达人`,-1),C(`span`,ps,[t[8]||=v(`结识 `,-1),C(`b`,null,F(l.value.name),1),t[9]||=v(),C(`span`,ms,`(度:`+F(l.value.score)+`)`,1)])])],2),C(`label`,{class:c([`bridge-option-item`,{"option-checked":o.value===`activity`}])},[n(C(`input`,{type:`radio`,value:`activity`,"onUpdate:modelValue":t[3]||=e=>o.value=e,class:`hidden-radio`},null,512),[[te,o.value]]),C(`div`,hs,[t[13]||=C(`span`,{class:`option-badge opt-activity`},`校园活动`,-1),C(`span`,gs,[t[11]||=v(`报名 `,-1),C(`b`,null,F(u.value.name),1),t[12]||=v(),C(`span`,_s,`(`+F(u.value.count)+`人)`,1)])])],2)]),C(`button`,{onClick:d,class:`btn btn-primary glow-orange apply-bridge-btn`},` 📢 一键发送桥接建议 `)])]))}}),[[`__scopeId`,`data-v-90616b20`]]),ys={class:`dashboard-grid-card card`},bs={class:`flex-1-scroll`},xs={class:`alert-icon`},Ss={class:`alert-text`},Cs={key:0,class:`isolated-list-container`},ws={class:`isolated-students-list`},Ts=[`onClick`],Es={class:`student-left`},Ds={class:`student-name-text`},Os={key:0,class:`suggestion-sent-badge`},ks=e(m({__name:`IsolationCard`,setup(e){let t=f(null),n=f(new Set),r=O(()=>{let e=[];for(let[t,n]of q.value.entries())t.startsWith(`student:`)&&t!==`student:系统管理员`&&n.size===0&&e.push(t.slice(8));return e.sort()}),o=e=>{t.value=e},s=e=>{n.value.add(e),n.value=new Set(n.value),t.value=null};return(e,l)=>(a(),M(`div`,ys,[l[5]||=P(`<div class="col-header" data-v-955395fe><div class="title-with-info" data-v-955395fe><h3 data-v-955395fe>🧭 社交孤立分析与一键人脉桥接</h3><div class="info-tooltip-wrapper" data-v-955395fe><span class="info-icon" data-v-955395fe>ℹ️</span><div class="tooltip-content left-align" data-v-955395fe><h4 data-v-955395fe>社交孤立分析说明</h4><p data-v-955395fe>基于图论度数（Degree）检测。当一个学生节点的度数为 0（无任何连边）时即判定为社交孤立。系统实时分析这些“孤岛学生”，并提供关联热门兴趣、推荐社交达人或报名热门活动三种一键桥接方案，以最小的图边代价将他们织入全校社交网。</p></div></div></div></div>`,1),C(`div`,bs,[C(`div`,{class:c([`isolation-diagnostic-summary`,{"has-isolated-alert":r.value.length>0}])},[C(`span`,xs,F(r.value.length>0?`⚠️`:`🎉`),1),C(`span`,Ss,[r.value.length>0?(a(),M(A,{key:0},[l[1]||=v(` 检测到 `,-1),C(`strong`,null,F(r.value.length),1),l[2]||=v(` 名暂无社交连接的孤立学生 `,-1)],64)):(a(),M(A,{key:1},[v(` 全校社交网络连通率 100%，无孤立个体！ `)],64))])],2),C(`div`,{class:c([`isolation-content-area`,{"has-selection":t.value}])},[r.value.length>0?(a(),M(`div`,Cs,[C(`div`,ws,[(a(!0),M(A,null,i(r.value,e=>(a(),M(`div`,{key:e,class:c([`isolated-student-item`,{"item-selected":t.value===e}]),onClick:t=>o(e)},[C(`div`,Es,[l[3]||=C(`span`,{class:`student-avatar-icon`},`👤`,-1),C(`span`,Ds,F(e),1),l[4]||=C(`span`,{class:`student-deg-badge`},`度数: 0`,-1),n.value.has(e)?(a(),M(`span`,Os,`已建议`)):g(``,!0)]),C(`button`,{class:c([`btn btn-xs select-bridge-btn`,n.value.has(e)?`suggested-btn`:`btn-secondary`])},F(n.value.has(e)?`✓ 已建议`:`⚡ 桥接`),3)],10,Ts))),128))])])):g(``,!0),t.value?(a(),S(vs,{key:1,"student-name":t.value,onClose:l[0]||=e=>t.value=null,onApplied:s,class:`bridge-panel-sidebar`},null,8,[`student-name`])):g(``,!0)],2)])]))}}),[[`__scopeId`,`data-v-955395fe`]]),As={class:`promo-box card glow-cyan fade-in`},js={class:`promo-header`},Ms={class:`promo-body`},Ns={class:`promo-intro`},Ps={key:0,class:`promo-targets-list`},Fs={key:1,class:`promo-empty`},Is={key:2,class:`promo-action-row`},Ls=[`disabled`],Rs=e(m({__name:`ActivityPromoPanel`,props:{activityName:{},interestName:{}},emits:[`close`],setup(e,{emit:t}){let n=e,r=t,o=f(!1),s=O(()=>{let e=n.activityName;if(!e)return[];let t=J(`activity`,e),r=q.value.get(t)??new Set,i=Array.from(r).find(e=>e.startsWith(`interest:`));if(!i)return[];let a=q.value.get(i)??new Set,o=Array.from(a).filter(e=>e.startsWith(`student:`)),s=[];for(let e of o)(q.value.get(e)??new Set).has(t)||s.push(e.slice(8));return s.sort().slice(0,4)}),c=()=>{let e=n.activityName,t=s.value;!e||t.length===0||($(`action`,`【活动宣传推送】成功为活动【${e}】向契合其兴趣的目标同学【${t.join(`、`)}】发送了温馨活动邀请`),$(`info`,`宣传效果预估：通过此次温馨邀请，预计将为该活动带来新的活跃成员，帮助丰富同学们的课余生活。`),o.value=!0,setTimeout(()=>{o.value=!1},3e3))};return(t,n)=>(a(),M(`div`,As,[C(`div`,js,[C(`span`,null,`🎯 活动【`+F(e.activityName)+`】定向宣传与关怀推送助手`,1),C(`button`,{onClick:n[0]||=e=>r(`close`),class:`close-promo-btn`},`×`)]),C(`div`,Ms,[C(`p`,Ns,[n[1]||=v(`寻找对 `,-1),C(`b`,null,F(e.interestName),1),n[2]||=v(` 有共同兴趣但`,-1),n[3]||=C(`b`,null,`尚未知晓或未报名`,-1),n[4]||=v(`的同学：`,-1)]),s.value.length>0?(a(),M(`div`,Ps,[(a(!0),M(A,null,i(s.value,e=>(a(),M(`span`,{key:e,class:`target-student-chip`},` 👤 `+F(e),1))),128))])):(a(),M(`div`,Fs,` 没有找到符合该兴趣条件且未报名的学生（全部符合条件的同学已报名）。 `)),s.value.length>0?(a(),M(`div`,Is,[C(`button`,{onClick:c,class:`btn btn-xs btn-primary glow-orange send-promo-btn`,disabled:o.value},F(o.value?`✓ 邀请消息已推送`:`📢 发送定向活动邀请`),9,Ls)])):g(``,!0)])]))}}),[[`__scopeId`,`data-v-cb419df7`]]),zs={class:`dashboard-grid-card card`},Bs={class:`flex-1-scroll`},Vs={class:`activity-saturation-section`},Hs={class:`table-container`},Us={class:`saturation-table`},Ws=[`title`],Gs={class:`interest-badge-light`},Ks={class:`count-td`},qs=[`onClick`],Js={key:1,class:`text-muted`},Ys=e(m({__name:`ActivitySaturationCard`,setup(e){let t=f(null),n=O(()=>{let e=[];for(let[t,n]of q.value.entries())if(t.startsWith(`activity:`)){let r=t.slice(9),i=`未知`,a=0;for(let e of n)e.startsWith(`interest:`)&&i===`未知`?i=e.slice(9):e.startsWith(`student:`)&&a++;let o=`normal`;a>=18?o=`hot`:a<5&&(o=`cold`),e.push({name:r,interest:i,count:a,status:o})}return e.sort((e,t)=>e.count-t.count)});return(e,r)=>(a(),M(`div`,zs,[r[2]||=P(`<div class="col-header" data-v-e12621cb><div class="title-with-info" data-v-e12621cb><h3 data-v-e12621cb>🔥 校园活动热度与关怀推广</h3><div class="info-tooltip-wrapper" data-v-e12621cb><span class="info-icon" data-v-e12621cb>ℹ️</span><div class="tooltip-content" data-v-e12621cb><h4 data-v-e12621cb>校园活动热度与推广说明</h4><p data-v-e12621cb>了解校园活动的报名热度。报名人数少于 5 人提示需多关注，多于 18 人为极高人气。针对需要多加关注的冷门活动，系统可以检索对该主题感兴趣但尚未知晓或未报名的同学，帮助管理员定向发送活动邀请，丰富其课外生活。</p></div></div></div></div>`,1),C(`div`,Bs,[C(`div`,Vs,[C(`div`,Hs,[C(`table`,Us,[r[1]||=C(`thead`,null,[C(`tr`,null,[C(`th`,null,`活动名称`),C(`th`,null,`所属兴趣`),C(`th`,null,`报名数`),C(`th`,null,`活动热度`),C(`th`,null,`校园宣传邀请`)])],-1),C(`tbody`,null,[(a(!0),M(A,null,i(n.value.slice(0,15),e=>(a(),M(`tr`,{key:e.name,class:c({"row-selected":t.value===e.name})},[C(`td`,{class:`act-name-td`,title:e.name},F(e.name),9,Ws),C(`td`,null,[C(`span`,Gs,F(e.interest),1)]),C(`td`,Ks,F(e.count)+` 人`,1),C(`td`,null,[C(`span`,{class:c([`status-pill`,e.status])},F(e.status===`hot`?`🔥 极高人气`:e.status===`cold`?`⚠️ 需多关注`:`正常`),3)]),C(`td`,null,[e.status===`cold`?(a(),M(`button`,{key:0,onClick:n=>t.value=e.name,class:`btn btn-xs btn-secondary glow-cyan`},`🎯 定向邀请`,8,qs)):(a(),M(`span`,Js,`-`))])],2))),128))])])]),t.value?(a(),S(Rs,{key:0,"activity-name":t.value,"interest-name":n.value.find(e=>e.name===t.value)?.interest||``,onClose:r[0]||=e=>t.value=null},null,8,[`activity-name`,`interest-name`])):g(``,!0)])])]))}}),[[`__scopeId`,`data-v-e12621cb`]]),Xs={class:`dashboard-grid-card card`},Zs={class:`card-scroll-body`},Qs={class:`centrality-list`},$s={class:`centrality-rank`},ec={class:`centrality-name`},tc={class:`centrality-score`},nc=e(m({__name:`DegreeCentralityCard`,setup(e){return(e,t)=>(a(),M(`div`,Xs,[t[0]||=P(`<div class="col-header" data-v-4177cb0b><div class="title-with-info" data-v-4177cb0b><h3 data-v-4177cb0b>👑 校园社交达人</h3><div class="info-tooltip-wrapper" data-v-4177cb0b><span class="info-icon" data-v-4177cb0b>ℹ️</span><div class="tooltip-content left-align" data-v-4177cb0b><h4 data-v-4177cb0b>社交活跃达人说明</h4><p data-v-4177cb0b>展示校园中最为活跃、参与活动及兴趣非常丰富的同学。他们在多个社群都有所涉及，建立的校园人际连接较多，在日常活动和社交生活中扮演着积极开朗的纽带与先锋角色。</p></div></div></div></div>`,1),C(`div`,Zs,[C(`div`,Qs,[(a(!0),M(A,null,i(s(Jo).slice(0,5),(e,t)=>(a(),M(`div`,{key:e.name,class:`centrality-item`},[C(`span`,$s,`#`+F(t+1),1),C(`span`,ec,`👤 `+F(e.name),1),C(`span`,tc,F(e.score)+` 个连结`,1)]))),128))])])]))}}),[[`__scopeId`,`data-v-4177cb0b`]]),rc={class:`dashboard-grid-card card`},ic={class:`card-scroll-body`},ac={class:`chart-container`},oc={class:`rank-badge`},sc=[`title`],cc={class:`bar-track`},lc={class:`bar-value`},uc=e(m({__name:`PopularInterestsCard`,setup(e){let t=O(()=>Zo.value.length?Math.max(...Zo.value.map(e=>e.count)):100);return(e,n)=>(a(),M(`div`,rc,[n[0]||=P(`<div class="col-header" data-v-8740675b><div class="title-with-info" data-v-8740675b><h3 data-v-8740675b>📊 热门兴趣标签排行</h3><div class="info-tooltip-wrapper" data-v-8740675b><span class="info-icon" data-v-8740675b>ℹ️</span><div class="tooltip-content left-align" data-v-8740675b><h4 data-v-8740675b>热门兴趣分布说明</h4><p data-v-8740675b>统计全校 1,500+ 学生中各个兴趣标签的关联频次。高频次的标签反映出校园中规模最大的主要兴趣社群，在图结构中表现为密集连接的“网络枢纽中心”；低频标签则表示冷门小众的亚文化兴趣圈。</p></div></div></div></div>`,1),C(`div`,ic,[C(`div`,ac,[(a(!0),M(A,null,i(s(Zo),(e,n)=>(a(),M(`div`,{key:e.name,class:`bar-chart-row`},[C(`span`,oc,`#`+F(n+1),1),C(`span`,{class:`bar-label`,title:e.name},F(e.name),9,sc),C(`div`,cc,[C(`div`,{class:`bar-fill`,style:p({width:e.count/t.value*100+`%`})},null,4)]),C(`span`,lc,F(e.count)+` 人`,1)]))),128))])])]))}}),[[`__scopeId`,`data-v-8740675b`]]),dc={class:`dashboard-grid-card card`},fc={class:`flex-1-scroll-no-padding`},pc={class:`log-console-fullscreen`},mc={class:`console-body`},hc={class:`line-time`},gc={class:`line-tag`},_c={class:`line-msg`},vc=e(m({__name:`SystemLogsCard`,setup(e){return(e,t)=>(a(),M(`div`,dc,[t[0]||=P(`<div class="col-header" data-v-ab7a1090><div class="title-with-info" data-v-ab7a1090><h3 data-v-ab7a1090>📟 实时图算法与沙盒操作日志</h3><div class="info-tooltip-wrapper" data-v-ab7a1090><span class="info-icon" data-v-ab7a1090>ℹ️</span><div class="tooltip-content" data-v-ab7a1090><h4 data-v-ab7a1090>操作日志说明</h4><p data-v-ab7a1090>实时滚动记录系统后台图算法的执行与沙盒环境操作进程。包含：图谱加载统计、BFS/介数中心性等图论指标的运算耗时、定向帮扶消息发送、推荐引擎计算请求，以及网络重置动作。</p></div></div></div></div>`,1),C(`div`,fc,[C(`div`,pc,[C(`div`,mc,[(a(!0),M(A,null,i(s(wr),(e,t)=>(a(),M(`div`,{key:t,class:c([`console-line`,e.type])},[C(`span`,hc,`[`+F(e.timestamp)+`]`,1),C(`span`,gc,`[`+F(e.type.toUpperCase())+`]`,1),C(`span`,_c,F(e.message),1)],2))),128))])])])]))}}),[[`__scopeId`,`data-v-ab7a1090`]]),yc={class:`dashboard-grid-card card`},bc={class:`card-scroll-body`},xc={class:`centrality-list`},Sc={class:`centrality-rank`},Cc={class:`centrality-name`},wc={class:`centrality-score`},Tc=e(m({__name:`BetweennessCentralityCard`,setup(e){return(e,t)=>(a(),M(`div`,yc,[t[0]||=P(`<div class="col-header" data-v-4aa693dd><div class="title-with-info" data-v-4aa693dd><h3 data-v-4aa693dd>🌉 跨界人脉桥梁</h3><div class="info-tooltip-wrapper" data-v-4aa693dd><span class="info-icon" data-v-4aa693dd>ℹ️</span><div class="tooltip-content left-align" data-v-4aa693dd><h4 data-v-4aa693dd>跨界沟通桥梁说明</h4><p data-v-4aa693dd>识别能够帮助跨界沟通、“连接不同圈子”的关键同学。这些同学虽然直接认识的人不一定是最多的，但由于他们跨越了不同的学科或兴趣圈子，在促进校园多元社群融合、打破人际隔阂中起着关键的纽带作用。</p></div></div></div></div>`,1),C(`div`,bc,[C(`div`,xc,[(a(!0),M(A,null,i(s(Yo).slice(0,5),(e,t)=>(a(),M(`div`,{key:e.name,class:`centrality-item`},[C(`span`,Sc,`#`+F(t+1),1),C(`span`,Cc,`👤 `+F(e.name),1),C(`span`,wc,`跨界活力: `+F(e.score),1)]))),128))])])]))}}),[[`__scopeId`,`data-v-4aa693dd`]]),Ec={class:`dashboard-grid-card card`},Dc={class:`card-scroll-body`},Oc={class:`popularity-list`},kc={class:`popularity-item-header`},Ac={class:`pop-rank`},jc=[`title`],Mc={class:`pop-interest`},Nc={class:`popularity-item-body`},Pc={class:`progress-bar-container`},Fc={class:`progress-bar-track`},Ic={class:`progress-value`},Lc=[`onClick`],Rc=e(m({__name:`PopularActivitiesCard`,setup(e){let t=O(()=>Qo.value.length?Math.max(...Qo.value.map(e=>e.count)):1),n=e=>dn.value.has(e),r=e=>{dn.value.has(e)?(dn.value.delete(e),dn.value=new Set(dn.value),$(`action`,`【推广置顶取消】已取消热门活动【${e}】的优先推荐状态`)):(dn.value.add(e),dn.value=new Set(dn.value),$(`action`,`【活动推荐置顶】成功将热门活动【${e}】设为置顶推荐，吸引更多同学报名参与`),$(`info`,`推荐引擎优化：正在为相关兴趣群体的同学们调整活动展示顺序，方便其查看该活动`)),X.value&&yn(X.value)};return(e,o)=>(a(),M(`div`,Ec,[o[0]||=P(`<div class="col-header" data-v-468de0c5><div class="title-with-info" data-v-468de0c5><h3 data-v-468de0c5>🔥 热门校园活动排行</h3><div class="info-tooltip-wrapper" data-v-468de0c5><span class="info-icon" data-v-468de0c5>ℹ️</span><div class="tooltip-content" data-v-468de0c5><h4 data-v-468de0c5>热门活动排行说明</h4><p data-v-468de0c5>展示全校学生参与度最高、最受欢迎的校园社交活动。您可以一键“置顶推荐”这些活动，使其在学生端推荐列表中优先置顶展示，以吸引更多同学报名参与。</p></div></div></div></div>`,1),C(`div`,Dc,[C(`div`,Oc,[(a(!0),M(A,null,i(s(Qo),(e,i)=>(a(),M(`div`,{key:e.name,class:`popularity-item`},[C(`div`,kc,[C(`span`,Ac,`#`+F(i+1),1),C(`span`,{class:`pop-name`,title:e.name},F(e.name),9,jc),C(`span`,Mc,F(e.interest),1)]),C(`div`,Nc,[C(`div`,Pc,[C(`div`,Fc,[C(`div`,{class:`progress-bar-fill`,style:p({width:(t.value>0?e.count/t.value*100:0)+`%`})},null,4)]),C(`span`,Ic,F(e.count)+` 人报名 / 参与`,1)]),C(`button`,{onClick:t=>r(e.name),class:c([`btn btn-xs action-btn`,n(e.name)?`btn-promoted glow-orange`:`btn-secondary glow-cyan`])},F(n(e.name)?`✓ 已置顶推荐`:`⚡ 置顶推荐`),11,Lc)])]))),128))])])]))}}),[[`__scopeId`,`data-v-468de0c5`]]),zc={class:`dashboard-grid-card card`},Bc={class:`card-scroll-body`},Vc={class:`theme-communities-donut-layout`},Hc={class:`donut-chart-container`},Uc={class:`donut-svg`,viewBox:`0 0 100 100`},Wc=[`stroke`,`stroke-dasharray`,`stroke-dashoffset`,`onMouseenter`],Gc={class:`donut-center-text`},Kc={x:`50`,y:`42`,class:`center-title`},qc={x:`50`,y:`55`,class:`center-value`},Jc={x:`50`,y:`66`,class:`center-sub`},Yc={class:`donut-legend-list`},Xc=[`onMouseenter`],Zc={class:`legend-header`},Qc={class:`legend-label`},$c={class:`legend-percentage`},el={class:`legend-details`},tl={class:`legend-deg`},nl=e(m({__name:`ThemeCommunitiesCard`,setup(e){let t=f(null),n=O(()=>$o.value.reduce((e,t)=>e+t.size,0)),r=O(()=>{let e=2*Math.PI*40,t=0;return $o.value.map(r=>{let i=n.value>0?r.size/n.value:0,a=`${e*i} ${e}`,o=-e*t;return t+=i,{...r,share:i,strokeDasharray:a,strokeDashoffset:o}})});return(e,o)=>(a(),M(`div`,zc,[o[3]||=P(`<div class="col-header" data-v-c92efd38><div class="title-with-info" data-v-c92efd38><h3 data-v-c92efd38>🔮 主题社群划分与活跃度分析</h3><div class="info-tooltip-wrapper" data-v-c92efd38><span class="info-icon" data-v-c92efd38>ℹ️</span><div class="tooltip-content left-align" data-v-c92efd38><h4 data-v-c92efd38>主题社群分析说明</h4><p data-v-c92efd38>基于运动、艺术、科技、社交四大领域类别，划分兴趣关联关系。环状图展示了各大兴趣领域学生参与人次的分布比重，指点悬停至不同区块可实时获取各社群的具体覆盖率与社交活跃度数。</p></div></div></div></div>`,1),C(`div`,Bc,[C(`div`,Vc,[C(`div`,Hc,[(a(),M(`svg`,Uc,[o[2]||=C(`circle`,{cx:`50`,cy:`50`,r:`40`,fill:`none`,stroke:`rgba(255,255,255,0.03)`,"stroke-width":`9`},null,-1),(a(!0),M(A,null,i(r.value,e=>(a(),M(`circle`,{key:e.domain,class:c([`donut-segment`,{"segment-highlighted":t.value?.domain===e.domain}]),cx:`50`,cy:`50`,r:`40`,fill:`none`,"stroke-width":`9`,stroke:e.color,"stroke-dasharray":e.strokeDasharray,"stroke-dashoffset":e.strokeDashoffset,transform:`rotate(-90 50 50)`,onMouseenter:n=>t.value=e,onMouseleave:o[0]||=e=>t.value=null,style:p({"--hover-color":e.color})},null,46,Wc))),128)),C(`g`,Gc,[C(`text`,Kc,F(t.value?t.value.label+`社群`:`主题社群`),1),C(`text`,qc,F(t.value?`👥 ${t.value.size}人`:`共 ${n.value}人次`),1),C(`text`,Jc,F(t.value?`⚡ 均度: ${t.value.avgDegree}`:`悬停查看`),1)])]))]),C(`div`,Yc,[(a(!0),M(A,null,i(r.value,e=>(a(),M(`div`,{key:e.domain,class:c([`legend-item`,{"legend-item-active":t.value?.domain===e.domain}]),onMouseenter:n=>t.value=e,onMouseleave:o[1]||=e=>t.value=null,style:p({"--theme-color":e.color})},[C(`div`,Zc,[C(`span`,{class:`legend-dot`,style:p({backgroundColor:e.color})},null,4),C(`span`,Qc,F(e.label)+`社群`,1),C(`span`,$c,F(e.percentage)+`%`,1)]),C(`div`,el,[C(`span`,null,`👥 `+F(e.size)+`人`,1),C(`span`,tl,`⚡ 均度: `+F(e.avgDegree),1)])],46,Xc))),128))])])])]))}}),[[`__scopeId`,`data-v-c92efd38`]]),rl={class:`dashboard-grid-card card`},il={class:`matrix-buttons-list`},al=e(m({__name:`MatrixDiagnosticsCard`,emits:[`open-graph`],setup(e,{emit:t}){let n=t;return(e,t)=>(a(),M(`div`,rl,[t[6]||=P(`<div class="col-header" data-v-e6b0920d><div class="title-with-info" data-v-e6b0920d><h3 data-v-e6b0920d>🧮 社交邻接矩阵分析</h3><div class="info-tooltip-wrapper" data-v-e6b0920d><span class="info-icon" data-v-e6b0920d>ℹ️</span><div class="tooltip-content left-align" data-v-e6b0920d><h4 data-v-e6b0920d>邻接关联矩阵分析</h4><p data-v-e6b0920d>通过多维网格分析，展现全校的兴趣重合度和活动参与分布。点击下方对应的分析按钮，即可在全局全屏视图下展开并深入探索数据关系。</p></div></div></div></div>`,1),C(`div`,il,[C(`button`,{onClick:t[0]||=e=>n(`open-graph`,!0,`matrix`,`student-interest`),class:`matrix-btn neon-cyan-btn`},[...t[3]||=[C(`span`,{class:`btn-left`},`👤 学生个人兴趣倾向分析`,-1),C(`span`,{class:`btn-arrow`},`➔`,-1)]]),C(`button`,{onClick:t[1]||=e=>n(`open-graph`,!0,`matrix`,`interest-cooccurrence`),class:`matrix-btn neon-orange-btn`},[...t[4]||=[C(`span`,{class:`btn-left`},`🎯 兴趣社群交叉共现分析`,-1),C(`span`,{class:`btn-arrow`},`➔`,-1)]]),C(`button`,{onClick:t[2]||=e=>n(`open-graph`,!0,`matrix`,`student-activity`),class:`matrix-btn neon-green-btn`},[...t[5]||=[C(`span`,{class:`btn-left`},`🎉 校园活动参与分布分析`,-1),C(`span`,{class:`btn-arrow`},`➔`,-1)]])])]))}}),[[`__scopeId`,`data-v-e6b0920d`]]),ol={class:`dashboard-grid-card card`},sl={class:`metrics-list`},cl={class:`metric-row`},ll={class:`metric-value text-cyan`},ul={class:`metric-row`},dl={class:`metric-value text-orange`},fl={class:`metric-row`},pl={class:`metric-value text-purple`},ml={class:`metric-row`},hl={class:`metric-value text-green`},gl=e(m({__name:`NetworkMetricsCard`,setup(e){return(e,t)=>(a(),M(`div`,ol,[t[4]||=P(`<div class="col-header" data-v-124045b3><div class="title-with-info" data-v-124045b3><h3 data-v-124045b3>📊 全局社交网络特征指标</h3><div class="info-tooltip-wrapper" data-v-124045b3><span class="info-icon" data-v-124045b3>ℹ️</span><div class="tooltip-content left-align" data-v-124045b3><h4 data-v-124045b3>图论特征指标说明</h4><p data-v-124045b3>基于当前全校学生、兴趣标签与活动参与构成的社交关系图谱，实时计算出的高阶网络拓扑指标。</p></div></div></div></div>`,1),C(`div`,sl,[C(`div`,cl,[t[0]||=P(`<div class="metric-info" data-v-124045b3><div class="metric-meta" data-v-124045b3><span class="metric-label" data-v-124045b3>🌐 全校人脉连通率</span><div class="info-tooltip-wrapper sub-tooltip" data-v-124045b3><span class="info-icon mini-icon" data-v-124045b3>?</span><div class="tooltip-content left-align" data-v-124045b3><p data-v-124045b3>非孤立节点学生占全校学生总数的比例，反映社交融入的整体水平。</p></div></div></div><span class="metric-desc" data-v-124045b3>已融入圈子学生占比</span></div>`,1),C(`span`,ll,F(s(es))+`%`,1)]),C(`div`,ul,[t[1]||=P(`<div class="metric-info" data-v-124045b3><div class="metric-meta" data-v-124045b3><span class="metric-label" data-v-124045b3>👥 平均社交距离</span><div class="info-tooltip-wrapper sub-tooltip" data-v-124045b3><span class="info-icon mini-icon" data-v-124045b3>?</span><div class="tooltip-content left-align" data-v-124045b3><p data-v-124045b3>任意两位同学在社交网中建立关联所需的平均步数（即通过兴趣/活动的间接关联跳数）。</p></div></div></div><span class="metric-desc" data-v-124045b3>全校人脉的社交分隔度</span></div>`,1),C(`span`,dl,F(s(ts))+` 步`,1)]),C(`div`,fl,[t[2]||=P(`<div class="metric-info" data-v-124045b3><div class="metric-meta" data-v-124045b3><span class="metric-label" data-v-124045b3>🔮 圈子聚集系数</span><div class="info-tooltip-wrapper sub-tooltip" data-v-124045b3><span class="info-icon mini-icon" data-v-124045b3>?</span><div class="tooltip-content left-align" data-v-124045b3><p data-v-124045b3>代表各个兴趣社群内部的抱团紧密程度，系数越高表明兴趣重叠与好友交集越深。</p></div></div></div><span class="metric-desc" data-v-124045b3>社群内部凝聚力指数</span></div>`,1),C(`span`,pl,F(s(ns)),1)]),C(`div`,ml,[t[3]||=P(`<div class="metric-info" data-v-124045b3><div class="metric-meta" data-v-124045b3><span class="metric-label" data-v-124045b3>📈 人脉网络密度</span><div class="info-tooltip-wrapper sub-tooltip" data-v-124045b3><span class="info-icon mini-icon" data-v-124045b3>?</span><div class="tooltip-content left-align" data-v-124045b3><p data-v-124045b3>实际连线数量与理论上最大可能连线数量的比值，体现关联的密集程度。</p></div></div></div><span class="metric-desc" data-v-124045b3>网络关联的紧密比例</span></div>`,1),C(`span`,hl,F(s(rs))+`%`,1)])])]))}}),[[`__scopeId`,`data-v-124045b3`]]),_l={class:`admin-dashboard fade-in`},vl={key:0,class:`dashboard-grid-layout`},yl={class:`col-1-layout`},bl={key:1,class:`dashboard-grid-skeleton`},xl=e(m({__name:`AdminDashboard`,emits:[`create-activity`,`open-graph`],setup(e,{emit:t}){let n=t,i=f(!1);return ie(()=>{setTimeout(()=>{i.value=!0,r(()=>{nn(!0),is(!0)})},350),$(`info`,`系统初始化完成，成功加载校园社交关系网图谱数据`),$(`info`,`校园社交网络载入就绪：当前共包含 ${tn.value.studentsCount} 位同学，${tn.value.interestsCount} 种不同兴趣圈子，${tn.value.activitiesCount} 个校园活动`),$(`info`,`社群活跃度分析完成：共识别出 ${tn.value.componentsCount} 个相对独立的主题社群圈子`),$(`info`,`跨界中介路径计算完成，已找出能够连接不同圈子的关键人脉纽带`),$(`info`,`待关怀学生筛查完毕：当前共有 ${Xo.value} 名尚未融入任何圈子的同学`),$(`info`,`系统状态：校园人脉推荐引擎已就绪`)}),d(X,e=>{e&&($(`query`,`管理员已调取同学【${e}】的个人网络画像，正在计算社交匹配推荐...`),$(`info`,`匹配计算完毕：成功为【${e}】找到推荐校园活动 ${Y.value.activities.length} 项，并匹配志同道合的活动搭子 ${Y.value.buddies.length} 名`))}),d(()=>q.value.size,(e,t)=>{t>0&&e!==t&&$(`action`,`校园社交网络发生动态更新，当前活跃网络总节点数：${e}`)}),(e,t)=>(a(),M(`div`,_l,[i.value?(a(),M(`div`,vl,[C(`div`,yl,[N(al,{onOpenGraph:t[0]||=(e,t,r)=>n(`open-graph`,e,t,r)}),N(Tc),N(nc),N(gl)]),N(uc),N(Ys,{onCreateActivity:t[1]||=e=>n(`create-activity`)}),N(nl),N(ks),N(Rc),N(vc)])):(a(),M(`div`,bl))]))}}),[[`__scopeId`,`data-v-5dd486aa`]]),Sl={class:`modal-card card glow-orange`},Cl={class:`modal-body`},wl={class:`form-group`},Tl={key:0,class:`error-text`},El={class:`form-group`},Dl={class:`interests-container`},Ol={class:`tags-grid`},kl=[`onClick`],Al={class:`modal-footer`},jl=[`disabled`],Ml=e(m({__name:`CreateActivityModal`,props:{visible:{type:Boolean}},emits:[`close`,`created`],setup(e,{emit:t}){let r=t,o=u({name:``,selectedInterests:[]}),l=f(``),d=ye,m=O(()=>o.name.trim().length>0&&o.selectedInterests.length>0),h=e=>{let t=o.selectedInterests.indexOf(e);t>-1?o.selectedInterests.splice(t,1):o.selectedInterests.push(e)},_=()=>{l.value=``},v=()=>{o.name=``,o.selectedInterests=[],l.value=``,r(`close`)},y=()=>{let e=o.name.trim();if(!e)return;let t=V(),n=`activity:${e}`;if(t.graph.has(n)){l.value=`⚠️ 该活动名称已存在，请输入其他名称 (Activity already exists)`;return}t.addActivity(e,o.selectedInterests),$(`action`,`【活动发布】管理员发布了新活动【${e}】，并关联了兴趣圈子【${o.selectedInterests.join(`、`)}】`),$(`info`,`关系网图谱已更新：新增活动节点【${e}】，且新建了其与相应兴趣的 ${o.selectedInterests.length} 条关联边`),r(`created`,e),v()};return(t,r)=>e.visible?(a(),M(`div`,{key:0,class:`modal-overlay fade-in`,onClick:x(v,[`self`])},[C(`div`,Sl,[C(`div`,{class:`modal-header`},[r[1]||=C(`div`,{class:`modal-title-group`},[C(`h3`,null,`📢 发布校园新活动 (Publish New Activity)`),C(`span`,{class:`modal-subtitle`},`创建新活动并分配关联的兴趣标签，学生可依据兴趣匹配和报名`)],-1),C(`button`,{onClick:v,class:`close-btn`,title:`关闭 modal`},`×`)]),C(`div`,Cl,[C(`div`,wl,[r[2]||=C(`label`,{class:`form-label`},`活动名称 (Activity Name)`,-1),n(C(`input`,{"onUpdate:modelValue":r[0]||=e=>o.name=e,type:`text`,placeholder:`例如：AI与算法竞赛沙龙、毕业季荧光夜跑...`,class:`form-input`,onInput:_},null,544),[[D,o.name]]),l.value?(a(),M(`span`,Tl,F(l.value),1)):g(``,!0)]),C(`div`,El,[r[3]||=C(`label`,{class:`form-label`},`关联兴趣圈子标签 (Select Related Interest Tags - Multi-select)`,-1),r[4]||=C(`span`,{class:`form-hint`},`学生将根据其个人兴趣画像被推荐匹配本活动`,-1),C(`div`,Dl,[(a(!0),M(A,null,i(s(d),e=>(a(),M(`div`,{key:e.key,class:`domain-group`},[C(`div`,{class:`domain-title`,style:p({color:e.color})},F(e.icon)+` `+F(e.label),5),C(`div`,Ol,[(a(!0),M(A,null,i(s(z)[e.key],t=>(a(),M(`button`,{key:t,type:`button`,class:c([`tag-chip`,{"tag-active":o.selectedInterests.includes(t),[`tag-`+e.key]:!0}]),onClick:e=>h(t)},F(t),11,kl))),128))])]))),128))])])]),C(`div`,Al,[C(`button`,{onClick:v,class:`btn btn-text`},`取消 (Cancel)`),C(`button`,{onClick:y,disabled:!m.value,class:`btn btn-primary glow-orange submit-btn`},` 🚀 确认发布活动 (Publish) `,8,jl)])])])):g(``,!0)}}),[[`__scopeId`,`data-v-f29a9747`]]),Nl={class:`modal-card card glow-orange`},Pl={class:`modal-body`},Fl={class:`form-group`},Il={key:0,class:`error-text`},Ll={class:`form-group`},Rl={class:`domains-selector`},zl=[`onClick`],Bl={class:`domain-icon`},Vl={class:`domain-text`},Hl={class:`modal-footer`},Ul=[`disabled`],Wl=e(m({__name:`CreateInterestModal`,props:{visible:{type:Boolean}},emits:[`close`,`created`],setup(e,{emit:t}){let r=t,o=u({name:``,domain:`sports`}),l=f(``),d=ye,m=O(()=>o.name.trim().length>0&&!!o.domain),h=()=>{l.value=``},_=()=>{o.name=``,o.domain=`sports`,l.value=``,r(`close`)},v=()=>{let e=o.name.trim();if(!e)return;let t=V(),n=`interest:${e}`;if(t.graph.has(n)){l.value=`⚠️ 该兴趣标签已存在，请输入其他名称 (Interest tag already exists)`;return}t.addInterestNode(e,o.domain),$(`action`,`【兴趣发布】管理员发布了新兴趣标签【${e}】，归属领域【${d.find(e=>e.key===o.domain)?.label||o.domain}】`),$(`info`,`关系网图谱已更新：新增兴趣节点【${e}】，该标签已可用于社交推荐和活动绑定`),r(`created`,e),_()};return(t,r)=>e.visible?(a(),M(`div`,{key:0,class:`modal-overlay fade-in`,onClick:x(_,[`self`])},[C(`div`,Nl,[C(`div`,{class:`modal-header`},[r[1]||=C(`div`,{class:`modal-title-group`},[C(`h3`,null,`➕ 新增校园兴趣标签 (Publish New Interest Tag)`),C(`span`,{class:`modal-subtitle`},`创建新的兴趣圈子标签，该标签可用于发布活动以及作为学生的个人兴趣选项`)],-1),C(`button`,{onClick:_,class:`close-btn`,title:`关闭 modal`},`×`)]),C(`div`,Pl,[C(`div`,Fl,[r[2]||=C(`label`,{class:`form-label`},`兴趣名称 (Interest Tag Name)`,-1),n(C(`input`,{"onUpdate:modelValue":r[0]||=e=>o.name=e,type:`text`,placeholder:`例如：三维建模、剧本杀、流行街舞...`,class:`form-input`,onInput:h},null,544),[[D,o.name]]),l.value?(a(),M(`span`,Il,F(l.value),1)):g(``,!0)]),C(`div`,Ll,[r[3]||=C(`label`,{class:`form-label`},`归属兴趣领域 (Select Domain Category)`,-1),r[4]||=C(`span`,{class:`form-hint`},`选择该兴趣归属的大类，将匹配对应的系统色调和游离连线展现`,-1),C(`div`,Rl,[(a(!0),M(A,null,i(s(d),e=>(a(),M(`button`,{key:e.key,type:`button`,class:c([`domain-btn`,{"domain-active":o.domain===e.key}]),style:p({"--hover-bg":e.color+`22`,"--hover-border":e.color,"--text-color":e.color}),onClick:t=>o.domain=e.key},[C(`span`,Bl,F(e.icon),1),C(`span`,Vl,F(e.label),1)],14,zl))),128))])])]),C(`div`,Hl,[C(`button`,{onClick:_,class:`btn btn-text`},`取消 (Cancel)`),C(`button`,{onClick:v,disabled:!m.value,class:`btn btn-primary glow-orange submit-btn`},` 🚀 确认发布标签 (Publish Tag) `,8,Ul)])])])):g(``,!0)}}),[[`__scopeId`,`data-v-bfec85f1`]]),Gl={key:0,class:`global-loading-screen`},Kl={key:0,class:`dashboard`},ql={class:`main-content`},Jl={key:0,class:`mobile-top-bar`},Yl={class:`mobile-avatar`},Xl={class:`content-grid`},Zl={class:`welcome-screen-wrap`,style:{width:`100%`,height:`100%`}},Ql={key:1,class:`card welcome-card fade-in`},$l={class:`recommendations fade-in`},eu={class:`recommendations-row`},tu={class:`rec-split-col`},nu={class:`rec-split-col`},ru={class:`rec-split-col buddy-col`},iu=_(e(m({__name:`App`,setup(e){let t=f(!0),r=f(!0),i=f(!1),o=f(!1),l=f(!1),u=f(null),p=(e,t,n)=>{let r=typeof e==`boolean`?e:void 0;u.value?.open(r,t,n)},m=()=>{u.value&&u.value.redraw()},_=()=>{r.value=!1,W.value&&G.value!==`admin`?Cn(W.value):wn()},y=()=>{wn(),r.value=!0};d(W,e=>{e||(r.value=!0)}),d([W,G],([e,t])=>{t===`student`&&e?Cn(e):wn()},{immediate:!0}),d(X,e=>{l.value=!1,G.value===`student`&&e!==W.value&&W.value&&Cn(W.value)});let x=f(330),T=0,D=0,O=null,k=null,ee=e=>{T=e.clientX,D=x.value,document.body.style.userSelect=`none`,O&&k&&(document.removeEventListener(`mousemove`,O),document.removeEventListener(`mouseup`,k));let t=e=>{let t=D+(e.clientX-T);t>=250&&t<=450&&(x.value=t)},n=()=>{document.body.style.userSelect=``,document.removeEventListener(`mousemove`,t),document.removeEventListener(`mouseup`,n),O=null,k=null};O=t,k=n,document.addEventListener(`mousemove`,t),document.addEventListener(`mouseup`,n)};return h(()=>{O&&k&&(document.removeEventListener(`mousemove`,O),document.removeEventListener(`mouseup`,k)),Z.destroy()}),ie(async()=>{await an(),qe(),Z.initialize(),nn(),W.value&&(r.value=!1),t.value=!1}),(e,d)=>t.value?(a(),M(`div`,Gl,[...d[8]||=[C(`div`,{class:`spinner`},null,-1),C(`div`,{class:`loading-text`},`正在初始化系统资源...`,-1)]])):(a(),M(A,{key:1},[N(w,{name:`fade`,mode:`out-in`},{default:E(()=>[r.value?(a(),S(en,{key:0,onSubmitted:_})):g(``,!0)]),_:1}),s(W)?(a(),M(`div`,Kl,[N(Mi,{width:x.value,class:c({"sidebar-open":l.value}),onLogout:y,onOpenGraph:p,onCreateActivity:d[0]||=e=>i.value=!0,onCreateInterest:d[1]||=e=>o.value=!0},null,8,[`width`,`class`]),l.value?(a(),M(`div`,{key:0,class:`sidebar-backdrop`,onClick:d[2]||=e=>l.value=!1})):g(``,!0),C(`div`,{class:`layout-splitter vertical-splitter`,role:`separator`,onMousedown:ee},null,32),C(`main`,ql,[s(W)?(a(),M(`div`,Jl,[C(`button`,{class:`hamburger-btn`,onClick:d[3]||=e=>l.value=!l.value,"aria-label":`打开菜单`},` ☰ `),d[9]||=C(`span`,{class:`mobile-title`},`Campus Buddy`,-1),C(`div`,Yl,F(s(G)===`admin`?`🤖`:`👤`),1)])):g(``,!0),C(`div`,Xl,[n(C(`div`,Zl,[s(G)===`admin`?(a(),S(xl,{key:0,onCreateActivity:d[4]||=e=>i.value=!0,onOpenGraph:p})):(a(),M(`div`,Ql,[C(`h2`,null,`👋 欢迎，`+F(s(W))+`！`,1),d[10]||=C(`p`,null,` 系统已分析您的多选兴趣并与 1,500+ 的校园图网络合并。点击下方按钮即可开启您的画像分析与社交推荐匹配。 `,-1),C(`button`,{onClick:d[5]||=e=>s(Cn)(s(W)),class:`btn glow-orange select-self-btn`},` 查看我的匹配推荐 `),d[11]||=C(`div`,{class:`tip-box`},[C(`strong`,null,`💡 D3.js 力导向画布提示：`),C(`p`,null,[v(` 右侧画布将渲染您的专属`),C(`b`,null,`二步关系子图 (Focal Subgraph)`),v(`，支持拖拽节点 and 滚动缩放，悬停节点可高亮连接路径。 `)])],-1)]))],512),[[re,!s(X)]]),n(C(`div`,$l,[s(G)===`student`?(a(),M(`div`,{key:0,class:`student-graph-btn-card card`,role:`button`,tabindex:`0`,onClick:p,onKeydown:b(p,[`enter`])},[...d[12]||=[P(`<div class="student-card-content" data-v-23ab0d88><span class="btn-icon" style="display:inline-flex;align-items:center;justify-content:center;" data-v-23ab0d88><svg class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" data-v-23ab0d88><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-v-23ab0d88></polygon></svg></span><span class="btn-text-content" data-v-23ab0d88>查看我的关系网络拓扑图</span></div><span class="btn-arrow" data-v-23ab0d88>➔</span>`,2)]],32)):g(``,!0),C(`div`,eu,[C(`div`,tu,[N(ia)]),C(`div`,nu,[N(xa)]),C(`div`,ru,[N(Ga,{onOpenGraphHighlight:p})])])],512),[[re,s(X)]])])]),N(qo,{ref_key:`graphModalRef`,ref:u},null,512),N(Ml,{visible:i.value,onClose:d[6]||=e=>i.value=!1,onCreated:m},null,8,[`visible`]),N(Wl,{visible:o.value,onClose:d[7]||=e=>o.value=!1,onCreated:m},null,8,[`visible`])])):g(``,!0)],64))}}),[[`__scopeId`,`data-v-23ab0d88`]]));iu.use(ne()),iu.mount(`#app`);