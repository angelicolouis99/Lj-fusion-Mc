
const ADMIN_EMAIL = "angelicolouis99@gmail.com";
const ADMIN_PWD = "angelico@louis";
const STORAGE_KEY = "ljfusion_full_final_v1";

let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  const users = [
    {id:1, full_name:"Angelico", email:ADMIN_EMAIL, role:"admin", points:2000, bonus:150000},
    {id:2, full_name:"Rija", email:"rija@ljfusion.com", role:"employee", points:1650, bonus:120000},
    {id:3, full_name:"Sarah", email:"sarah@ljfusion.com", role:"employee", points:1420, bonus:90000},
    {id:4, full_name:"Miora", email:"miora@ljfusion.com", role:"employee", points:1200, bonus:60000}
  ];
  const s = { users: users, messages:[], currentUser:null, planning: defaultPlanning() };
  saveState(s);
  return s;
}

function saveState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

window.addEventListener('load', ()=>{ document.getElementById('year').textContent=new Date().getFullYear(); setTimeout(()=>{ document.getElementById('splash').style.display='none'; document.getElementById('loginModal').style.display='flex'; document.querySelector('.app').style.display='none'; }, 800); init(); });

function init(){ wireNav(); bindActions(); renderAll(); }

function setupLogin(){ document.getElementById('loginBtn').addEventListener('click', doLogin); document.getElementById('loginPassword').addEventListener('keydown',(e)=>{ if(e.key==='Enter') doLogin(); }); document.getElementById('forgotBtn').addEventListener('click', ()=>alert('Contactez l\'administrateur pour réinitialiser.')); }

function doLogin(){ const email = document.getElementById('loginEmail').value.trim(); const pass = document.getElementById('loginPassword').value; const role = document.getElementById('loginRole').value; const err = document.getElementById('loginError'); err.textContent=''; if(!email || !pass){ err.textContent='Veuillez remplir tous les champs.'; return; } if(email===ADMIN_EMAIL && pass===ADMIN_PWD && role==='admin'){ state.currentUser = state.users.find(u=>u.role==='admin'); saveState(state); onAuthSuccess(); return; } const u = state.users.find(x=>x.email===email && x.role===role); if(u){ state.currentUser=u; saveState(state); onAuthSuccess(); return; } err.textContent='Identifiants incorrects.'; }

function onAuthSuccess(){ document.getElementById('loginModal').style.display='none'; document.querySelector('.app').style.display='flex'; document.querySelector('.modal').style.display='none'; renderAll(); alert('Connecté en tant ' + state.currentUser.full_name); }

function wireNav(){ document.querySelectorAll('.nav button').forEach(b=>{ b.addEventListener('click', ()=>{ const page=b.dataset.page; if(page==='admin' && (!state.currentUser || state.currentUser.role!=='admin')){ alert('Accès Admin seulement'); return; } showPage(page); document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); }); }); }

function renderAll(){ renderSidebar(); renderEmployees(); renderAdminTable(); renderMessages(); renderPlanning(); renderHeatmap(); renderProfile(); setupLogin(); }

function renderSidebar(){ document.getElementById('sideUser').textContent = state.currentUser ? state.currentUser.full_name : 'Non connecté'; }

function renderEmployees(){ const ul=document.getElementById('employeeList'); ul.innerHTML=''; state.users.forEach(u=>{ const li=document.createElement('li'); li.innerHTML=`<div><strong>${u.full_name}</strong><div class="muted">${u.email}</div></div><div><span class="muted">${u.role}</span></div>`; ul.appendChild(li); }); document.getElementById('statEmployees').textContent = state.users.length; document.getElementById('statBonus').textContent = (state.users.reduce((s,x)=>s+(x.bonus||0),0)).toLocaleString() + ' Ar'; }

function renderAdminTable(){ const tbody=document.getElementById('adminTable'); tbody.innerHTML=''; state.users.forEach(u=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${u.full_name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.points}</td><td>${(u.bonus||0).toLocaleString()}</td><td><button class="btn" onclick="editUser(${u.id})">Edit</button> <button class="btn ghost" onclick="deleteUser(${u.id})">Delete</button></td>`; tbody.appendChild(tr); }); }

function renderMessages(){ const box=document.getElementById('messages'); box.innerHTML=''; state.messages.forEach(m=>{ const u=state.users.find(x=>x.id===m.senderId)||{full_name:'User'}; const div=document.createElement('div'); div.className='msg'+(state.currentUser && m.senderId===state.currentUser.id?' me':''); div.innerHTML=`<div><strong>${u.full_name}</strong>: ${escapeHtml(m.content)}</div><div class='meta'>${new Date(m.created_at).toLocaleTimeString()}</div>`; box.appendChild(div); }); box.scrollTop = box.scrollHeight; }

function defaultPlanning(){ const days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']; return days.map((d,i)=>({day:i,name:d,start:'08:00',end:'19:00'})); }

function renderPlanning(){ const tbody=document.getElementById('planningTable'); tbody.innerHTML=''; state.planning.forEach(p=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name}</td><td>${p.start} → ${p.end}</td>`; tbody.appendChild(tr); }); }

