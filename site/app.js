(() => {
  'use strict';
  const D = window.FORM_DATA;
  const lang = Object.hasOwn(D.copy, document.documentElement.lang) ? document.documentElement.lang : 'hy';
  const C = D.copy[lang];
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => value[lang];
  const money = n => `${C.from} ${new Intl.NumberFormat(lang === 'hy' ? 'hy-AM' : lang).format(n)} AMD`;
  const track = (name, props) => window.FORM_INTEGRATIONS.track(name, props);
  const options = [...D.services.map(s => ({...s,kind:'service'})), ...D.packages.map(s => ({...s,kind:'package'}))];
  $$('[data-copy]').forEach(el => { el.textContent = C[el.dataset.copy]; });
  $$('[data-nav]').forEach(el => { el.textContent = C.nav[Number(el.dataset.nav)]; });
  $('#heroTitle').innerHTML = C.hero.map(line => `<span>${esc(line)}</span>`).join('');
  $(`[data-lang="${lang}"]`).setAttribute('aria-current', 'page');

  const navigation = $('#navigation');
  const menu = $('.menu');
  function closeMenu() { navigation.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open',open);
  });
  $$('.nav a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.header')) closeMenu();});

  // Carry the current visible section to the other language. Form contents intentionally stay local to this page.
  const sections = $$('main section[id]');
  function currentSection() {
    let id = '';
    for(const section of sections) if(section.getBoundingClientRect().top <= window.innerHeight*.45) id=section.id;
    return id;
  }
  $$('[data-lang]').forEach(link => {
    link.addEventListener('click',()=>{
      const id=currentSection() || location.hash.slice(1); const url=new URL(link.href);
      url.hash=id; link.href=url.href;
    });
  });
  $('#goalGrid').innerHTML = C.goals.map((name,i)=>`<a class="goal-link" href="#services" data-goal="${i}"><b>0${i+1} ↗</b><strong>${esc(name)}</strong><small>${esc(C.goalNotes[i])}</small></a>`).join('');
  $('#serviceList').innerHTML=D.services.map((s,i)=>`<article class="service" id="service-${s.id}"><div class="service-num">0${i+1}</div><div><h3>${esc(text(s.name))}</h3><small>${esc(C.suitable)}</small><p>${esc(text(s.who))}</p></div><div class="service-scope"><small>${esc(C.included)}</small><p>${esc(text(s.scope))}</p></div><div class="service-price"><strong>${money(s.price)}</strong><p>${esc(text(s.time))}</p><a class="text-link" href="#request" data-estimate="${s.id}" data-source="service">${esc(C.ask)} ↗</a></div></article>`).join('');
  const categories=['all',...new Set(D.works.map(w=>w.category))];
  $('#filters').innerHTML=categories.map(id=>`<button class="filter" data-filter="${id}" aria-pressed="${id==='all'}" type="button">${esc(id==='all'?C.all:text(D.services.find(s=>s.id===id).name))}</button>`).join('');
  $('#workGrid').innerHTML=D.works.map(w=>`<figure class="work-card" data-category="${w.category}"><img src="assets/${w.image}" alt="${esc(w.car)} · ${esc(C.stock)}" loading="lazy" width="1000" height="700"><figcaption><h3>${esc(w.car)}</h3><p><strong>${esc(C.workTask)}:</strong> ${esc(text(w.task))}</p><p><strong>${esc(C.workDone)}:</strong> ${esc(text(w.scope))}</p><small>${esc(C.stock)}</small></figcaption></figure>`).join('');
  $$('.filter').forEach(button=>button.addEventListener('click',()=>{
    $$('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    $$('.work-card').forEach(card=>{card.hidden=button.dataset.filter!=='all' && card.dataset.category!==button.dataset.filter;});
    track('gallery_filter',{category:button.dataset.filter});
  }));
  $('#packageList').innerHTML=D.packages.map(p=>`<article class="package"><h3>${esc(text(p.name))}</h3><p>${esc(text(p.scope))}</p><strong>${money(p.price)}</strong><a class="button" href="#request" data-estimate="${p.id}" data-source="package">${esc(C.ask)} ↗</a></article>`).join('');
  $('#processList').innerHTML=C.process.map((name,i)=>`<li><b>0${i+1}</b><h3>${esc(name)}</h3><p>${esc(C.processNotes[i])}</p></li>`).join('');
  $('#principles').innerHTML=C.principles.map(([title,body])=>`<article class="principle"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('');
  $('#faqList').innerHTML=C.faq.map(([q,a])=>`<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');

  const wizard=$('#wizard');
  const initial=()=>({step:0,option:'',brand:'',model:'',body:'',comment:'',name:'',phone:'',method:'',photos:[]});
  let state=initial();
  let busy=false,photoCounter=0;
  const selected=()=>options.find(o=>o.id===state.option);
  const optionName=()=>state.option==='consult'?C.consult:selected()?text(selected().name):'';
  function field(name,label,type='text',max=80){return `<div class="field"><label class="field-label" for="${name}">${esc(label)}</label><input class="control" id="${name}" name="${name}" type="${type}" value="${esc(state[name])}" maxlength="${max}" ${name==='name'?'autocomplete="name"':name==='phone'?'autocomplete="tel" inputmode="tel"':''} aria-describedby="error-${name}" required><p class="error" id="error-${name}"></p></div>`;}
  function select(name,label,values){return `<div class="field"><label class="field-label" for="${name}">${esc(label)}</label><select class="control" id="${name}" name="${name}" aria-describedby="error-${name}" required><option value="">${esc(C.choose)}</option>${values.map((value,i)=>`<option value="${i}" ${state[name]===String(i)?'selected':''}>${esc(value)}</option>`).join('')}</select><p class="error" id="error-${name}"></p></div>`;}
  function photoMarkup(removable){return state.photos.map((photo,i)=>`<figure class="photo-preview"><img src="${photo.url}" alt="${esc(C.photos)} ${i+1}">${removable?`<button type="button" data-remove="${photo.id}" aria-label="${esc(C.remove)} ${i+1}">${esc(C.remove)} ×</button>`:''}</figure>`).join('');}
  function reviewMarkup(){
    const rows=[[C.request,optionName()],[C.car,`${state.brand} ${state.model} · ${C.bodies[Number(state.body)]}`],[C.comment,state.comment||C.noComment],[C.name,state.name],[C.phone,state.phone],[C.method,C.methods[Number(state.method)]],[C.photoTotal,String(state.photos.length)]];
    if(selected()){rows.splice(1,0,[C.included,text(selected().scope)]);rows.push([C.priceNote,money(selected().price)]);}
    return `<h3 tabindex="-1">${esc(C.reviewTitle)}</h3><dl class="review">${rows.map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><div class="photo-grid">${photoMarkup(false)}</div><p class="hint">${esc(C.reviewNote)}</p>`;
  }
  function stageMarkup(){
    if(state.step===0)return `<h3 tabindex="-1">${esc(C.serviceLabel)}</h3><fieldset class="choices" aria-describedby="error-option"><legend class="sr-only">${esc(C.serviceLabel)}</legend>${[{id:'consult',name:{[lang]:C.consult}},...options].map(o=>`<label class="choice"><input type="radio" name="option" value="${o.id}" ${state.option===o.id?'checked':''}><span>${esc(text(o.name))}${o.price?`<small>${money(o.price)}${o.kind==='package'?' · '+esc(C.package):''}</small>`:''}</span></label>`).join('')}</fieldset><p class="error" id="error-option"></p>`;
    if(state.step===1)return `<h3 tabindex="-1">${esc(C.carTitle)}</h3><div class="fields">${field('brand',C.brand)}${field('model',C.model)}${select('body',C.body,C.bodies)}</div>`;
    if(state.step===2)return `<h3 tabindex="-1">${esc(C.taskTitle)}</h3><label class="field-label" for="comment">${esc(C.comment)}</label><p class="hint" id="commentHint">${esc(C.commentHint)}</p><textarea class="control" id="comment" name="comment" maxlength="2000" aria-describedby="commentHint error-comment">${esc(state.comment)}</textarea><p class="error" id="error-comment"></p><div class="upload"><label class="field-label" for="photos">${esc(C.photos)}</label><p class="hint" id="photoHint">${esc(C.photoHint)}</p><input id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="photoHint photo-error"><p class="error" id="photo-error" role="status"></p><div class="photo-grid" id="photoGrid">${photoMarkup(true)}</div></div>`;
    if(state.step===3)return `<h3 tabindex="-1">${esc(C.contactsTitle)}</h3><div class="fields">${field('name',C.name,'text',100)}${field('phone',C.phone,'tel',30)}${select('method',C.method,C.methods)}</div>`;
    return reviewMarkup();
  }
  function focusHeading(){const heading=$('h3',wizard);heading?.focus({preventScroll:true});}
  function render(focus=false){
    if(state.step===5){wizard.innerHTML=`<div class="success"><div class="success-mark" aria-hidden="true">✓</div><h3 tabindex="-1">${esc(C.complete)}</h3><p>${esc(C.completeText)}</p><button class="button" type="button" data-action="reset">${esc(C.reset)}</button></div>`;if(focus)focusHeading();return;}
    wizard.innerHTML=`<ol class="wizard-progress">${C.steps.map((name,i)=>`<li ${i===state.step?'aria-current="step"':''} class="${i<state.step?'done':''}">${esc(name)}</li>`).join('')}</ol><p class="step-count">${esc(C.progress)} ${state.step+1} ${esc(C.of)} 5</p><form novalidate id="estimateForm">${stageMarkup()}<div class="wizard-actions">${state.step?`<button class="button secondary" type="button" data-action="back">${esc(C.back)}</button>`:'<span></span>'}<button class="button" type="submit">${esc(state.step===4?C.confirm:C.next)} ↗</button></div></form>`;
    $('#estimateForm').addEventListener('submit',next);
    if(focus)focusHeading();
  }
  function sync(){for(const key of ['brand','model','body','comment','name','phone','method']){const input=$(`[name="${key}"]`,wizard);if(input)state[key]=input.value;}}
  function error(name,message){const el=$('#error-'+name,wizard);if(el)el.textContent=message;const control=$(`[name="${name}"]`,wizard);control?.setAttribute('aria-invalid',String(Boolean(message)));}
  function validate(){
    let valid=true,first='';const check=(name,condition,message)=>{error(name,condition?'':message);if(!condition){valid=false;first ||= name;}};
    if(state.step===0)check('option',state.option==='consult'||Boolean(selected()),C.serviceError);
    if(state.step===1){for(const key of ['brand','model'])check(key,Boolean(state[key].trim())&&state[key].length<=80,C.required);check('body',C.bodies[Number(state.body)]!==undefined&&state.body!=='',C.selectError);}
    if(state.step===2)check('comment',state.comment.length<=2000,C.lengthError);
    if(state.step===3){check('name',state.name.trim().length>=2&&state.name.length<=100,C.required);check('phone',/^\+?[\d\s().-]{8,30}$/.test(state.phone.trim())&&state.phone.replace(/\D/g,'').length>=8&&state.phone.replace(/\D/g,'').length<=15,C.phoneError);check('method',state.method!==''&&C.methods[Number(state.method)]!==undefined,C.selectError);}
    if(!valid)$(`[name="${first}"]`,wizard)?.focus();return valid;
  }
  async function next(event){
    event.preventDefault();if(busy)return;sync();if(!validate())return;
    if(state.step===4){busy=true;const button=$('[type="submit"]',wizard);button.disabled=true;
      try{const result=await window.FORM_INTEGRATIONS.submit();if(result.mode!=='demo'||result.sent!==false)throw new Error('Unexpected demo integration result');state.step=5;track('demo_request_complete',{option:state.option});render(true);}finally{busy=false;button.disabled=false;}
    }else{state.step++;track('form_step',{step:state.step+1,option:state.option||'none'});render(true);}
  }
  function releasePhotos(){state.photos.forEach(p=>URL.revokeObjectURL(p.url));}
  async function addPhotos(files){
    busy=true;const errors=[];const submit=$('[type="submit"]',wizard);submit.disabled=true;
    try{
      for(const file of files){
        if(!['image/jpeg','image/png','image/webp'].includes(file.type)){errors.push(`${file.name}: ${C.photoInvalid}`);continue;}
        if(file.size>10*1024*1024){errors.push(`${file.name}: ${C.photoSize}`);continue;}
        if(state.photos.length>=5){errors.push(C.photoCount);break;}
        const url=URL.createObjectURL(file);
        try{const image=new Image();image.src=url;await image.decode();state.photos.push({id:++photoCounter,file,url});}
        catch{URL.revokeObjectURL(url);errors.push(`${file.name}: ${C.photoBroken}`);}
      }
      $('#photoGrid').innerHTML=photoMarkup(true);$('#photo-error').textContent=errors.join(' ');$('#photos').value='';
    }finally{busy=false;submit.disabled=false;}
  }
  wizard.addEventListener('input',sync);
  wizard.addEventListener('change',event=>{
    if(event.target.name==='option')state.option=event.target.value;
    else if(event.target.id==='photos'&&!busy)addPhotos([...event.target.files]);
    else sync();
  });
  wizard.addEventListener('click',event=>{
    if(busy)return;
    const remove=event.target.closest('[data-remove]');
    if(remove){const index=state.photos.findIndex(p=>p.id===Number(remove.dataset.remove));if(index!==-1){URL.revokeObjectURL(state.photos[index].url);state.photos.splice(index,1);$('#photoGrid').innerHTML=photoMarkup(true);$('#photo-error').textContent='';$('#photos').focus();}return;}
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='back'){sync();state.step=Math.max(0,state.step-1);render(true);track('form_step',{step:state.step+1});}
    if(action==='reset'){releasePhotos();state=initial();render(true);track('form_step',{step:1});}
  });
  document.addEventListener('click',event=>{
    const estimate=event.target.closest('[data-estimate]');
    if(estimate){event.preventDefault();if(busy)return;sync();state.option=estimate.dataset.estimate;state.step=0;render();$('#request').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});focusHeading();track('cta_click',{option:state.option,source:estimate.dataset.source});}
    const goal=event.target.closest('[data-goal]');
    if(goal){const index=Number(goal.dataset.goal),ids=D.goals[index];$$('.service').forEach(s=>s.classList.toggle('is-relevant',ids.includes(s.id.replace('service-',''))));$('#goalFeedback').hidden=false;if(!busy){sync();state.option=ids.length===1?ids[0]:'consult';state.step=0;render();}track('goal_select',{option:String(index)});}
    if(event.target.closest('.hero-actions a[href="#request"],.header-cta'))track('cta_click',{source:'general'});
  });
  window.addEventListener('pagehide',event=>{if(!event.persisted)releasePhotos();});
  render();
  // Deferred content is now present; restore a section anchor on language navigation.
  if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));target?.scrollIntoView();}
})();
