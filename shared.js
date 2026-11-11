document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#year').forEach(el=>el.textContent=new Date().getFullYear());
  const values={'data-company':SITE_CONFIG.companyName,'data-tagline':SITE_CONFIG.tagline,'data-service-area':SITE_CONFIG.serviceArea,'data-address':SITE_CONFIG.addressLine};
  Object.entries(values).forEach(([key,value])=>document.querySelectorAll('['+key+']').forEach(el=>el.textContent=value));
  document.querySelectorAll('[data-email]').forEach(el=>{el.textContent=SITE_CONFIG.email;el.href='mailto:'+SITE_CONFIG.email;});
  document.querySelectorAll('[data-phone]').forEach(el=>{el.textContent=SITE_CONFIG.phoneDisplay;el.href='tel:'+SITE_CONFIG.phoneTel;});
  const overlay=document.getElementById('menuOverlay'),button=document.getElementById('menuBtn'),close=document.getElementById('menuClose');
  function setMenu(open){if(!overlay)return;overlay.classList.toggle('show',open);overlay.inert=!open;overlay.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':'';if(open)close.focus();else button.focus();}
  if(button)button.addEventListener('click',()=>setMenu(true));
  if(close)close.addEventListener('click',()=>setMenu(false));
  if(overlay){overlay.addEventListener('click',e=>{if(e.target===overlay)setMenu(false);});overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);return;}if(e.key==='Tab'){const nodes=[...overlay.querySelectorAll('a,button')];const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});}
  window.addEventListener('resize',()=>{if(window.innerWidth>1000&&overlay?.classList.contains('show'))setMenu(false);});
});
