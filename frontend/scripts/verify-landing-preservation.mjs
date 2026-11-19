import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const base=process.argv[2]||'origin/main';
const before=p=>execFileSync('git',['show',base+':'+p],{cwd:root,maxBuffer:8*1024*1024});
const after=p=>fs.readFile(path.join(root,p));
const textEqual=(a,b)=>a.toString().replaceAll('\r\n','\n')===b.toString().replaceAll('\r\n','\n');
const routes=['','for-companies','for-vendors','for-riders','how-it-works','ada','whatsapp','proof-of-delivery','pricing','questions','book-a-demo','demo','privacy'];
for(const route of routes){const p='frontend/public/marketing/'+(route?route+'/':'')+'index.html';const a=(await after(p)).toString(),b=before(p).toString();assert.equal(a.match(/<body[\s\S]*<\/body>/)[0],b.match(/<body[\s\S]*<\/body>/)[0],'Page content changed: '+route);assert.equal(a.includes('href="/marketing/dashboard-theme.css"'),route==='','Theme escaped homepage: '+route);}
for(const file of ['delivery.js','landing-rest.js','delivery.css','human-theme.css','landing-rest.css','landing-rebuild.css']){const p='frontend/public/marketing/'+file;assert.ok(textEqual(await after(p),before(p)),'Original content/style source changed: '+file);}
for(const file of await fs.readdir(path.join(root,'frontend/public/marketing/assets'))){const p='frontend/public/marketing/assets/'+file;assert.ok((await after(p)).equals(before(p)),'Artwork changed: '+file);}
for(const file of ['Company.jsx','Vendor.jsx','Rider.jsx','AuthPages.jsx','ui.jsx','Stats.jsx']){const p='frontend/src/delivery/'+file;assert.ok(textEqual(await after(p),before(p)),'App screen or shared component changed: '+file);}
const css=(await after('frontend/public/marketing/dashboard-theme.css')).toString();
for(const file of ['Company.jsx','Vendor.jsx']){const source=(await after('frontend/src/delivery/'+file)).toString();assert.ok(source.includes('#ffffff_0%,#aad9fd_50%,#ffffff_100%'));}
assert.ok(css.includes('linear-gradient(180deg,#fff 0%,#aad9fd 50%,#fff 100%)'),'Dashboard gradient missing');
assert.ok(css.includes('--dash-card-radius:28px')&&css.includes('--dash-hero-radius:34px'),'Dashboard surface tokens missing');
console.log('PASS: all 13 page bodies, copy, links, image files, original style/interaction sources and app screens unchanged; dashboard palette applied only to homepage.');
