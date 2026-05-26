const API_ROOT = 'https://pokeapi.co/api/v2';

const el = (id) => document.getElementById(id);
const listEl = el('list');
const detailEl = el('detail');
const detailContent = el('detailContent');

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('Gagal memuat');
  return res.json();
}

async function loadInitial(limit=20){
  listEl.innerHTML = '<p class="muted">Memuat daftar...</p>';
  try{
    const data = await fetchJSON(`${API_ROOT}/pokemon?limit=${limit}`);
    const promises = data.results.map(r=>fetchJSON(r.url));
    const pokes = await Promise.all(promises);
    renderList(pokes);
  }catch(err){
    listEl.innerHTML = `<p class="muted">Error: ${err.message}</p>`;
  }
}

function renderList(pokes){
  listEl.innerHTML = '';
  pokes.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.sprites.other['official-artwork'].front_default || p.sprites.front_default}" alt="${p.name}" />
      <div class="name">${p.name}</div>
      <div class="types">${p.types.map(t=>`<div class="type">${t.type.name}</div>`).join('')}</div>
    `;
    card.addEventListener('click',()=> showDetail(p));
    listEl.appendChild(card);
  });
}

function showDetail(p){
  detailContent.innerHTML = `
    <h2 style="text-transform:capitalize">${p.name} <span class="muted">#${p.id}</span></h2>
    <img src="${p.sprites.other['official-artwork'].front_default || p.sprites.front_default}" style="width:180px;height:180px;display:block;margin:10px auto;object-fit:contain" />
    <div class="muted">Tipe</div>
    <div style="display:flex;gap:8px;margin:8px 0">${p.types.map(t=>`<div class="type">${t.type.name}</div>`).join('')}</div>
    <div class="muted">Stat</div>
    <div>${p.stats.map(s=>`<div class="stat"><div>${s.stat.name}</div><div>${s.base_stat}</div></div>`).join('')}</div>
  `;
  detailEl.classList.remove('hidden');
}

async function search(q){
  if(!q) return loadInitial();
  listEl.innerHTML = '<p class="muted">Mencari...</p>';
  try{
    const data = await fetchJSON(`${API_ROOT}/pokemon/${q.toLowerCase()}`);
    renderList([data]);
  }catch(err){
    listEl.innerHTML = `<p class="muted">Tidak ditemukan: ${q}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  el('btnSearch').addEventListener('click', ()=> search(el('search').value.trim()));
  el('search').addEventListener('keydown', (e)=>{if(e.key==='Enter') search(el('search').value.trim())});
  el('btnReload').addEventListener('click', ()=> loadInitial());
  el('closeDetail').addEventListener('click', ()=> detailEl.classList.add('hidden'));
  loadInitial(24);
});
