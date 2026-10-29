(() => {
  'use strict';
  const catalogue = window.FORM_SCRIPTS;
  const labels = { name: 'имя клиента', car: 'автомобиль', service: 'услуга', price: 'цена', date: 'дата и время' };
  const demo = {name:'Демо-клиент',car:'Demo Sedan',service:'полировка кузова',price:'65000',date:'5 ноября, 11:00 (пример)'};
  const form = document.querySelector('#clientData');
  const list = document.querySelector('#messageList');
  const categories = document.querySelector('#categoryButtons');
  const status = document.querySelector('#copyStatus');
  let active = catalogue[0].id, copyVersion = 0, timer;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const keys = text => [...new Set([...text.matchAll(/{{(\w+)}}/g)].map(m=>m[1]))];
  function values() {
    const data = {};
    for (const key of Object.keys(labels)) {
      const value = form.elements.namedItem(key).value.trim();
      data[key] = /{{|}}/.test(value) ? '' : value;
    }
    const price = data.price.replace(/[\s\u00a0]/g,'').replace(',','.');
    const validPrice = /^\d+(?:\.\d{1,2})?$/.test(price) && Number(price)>0 && Number(price)<=1e9;
    const priceInput = form.elements.namedItem('price');
    priceInput.setAttribute('aria-invalid', String(Boolean(data.price) && !validPrice));
    document.querySelector('#priceError').textContent = data.price && !validPrice ? 'Введите положительную сумму в AMD, без букв.' : '';
    data.price = validPrice ? new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(Number(price))+' AMD' : '';
    return data;
  }
  function notify(text) { clearTimeout(timer);status.textContent=text;timer=setTimeout(()=>{status.textContent='';},5000); }
  function render() {
    copyVersion++;
    const category = catalogue.find(c=>c.id===active), data=values();
    document.querySelector('#categoryTitle').textContent=category.name;
    document.querySelector('#messageCount').textContent=category.messages.length+' сообщения';
    [...categories.querySelectorAll('button')].forEach(b=>{if(b.dataset.category===active)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});
    list.innerHTML=category.messages.map((message,index)=>{
      const required=keys(message.text), missing=required.filter(key=>!data[key]);
      const preview=message.text.split(/({{\w+}})/g).map(part=>{
        const match=part.match(/^{{(\w+)}}$/);
        return match ? data[match[1]] ? esc(data[match[1]]) : `<mark class="placeholder" style="background:transparent;color:inherit">[${esc(labels[match[1]]||match[1])}]</mark>` : esc(part);
      }).join('');
      return `<article class="message-card" data-card="${index}"><h3>${esc(message.title)}</h3><div class="required-fields" aria-label="Поля сообщения">${required.map(key=>`<span class="${data[key]?'':'missing'}">${data[key]?'✓ ':''}${esc(labels[key])}</span>`).join('')}</div><p class="message-text">${preview}</p><div class="message-bottom"><p id="missing-${index}">${missing.length?'Заполните: '+missing.map(k=>labels[k]).join(', ')+'.':'Все поля заполнены. Проверьте сообщение перед отправкой.'}</p><button class="button" type="button" data-copy-message="${index}" aria-describedby="missing-${index}" ${missing.length?'disabled':''}>Копировать</button></div><div class="next-action"><strong>Следующее действие</strong>${esc(message.next)}</div><div class="manual-copy" hidden></div></article>`;
    }).join('');
  }
  categories.innerHTML=catalogue.map(c=>`<button type="button" data-category="${c.id}" aria-controls="messages">${esc(c.name)}</button>`).join('');
  categories.addEventListener('click',e=>{
    const button=e.target.closest('[data-category]');if(!button)return;
    active=button.dataset.category;status.textContent='';render();
  });
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',()=>{status.textContent='';render();});
  document.querySelector('#fillDemo').addEventListener('click',()=>{
    for(const [key,value] of Object.entries(demo))form.elements.namedItem(key).value=value;
    render();notify('Заполнены вымышленные демонстрационные значения.');
  });
  document.querySelector('#clearData').addEventListener('click',()=>{
    form.reset();render();notify('Данные очищены.');form.elements.namedItem('name').focus();
  });
  list.addEventListener('click',async e=>{
    const button=e.target.closest('[data-copy-message]');if(!button)return;
    const message=catalogue.find(c=>c.id===active).messages[Number(button.dataset.copyMessage)];
    const data=values();if(keys(message.text).some(key=>!data[key])){render();notify('Заполните обязательные поля сообщения.');return;}
    const text=message.text.replace(/{{(\w+)}}/g,(_,key)=>data[key]);
    if(/{{|}}/.test(text)){notify('Проверьте подстановки в сообщении.');return;}
    const version=copyVersion;
    try {
      if(!navigator.clipboard?.writeText)throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(text);
      if(version===copyVersion)notify('Сообщение скопировано. Ничего не отправлено.');
    } catch {
      if(version!==copyVersion)return;
      const fallback=button.closest('.message-card').querySelector('.manual-copy');
      fallback.hidden=false;fallback.innerHTML='<label>Браузер не разрешил копирование. Скопируйте выделенный текст вручную.</label><textarea readonly aria-label="Готовое сообщение для ручного копирования"></textarea><p>Нажмите ⌘ C на Mac или Ctrl C на Windows.</p>';
      const textarea=fallback.querySelector('textarea');textarea.value=text;textarea.focus();textarea.select();
      notify('Автоматическое копирование недоступно. Текст выделен для ручного копирования.');
    }
  });
  render();
})();
