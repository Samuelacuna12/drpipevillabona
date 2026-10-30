(() => {
  'use strict';
  const cfg = window.SITE;
  let lang = 'en';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const words = (en,es) => lang === 'es' ? es : en;
  function translate(next) {
    lang=next; document.documentElement.lang=lang;
    $$('[data-en]').forEach(el=>el.textContent=el.dataset[lang]);
    $$('[data-alt-en]').forEach(el=>el.alt=el.dataset[lang==='es'?'altEs':'altEn']);
    $$('[data-label-en]').forEach(el=>el.setAttribute('aria-label',el.dataset[lang==='es'?'labelEs':'labelEn']));
    $('.lang').textContent=lang==='en'?'ES':'EN';
    $('.lang').setAttribute('aria-label',lang==='en'?'Cambiar a español':'Switch to English');
    updateCountry();
    if ($('#booking').open) { updateSummary(); }
    if ($('#assistant').open) renderBot('welcome');
  }
  $('.lang').addEventListener('click',()=>translate(lang==='en'?'es':'en'));
  const nav=$('.site-nav'), menu=$('.menu-toggle');
  menu.addEventListener('click',()=>{let open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  $$('.site-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
  let lastFocus;
  function openDialog(id){lastFocus=document.activeElement;$(id).showModal();document.body.style.overflow='hidden';}
  $$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('dialog').forEach(d=>{d.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus();});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
  let step=0;
  const date=$('#demo-date');
  const future=new Date();future.setDate(future.getDate()+1);
  const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  date.min=localDate(future);date.value=localDate(future);
  function setStep(n){step=n;$$('.form-step').forEach((el,i)=>el.classList.toggle('active',i===n));$('#booking-error').textContent='';if(n===2)updateSummary();}
  $$('[data-book]').forEach(b=>b.addEventListener('click',()=>{setStep(0);$('#booking-success').hidden=true;$('#booking-form').hidden=false;openDialog('#booking');}));
  $$('[data-next]').forEach(b=>b.addEventListener('click',()=>{
    const fields=$$('.form-step.active select,.form-step.active input');
    for(const f of fields){if(!f.reportValidity())return;}
    setStep(Math.min(step+1,2));
  }));
  $$('[data-back]').forEach(b=>b.addEventListener('click',()=>setStep(Math.max(step-1,0))));
  function updateSummary(){
    const interest=cfg.services[Number($('#demo-service').value)][lang==='es'?1:0];
    const country=$('#demo-country').selectedOptions[0].textContent;
    const slot=$('#demo-time').value;
    const day=date.value;
    $('#summary-content').textContent=`${interest} · ${country}\n${day} · ${slot} · ${words('Colombia time (UTC−5)','Hora de Colombia (UTC−5)')}`;
  }
  $('#booking-form').addEventListener('submit',e=>{e.preventDefault();$('#booking-form').hidden=true;$('#booking-success').hidden=false;$('#booking-success').focus();});
  let country='USA';
  function updateCountry(){
    if(!$('#country-copy'))return;
    $('#country-copy').textContent=country==='USA'?words('Start from the United States. Confirm your consultation and individual plan with the practice before arranging flights.','Comienza desde Estados Unidos. Confirma tu valoración y plan individual con la consulta antes de organizar vuelos.'):words('Start from Canada. Coordinate language, time zone and the visits your individual plan may require before booking travel.','Comienza desde Canadá. Coordina idioma, zona horaria y las visitas que pueda requerir tu plan individual antes de reservar el viaje.');
  }
  $$('.country-btn').forEach(b=>b.addEventListener('click',()=>{country=b.dataset.country;$$('.country-btn').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));updateCountry();}));
  $$('.service-choice').forEach((b,i)=>b.addEventListener('click',()=>{
    $$('.service-choice').forEach(x=>x.setAttribute('aria-expanded',String(x===b)));
    const picture=$('#service-image');if(picture&&cfg.serviceImages?.[i]){picture.src=cfg.serviceImages[i];}
  }));
  function renderBot(topic){
    const name=cfg.name;
    const copy={
      welcome:words(`This is a preview of an administrative assistant for ${name}. Choose a question to explore the experience. It does not use a live AI model or contact the clinic.`,`Esta es una vista previa de un asistente administrativo para ${name}. Elige una pregunta para explorar la experiencia. No usa un modelo de IA conectado ni contacta a la clínica.`),
      travel:words('Begin with a conversation with the practice. Confirm the clinical assessment, the individual plan and required visits before booking flights or accommodation. Travel arrangements are not included in this demo.','Comienza con una conversación con la consulta. Confirma la valoración clínica, el plan individual y las visitas necesarias antes de reservar vuelos o alojamiento. Esta demo no incluye reservas de viaje.'),
      appointments:words('The booking preview lets you explore treatment interest, country and a preferred time. All slots are illustrative. No appointment is reserved; real availability must be confirmed with the practice.','La vista previa de agenda permite explorar interés, país y horario preferido. Los horarios son ilustrativos. No se reserva una cita; la disponibilidad real debe confirmarse con la consulta.'),
      services:words(`${cfg.services.map(s=>s[0]).join(' · ')}. These are service areas presented by the practice. A qualified clinician determines which options, if any, are appropriate.`,`${cfg.services.map(s=>s[1]).join(' · ')}. Son áreas de servicio presentadas por la consulta. Un profesional determina qué alternativas, si aplica, son apropiadas.`),
      human:words('For a real conversation, use the official website link in the footer or the clinic’s public WhatsApp channel. This proposal is an independent demonstration by Samuel Acuña.','Para una conversación real, usa el enlace al sitio oficial del pie de página o el WhatsApp público de la consulta. Esta propuesta es una demostración independiente de Samuel Acuña.')
    };
    $('#bot-response').textContent=copy[topic]||copy.welcome;
  }
  $('[data-assistant]').addEventListener('click',()=>{renderBot('welcome');openDialog('#assistant');});
  $$('[data-topic]').forEach(b=>b.addEventListener('click',()=>renderBot(b.dataset.topic)));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(!reduce.matches&&'IntersectionObserver'in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px 20px 0px'});$$('.reveal').forEach(el=>observer.observe(el));}
  let scheduled=false;
  function updateProgress(){const total=document.documentElement.scrollHeight-innerHeight;$('.progress-bar').style.transform=`scaleX(${total>0?scrollY/total:0})`;scheduled=false;}
  addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(updateProgress);scheduled=true;}},{passive:true});
  updateCountry();updateProgress();
})();

