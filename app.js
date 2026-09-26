(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('#nav');
  const progress = document.querySelector('#progress');
  let scheduled = false;
  const onScroll = () => { if(scheduled) return; scheduled = true; requestAnimationFrame(() => {scheduled=false;nav.classList.toggle('scrolled',scrollY>30); const distance=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${distance>0?scrollY/distance:0})`;updateGallery();}); };
  addEventListener('scroll',onScroll,{passive:true});
  const menu = document.querySelector('#mobileMenu');
  const menuButton = document.querySelector('#menuButton');
  let previousOverflow = '';
  function lock(){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  function unlock(){document.body.style.overflow=previousOverflow;}
  menuButton.addEventListener('click',()=>{menu.showModal();menuButton.setAttribute('aria-expanded','true');lock();});
  document.querySelector('#menuClose').addEventListener('click',()=>menu.close());
  menu.addEventListener('close',()=>{menuButton.setAttribute('aria-expanded','false');unlock();menuButton.focus();});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>menu.close()));
  const film = document.querySelector('#filmDialog');
  const video = document.querySelector('#dialogVideo');
  let filmTrigger = null;
  document.querySelectorAll('[data-open-film]').forEach(button=>button.addEventListener('click',()=>{filmTrigger=button;ambient.pause();film.showModal();lock();video.play().catch(()=>{});}));
  document.querySelector('#filmClose').addEventListener('click',()=>film.close());
  film.addEventListener('close',()=>{video.pause();unlock();filmTrigger?.focus({preventScroll:true});syncAmbient();});
  [film,menu].forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
  const horizontal=document.querySelector('#gallery');
  const viewport=document.querySelector('.gallery-viewport');
  const track=document.querySelector('#archiveTrack');
  const cards=[...document.querySelectorAll('.archive-card')];
  const counter=document.querySelector('#galleryCounter');
  const galleryProgress=document.querySelector('#galleryProgress');
  const desktopGallery=()=>innerWidth>850&&!reduced.matches;
  const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
  let galleryIndex=0;
  function updateGallery(){
    if(desktopGallery()){
      const r=horizontal.getBoundingClientRect();
      const available=r.height-(innerHeight-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')));
      const p=clamp((-r.top+parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')))/available);
      const travel=Math.max(0,track.scrollWidth-viewport.clientWidth);
      track.style.transform=`translate3d(${-p*travel}px,0,0)`;
      galleryIndex=Math.min(cards.length-1,Math.round(p*(cards.length-1)));
    }else{
      track.style.transform='none';
      const view=viewport.getBoundingClientRect();
      const middle=view.left+view.width/2;
      galleryIndex=cards.reduce((best,card,i)=>Math.abs(card.getBoundingClientRect().left+card.clientWidth/2-middle)<Math.abs(cards[best].getBoundingClientRect().left+cards[best].clientWidth/2-middle)?i:best,0);
    }
    counter.textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    galleryProgress.style.transform=`scaleX(${(galleryIndex+1)/cards.length})`;
  }
  function moveGallery(delta){
    const next=clamp(galleryIndex+delta,0,cards.length-1);
    if(desktopGallery()){
      const navHeight=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const start=scrollY+horizontal.getBoundingClientRect().top-navHeight;
      const travel=horizontal.offsetHeight-(innerHeight-navHeight);
      window.scrollTo({top:start+next/(cards.length-1)*travel,behavior:'smooth'});
    }else{
      const card=cards[next];
      viewport.scrollTo({left:card.offsetLeft-(viewport.clientWidth-card.clientWidth)/2,behavior:reduced.matches?'instant':'smooth'});
    }
  }
  document.querySelector('.gallery-prev').addEventListener('click',()=>moveGallery(-1));
  document.querySelector('.gallery-next').addEventListener('click',()=>moveGallery(1));
  viewport.addEventListener('scroll',onScroll,{passive:true});
  viewport.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveGallery(event.key==='ArrowRight'?1:-1);}});
  addEventListener('resize',onScroll,{passive:true});
  const ambient=document.querySelector('#ambientVideo');
  const ambientToggle=document.querySelector('#ambientToggle');
  let ambientVisible=false,userPaused=false;
  function syncAmbient(){
    if(ambientVisible&&!document.hidden&&!film.open&&!userPaused&&!reduced.matches){ambient.play().catch(()=>{});}else{ambient.pause();}
  }
  const videoObserver=new IntersectionObserver(entries=>{ambientVisible=entries[0].isIntersecting;syncAmbient();},{threshold:.2});
  videoObserver.observe(ambient);
  ambient.addEventListener('play',()=>{ambientToggle.innerHTML='Pause film <span aria-hidden="true">Ⅱ</span>';ambientToggle.setAttribute('aria-label','Pause background film');});
  ambient.addEventListener('pause',()=>{ambientToggle.innerHTML='Play film <span aria-hidden="true">▷</span>';ambientToggle.setAttribute('aria-label','Play background film');});
  ambientToggle.addEventListener('click',()=>{userPaused=!ambient.paused;if(ambient.paused){userPaused=false;ambient.play().catch(()=>{});}else{ambient.pause();}});
  addEventListener('visibilitychange',syncAmbient);
  reduced.addEventListener('change',()=>{syncAmbient();onScroll();});
  const navLinks=[...document.querySelectorAll('.nav-links a')];
  const sections=navLinks.map(link=>document.querySelector(link.hash));
  const sectionObserver=new IntersectionObserver(()=>{
    const active=sections.filter(s=>s.getBoundingClientRect().top<innerHeight*.55).at(-1);
    navLinks.forEach(link=>{if(active&&link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  },{rootMargin:'-15% 0px -35% 0px',threshold:0});
  sections.forEach(section=>sectionObserver.observe(section));
  const reveals=document.querySelectorAll('.manifesto-copy,.design-copy,.details-title,.detail-card,.rhythm-heading,.faq-layout,.closing-copy');
  if(!reduced.matches){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.animate([{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:800,easing:'cubic-bezier(.22,1,.36,1)'});revealObserver.unobserve(entry.target);}}),{threshold:.1});
    reveals.forEach(element=>revealObserver.observe(element));
  }
  document.documentElement.classList.add('enhanced');
  onScroll();
})();
