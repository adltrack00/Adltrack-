import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import Setup from './Setup';
import {useWorkspace} from './store';
jest.mock('./store',()=>({useWorkspace:jest.fn()}));
global.IS_REACT_ACT_ENVIRONMENT=true;
let container,root,go,save;
beforeEach(()=>{container=document.createElement('div');document.body.append(container);root=createRoot(container);go=jest.fn();save=jest.fn();useWorkspace.mockReturnValue({state:{company:{name:'Swift',dispatcher:'Jane',zones:['Ikeja']}},act:save});});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();});
const click=async b=>act(async()=>b.click());
const next=()=>click(container.querySelector('.ada-setup-next button'));
const choose=t=>click([...container.querySelectorAll('button')].find(b=>b.textContent.trim()===t));
const fill=async(index,value)=>act(async()=>{const input=container.querySelectorAll('input')[index];Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});
test('cartoon onboarding preserves validation, company details, choices and setup completion',async()=>{
 await act(async()=>root.render(<Setup go={go}/>));
 for(const image of ['delivery-illustration.webp','delivery-day-ada.webp','delivery-journey.webp','delivery-planning.webp']){expect(container.querySelector('.ada-setup-art').getAttribute('src')).toContain(image);await next();}
 await fill(0,'New Logistics');await fill(1,'Ada Lead');await next();
 expect(container.querySelector('.ada-setup-next button').disabled).toBe(true);await choose('Fashion & shoes');await next();
 await choose('WhatsApp messages');await next();await choose('Good');await next();
 await next();await choose('Lekki');await next();
 expect(container.querySelector('.ada-setup-art').src).toContain('delivery-day-ada.webp');await choose('Skip');
 const mint=[...container.querySelectorAll('.ada-entry-themes button')].find(b=>b.textContent==='Mint');await click(mint);expect(mint.getAttribute('aria-pressed')).toBe('true');await next();
 expect(save).toHaveBeenCalledWith({type:'company/update',patch:expect.objectContaining({name:'New Logistics',dispatcher:'Ada Lead',deliver:'Fashion & shoes',intake:'WhatsApp messages',volume:1,zones:['Ikeja','Lekki'],theme:'mint',setupDone:true})});expect(go).toHaveBeenCalledWith('/company');
});