(() => {
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 $$('[data-switch]').forEach(b=>b.addEventListener('click',()=>{
  const group=b.dataset.switch;
  $$('[data-switch]').filter(x=>x.dataset.switch===group).forEach(x=>x.setAttribute('aria-selected',String(x===b)));
  $$('[data-group]').filter(x=>x.dataset.group===group).forEach(x=>x.hidden=x.id!==b.dataset.panel);
 }));
 $$('[role=tablist]').forEach(list=>list.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  const buttons=[...list.querySelectorAll('[role=tab]')],i=buttons.indexOf(document.activeElement);if(i<0)return;e.preventDefault();
  let n=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[n].click();buttons[n].focus();
 }));
 $('[data-compare]')?.addEventListener('input',e=>$('.gc-comparison').style.setProperty('--reveal',e.target.value+'%'));
 let slide=0;const slides=$$('[data-slide]');
 function showSlide(next){slide=(next+slides.length)%slides.length;slides.forEach((s,i)=>s.hidden=i!==slide);$('.pv-slide-number').textContent=String(slide+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');}
 $('[data-slide-prev]')?.addEventListener('click',()=>showSlide(slide-1));$('[data-slide-next]')?.addEventListener('click',()=>showSlide(slide+1));
 $('[data-play-video]')?.addEventListener('click',()=>{const el=$('[data-youtube]'),frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+el.dataset.youtube+'?autoplay=1&rel=0';frame.title='Dr. Camilo Lemos — presentation';frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';frame.allowFullscreen=true;el.replaceChildren(frame);});
 $$('[data-travel-check]').forEach(box=>box.addEventListener('change',()=>{$('[data-check-count]').textContent=$$('[data-travel-check]:checked').length+' / 4';}));
 const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(motion&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.animate([{opacity:.2,transform:'translateY(25px)'},{opacity:1,transform:'none'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});observer.unobserve(x.target);}}),{threshold:.1});$$('main>section:not(:first-child)>h2, main>section:not(:first-child)>div, .ms-work figure, .lq-layer-title').forEach(el=>observer.observe(el));}
})();