function renderHeatmap(){ const grid=document.getElementById('heatGrid'); grid.innerHTML=''; state.planning.forEach((p,i)=>{ const div=document.createElement('div'); div.className='heat-cell'; if(i%3===0) div.style.background='linear-gradient(180deg,#2fa84a,#2ea043)', div.innerHTML=`${p.name}<br><small>Présent</small>`; else if(i%3===1) div.style.background='linear-gradient(180deg,#ffb84d,#ff8c00)', div.innerHTML=`${p.name}<br><small>Late</small>`; else div.style.background='linear-gradient(180deg,#ff6b6b,#d23c3c)', div.innerHTML=`${p.name}<br><small>Absent</small>`; grid.appendChild(div); }); }

function renderProfile(){ if(state.currentUser){ document.getElementById('profileName').textContent = state.currentUser.full_name; document.getElementById('profileRole').textContent = state.currentUser.role; document.getElementById('profileAvatar').textContent = state.currentUser.full_name.split(' ').map(n=>n[0]).slice(0,2).join(''); } else { document.getElementById('profileName').textContent='—'; document.getElementById('profileRole').textContent='—'; } }

function bindActions(){ document.getElementById('sendBtn')?.addEventListener('click', ()=>{ sendChat(); }); document.getElementById('chatText')?.addEventListener('keydown',(e)=>{ if(e.key==='Enter') sendChat(); }); document.getElementById('btnAddEmp')?.addEventListener('click', ()=>{ if(!checkAdmin()) return; const full=prompt('Nom complet:'); if(!full) return; const email=prompt('Email:'); if(!email) return; const id=Date.now(); state.users.push({id,full_name:full,email,role:'employee',points:0,bonus:0}); saveState(state); renderAll(); alert('Employé ajouté.'); }); document.getElementById('btnExportUsers')?.addEventListener('click', ()=>{ if(!checkAdmin()) return; const rows=[['id','full_name','email','role','points','bonus']]; state.users.forEach(u=>rows.push([u.id,u.full_name,u.email,u.role,u.points,u.bonus])); const csv=rows.map(r=>r.join(',')) .join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='users.csv'; a.click(); }); document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ logout(); }); document.getElementById('saveSettings')?.addEventListener('click', ()=>{ if(!checkAdmin()) return; const p=document.getElementById('newPass').value.trim(); if(!p) return alert('Entrez un nouveau mot de passe'); alert('Mot de passe (demo) mis à jour pour la session.'); }); document.getElementById('searchInput')?.addEventListener('input', function(){ const q=this.value.toLowerCase(); document.querySelectorAll('.employee-list li').forEach(li=>{ li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }); }

function sendChat(){ const txt=document.getElementById('chatText').value.trim(); if(!txt) return; if(!state.currentUser){ alert('Veuillez vous connecter'); return; } const m={id:Date.now(),room:'general',senderId:state.currentUser.id,content:txt,created_at:new Date().toISOString()}; state.messages.push(m); saveState(state); renderMessages(); document.getElementById('chatText').value=''; }

function editUser(id){ if(!checkAdmin()) return; const u=state.users.find(x=>x.id===id); if(!u) return; const name=prompt('Nom complet',u.full_name); if(name) u.full_name=name; saveState(state); renderAll(); }
function deleteUser(id){ if(!checkAdmin()) return; if(!confirm('Supprimer cet employé ?')) return; state.users=state.users.filter(x=>x.id!==id); saveState(state); renderAll(); }

function logout(){ state.currentUser=null; saveState(state); document.getElementById('loginModal').style.display='flex'; document.querySelector('.app').style.display='none'; }

function checkAdmin(){ if(!state.currentUser || state.currentUser.role!=='admin'){ alert('Action réservée aux admins'); return false; } return true; }

function showPage(page){ const pages=['home','admin','employee','messages','planning','profil','settings']; pages.forEach(p=> document.getElementById('page-'+p)?.classList.add('hidden')); const el=document.getElementById('page-'+page); if(el) el.classList.remove('hidden'); }

function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

window.addEventListener('DOMContentLoaded', ()=>{ init(); });
