import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';
const root=fileURLToPath(new URL('../../',import.meta.url));
const base=process.argv[2]||'origin/main';
const before=p=>execFileSync('git',['show',base+':'+p],{cwd:root,maxBuffer:8*1024*1024});
const after=p=>fs.readFile(path.join(root,p));
const equalText=(a,b)=>a.toString().replaceAll('\r\n','\n')===b.toString().replaceAll('\r\n','\n');
const routes=['','for-companies','for-vendors','for-riders','how-it-works','ada','whatsapp','proof-of-delivery','pricing','questions','book-a-demo','demo','privacy'];
let targets=0;
for(const route of routes){
 const p='frontend/public/marketing/'+(route?route+'/':'')+'index.html';const a=(await after(p)).toString(),b=before(p).toString();const current=new JSDOM(a).window.document,original=new JSDOM(b).window.document;
 const text=d=>d.body.textContent.replace(/\s+/g,' ').trim();assert.equal(text(current),text(original),'Visible copy changed: '+route);
 assert.deepEqual([...current.querySelectorAll('a')].map(x=>x.getAttribute('href')),[...original.querySelectorAll('a')].map(x=>x.getAttribute('href')),'Links changed: '+route);
 assert.deepEqual([...current.querySelectorAll('form')].map(x=>x.id),[...original.querySelectorAll('form')].map(x=>x.id),'Form hooks changed: '+route);
 assert.equal(current.querySelectorAll('h1').length,1,'Heading structure: '+route);
 assert.ok(a.includes('/marketing/dashboard-theme.css'),'Missing shared theme: '+route);
 assert.ok(!/delivery-(?:campaign|office|rider)\.webp/.test(a),'Photographic image remains: '+route);
 if(!route)assert.equal(a.match(/<body[\s\S]*<\/body>/)[0],b.match(/<body[\s\S]*<\/body>/)[0],'Homepage markup changed');
 for(const img of current.querySelectorAll('img[src^="/marketing/"]')){assert.ok(img.alt,'Missing image alt text');assert.ok(await fs.stat(path.join(root,'frontend/public',img.getAttribute('src'))).catch(()=>false),'Missing '+img.src);targets++;}
 for(const a of current.querySelectorAll('a[href^="#"]'))assert.ok(current.getElementById(a.getAttribute('href').slice(1)),'Missing anchor '+a.href);
}
for(const file of ['landing-rest.js','delivery.css','human-theme.css','landing-rest.css','landing-rebuild.css']){const p='frontend/public/marketing/'+file;assert.ok(equalText(await after(p),before(p)),'Protected homepage source changed: '+file);}
for(const file of ['delivery-illustration.webp','delivery-day-ada.webp','delivery-day-rider.webp','delivery-day-stock.webp','delivery-parcel-mascot.webp']){const p='frontend/public/marketing/assets/'+file;assert.ok((await after(p)).equals(before(p)),'Homepage artwork changed: '+file);}
for(const file of ['Company.jsx','Vendor.jsx','Rider.jsx','ui.jsx','Stats.jsx']){const p='frontend/src/delivery/'+file;assert.ok(equalText(await after(p),before(p)),'Operational app source changed: '+file);}
console.log('PASS: 13 pages keep visible copy, links and form hooks; homepage markup/artwork and operational dashboards preserved; shared theme, cartoons, headings, anchors and '+targets+' image targets verified.');
