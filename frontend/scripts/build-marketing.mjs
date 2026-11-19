import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const output='public/marketing';
const pages=['/','/for-companies','/for-vendors','/for-riders','/how-it-works','/ada','/whatsapp','/proof-of-delivery','/pricing','/questions','/book-a-demo','/demo','/privacy'];
const titles={'/':'Every delivery, live for everyone','/for-companies':'Your logistics operation, connected','/for-vendors':'Your goods. Your view.','/for-riders':'A clearer day on the road','/ada':'Meet Ada, your dispatch assistant','/whatsapp':'Keep the chat. Connect the work.','/proof-of-delivery':'Proof everyone can see','/pricing':'Pricing for your operation','/how-it-works':'How a day runs on Ada','/book-a-demo':'A demo around your delivery day'};
const head=(route)=>`<!DOCTYPE html><html lang="en-NG" data-marketing-route="${route}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="${route==='/'?'#ffffff':'#05061a'}"><title>${titles[route]||'Ada'} — Ada</title><meta name="description" content="Ada connects your logistics company, vendors and dispatch riders. Plan with Ada. Track stock. Confirm doorstep proof. Keep every naira on record."><link rel="icon" href="data:,"><meta property="og:title" content="Every delivery, live for everyone. — Ada"><meta property="og:description" content="Your office. Your vendors. Your riders. One connected day, with Ada taking the dispatch off your hands."><link rel="preload" href="/marketing/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/marketing/delivery.css"><link rel="stylesheet" href="/marketing/human-theme.css"><link rel="stylesheet" href="/marketing/landing-rest.css"><link rel="stylesheet" href="/marketing/landing-rebuild.css">${route==='/'?'<link rel="stylesheet" href="/marketing/dashboard-theme.css">':''}<script src="/marketing/site-config.js" defer></script><script src="/marketing/landing-rest.js" defer></script><script src="/marketing/delivery.js" defer></script></head><body><div id="app"></div><noscript><main style="font:20px/1.6 Arial;max-width:700px;margin:80px auto;padding:25px"><h1>Every delivery, live for everyone.</h1><p>Ada connects Nigerian logistics companies, vendors and dispatch riders with Ada, stock tracking, doorstep proof and payment records.</p><p>This interactive site needs JavaScript to display its product demos and navigation.</p></main></noscript></body></html>`;
const source=(await fs.readFile('public/marketing/landing-rest.js','utf8'))+'\n'+(await fs.readFile('public/marketing/delivery.js','utf8'));
const config=await fs.readFile('public/marketing/site-config.js','utf8');
for(const route of pages){
 const app={innerHTML:''},meta={content:''};
 const document={documentElement:{dataset:{marketingRoute:route}},title:'',body:{className:''},getElementById:()=>app,querySelector:()=>meta,querySelectorAll:()=>[],addEventListener:()=>{}};
 const window={addEventListener:()=>{}};
 const context={document,window,location:{origin:"https://ada.invalid",pathname:route,search:''},localStorage:{getItem:()=>null,setItem:()=>{}},URLSearchParams,URL,console,setTimeout,clearTimeout,Date,Blob};
 vm.runInNewContext(config+'\n'+source,context,{timeout:3000});
 if(app.innerHTML.includes('${'))throw Error('Unexpanded template expression: '+route);
 const markup=app.innerHTML.replaceAll("https://ada.invalid", "").replace(/href="(\/(?:signin|signup\/company|join)(?:[/?][^\"]*)?)"/g,'href="$1"');
 let html=head(route).replace('<body><div id="app"></div>',`<body class="${document.body.className}"><div id="app">${markup}</div>`);
 html=html.replace(/<title>.*?<\/title>/,`<title>${document.title}</title>`);
 html=html.replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript><p style="padding:20px;text-align:center">Interactive product demos require JavaScript. All marketing content and links remain available.</p></noscript>');
 const dir=path.join(output,route);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),html);
}
console.log(`Built ${pages.length} Ada marketing routes.`);
