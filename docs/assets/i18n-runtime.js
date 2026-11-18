// Language runtime: applies I18N dict to [data-i18n] nodes; persists choice.
(function(){
  const SUPPORTED=['en','zh','ja','pt','es','de'];
  const NAMES={en:'EN',zh:'中文',ja:'日本語',pt:'PT',es:'ES',de:'DE'};
  function cur(){ const l=localStorage.getItem('bwd-lang')||'en'; return SUPPORTED.includes(l)?l:'en'; }
  function apply(lang){
    const dict=I18N[lang]||{};
    document.documentElement.lang={zh:'zh-CN',ja:'ja',pt:'pt-BR',es:'es',de:'de',en:'en'}[lang]||lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.dataset.i18n;
      if(!(k in dict)) return;  // en fallback: restore original? store orig once
      if(!el.dataset.orig) el.dataset.orig=el.innerHTML;
      el.innerHTML=dict[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const k=el.dataset.i18nHtml||el.getAttribute('data-i18n-html');
      if(!el.dataset.orig) el.dataset.orig=el.innerHTML;
      el.innerHTML=(dict[k]!==undefined)?dict[k]:el.dataset.orig;
    });
    // restore untouched originals when switching back to en
    if(lang==='en'){
      document.querySelectorAll('[data-i18n],[data-i18n-html]').forEach(el=>{ if(el.dataset.orig) el.innerHTML=el.dataset.orig; });
    }
    document.querySelectorAll('.lang-btn').forEach(b=>{
      b.classList.toggle('on', b.dataset.lang===lang);
      b.setAttribute('aria-selected', b.dataset.lang===lang);
    });
    localStorage.setItem('bwd-lang',lang);
  }
  function build(){
    const side=document.querySelector('.nav-side'); if(!side) return;
    const wrap=document.createElement('div');
    wrap.className='lang-switch'; wrap.setAttribute('role','tablist'); wrap.setAttribute('aria-label','Language');
    SUPPORTED.forEach(l=>{
      const b=document.createElement('button');
      b.className='lang-btn'; b.dataset.lang=l; b.textContent=NAMES[l]; b.setAttribute('role','tab');
      b.onclick=()=>apply(l);
      wrap.appendChild(b);
    });
    side.prepend(wrap);
  }
  document.addEventListener('DOMContentLoaded',()=>{ build(); apply(cur()); });
  window.__setLang=apply;
})();
