function projectCard(p) {
  const a = document.createElement('a'); a.className = 'card'; a.href = 'project.html?id=' + encodeURIComponent(p.id);
  const thumb = document.createElement('div'); thumb.className = 'thumb';
  const img = document.createElement('img'); img.src = p.cover; img.alt = p.title + ' — TwinLine project'; img.loading = 'lazy'; thumb.append(img);
  const meta = document.createElement('div'); meta.className = 'meta';
  const label = document.createElement('p'); label.className = 'sub'; label.textContent = 'EXTERIOR / ' + (p.location || 'PROJECT GALLERY');
  const title = document.createElement('h3'); title.className = 'title'; title.textContent = p.title;
  const link = document.createElement('span'); link.className = 'card-link'; link.textContent = 'View project →'; meta.append(label,title,link); a.append(thumb,meta); return a;
}
const featured = document.getElementById('featured');
if (featured) PROJECTS.filter(p=>p.published!==false).slice(0,3).forEach(p => featured.append(projectCard(p)));
const grid = document.getElementById('projectsGrid');
if (grid) {
  const filters = document.getElementById('categoryFilters');
  const choices = [{id:'all',title:'All work'}, ...CATEGORIES];
  choices.forEach(c => { const button=document.createElement('button'); button.type='button'; button.textContent=c.title; button.dataset.category=c.id; button.setAttribute('aria-pressed','false'); button.addEventListener('click',()=>selectCategory(c.id,true)); filters.append(button); });
  function selectCategory(id,updateURL=false) {
    if (!choices.some(c=>c.id===id)) id='all';
    const projects=PROJECTS.filter(p=>p.published!==false&&(id==='all'||(p.categories||[]).includes(id)));
    grid.replaceChildren(...projects.map(projectCard));
    filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===id)));
    document.getElementById('projectCount').textContent=projects.length+' project '+(projects.length===1?'gallery':'galleries');
    const empty=document.getElementById('emptyCategory'); empty.hidden=projects.length>0;
    if (!projects.length) {document.getElementById('emptyTitle').textContent=choices.find(c=>c.id===id).title; document.getElementById('emptyQuote').href='free-estimate.html?service='+encodeURIComponent(id);}
    if(updateURL){const url=new URL(location.href); if(id==='all')url.searchParams.delete('category');else url.searchParams.set('category',id);history.pushState({},'',url);}
  }
  document.getElementById('resetFilters').addEventListener('click',()=>selectCategory('all',true));
  window.addEventListener('popstate',()=>selectCategory(new URLSearchParams(location.search).get('category')));
  selectCategory(new URLSearchParams(location.search).get('category'));
}
