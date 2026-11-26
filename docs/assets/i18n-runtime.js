// Language runtime: applies I18N dict to [data-i18n] nodes; persists choice.
(function(){
  const LANG_TAGS={zh:'zh-CN',ja:'ja',pt:'pt-BR',en:'en'};
  const SUPPORTED=['en','zh','ja','pt'];
  const NAMES={en:'EN',zh:'中文',ja:'日本語',pt:'PT'};
  function normalize(lang){ return SUPPORTED.includes(lang)?lang:'en'; }
  function pageLang(){ return normalize((document.documentElement.lang||'en').split('-')[0]); }
  function isGuidePage(){ return !!document.querySelector('article.guide'); }
  function cur(){
    if(isGuidePage()) return pageLang();
    return normalize(localStorage.getItem('bwd-lang')||'en');
  }
  function mark(lang){
    document.querySelectorAll('.lang-btn').forEach(b=>{
      b.classList.toggle('on', b.dataset.lang===lang);
      b.setAttribute('aria-selected', b.dataset.lang===lang);
    });
  }
  function tagTranslated(el,lang){
    if(lang==='en') el.removeAttribute('lang');
    else el.setAttribute('lang',LANG_TAGS[lang]||lang);
  }
  function apply(lang){
    lang=normalize(lang);
    const dict=I18N[lang]||{};
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.dataset.i18n;
      if(!(k in dict)) return;
      if(!el.dataset.orig) el.dataset.orig=el.innerHTML;
      el.innerHTML=dict[k];
      tagTranslated(el,lang);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const k=el.dataset.i18nPlaceholder;
      if(!el.dataset.origAttr) el.dataset.origAttr=el.getAttribute('placeholder')||'';
      el.setAttribute('placeholder', (dict[k]!==undefined)?dict[k]:el.dataset.origAttr);
      if(dict[k]!==undefined) tagTranslated(el,lang);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const k=el.dataset.i18nHtml||el.getAttribute('data-i18n-html');
      if(!el.dataset.orig) el.dataset.orig=el.innerHTML;
      el.innerHTML=(dict[k]!==undefined)?dict[k]:el.dataset.orig;
      if(dict[k]!==undefined) tagTranslated(el,lang);
    });
    if(lang==='en'){
      document.querySelectorAll('[data-i18n],[data-i18n-html]').forEach(el=>{ if(el.dataset.orig) el.innerHTML=el.dataset.orig; el.removeAttribute('lang'); });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.removeAttribute('lang'));
    }
    // point guide links at the localized mirror (guides/<lang>/...)
    document.querySelectorAll('a[href^="guides/"]').forEach(a=>{
      const h=a.getAttribute('href');
      const m=h.match(/^guides\/(?:(?:en|zh|ja|pt)\/)?(.+\.html)$/);
      if(!m) return;
      a.setAttribute('href', lang==='en' ? `guides/${m[1]}` : `guides/${lang}/${m[1]}`);
    });
    // deep-dive pages: zh mirror exists; other langs stay on English
    document.querySelectorAll('a').forEach(a=>{
      const h=a.getAttribute('href')||'';
      const m=h.match(/^(?:zh\/)?(devin-bots-anatomy|reproducing-devin-bots|economics)\.html$/);
      if(!m) return;
      a.setAttribute('href', lang==='zh' ? `zh/${m[1]}.html` : `${m[1]}.html`);
    });
    mark(lang);
    localStorage.setItem('bwd-lang',lang);
  }
  function choose(lang){
    lang=normalize(lang);
    if(isGuidePage()){
      if(lang===pageLang()){ mark(lang); return; }
      const link=document.querySelector(`.guide-crumb a[data-lang-link="${lang}"]`);
      if(link) location.href=link.href;
      return;
    }
    apply(lang);
  }
  function build(){
    const side=document.querySelector('.nav-side'); if(!side) return;
    const wrap=document.createElement('div');
    wrap.className='lang-switch'; wrap.setAttribute('role','tablist'); wrap.setAttribute('aria-label','Language');
    SUPPORTED.forEach(l=>{
      const b=document.createElement('button');
      b.className='lang-btn'; b.dataset.lang=l; b.textContent=NAMES[l]; b.setAttribute('role','tab');
      b.onclick=()=>choose(l);
      wrap.appendChild(b);
    });
    side.prepend(wrap);
    const sel=document.createElement('select');
    sel.className='lang-sel'; sel.setAttribute('aria-label','Language');
    SUPPORTED.forEach(l=>{const o=document.createElement('option');o.value=l;o.textContent=NAMES[l];sel.appendChild(o);});
    sel.onchange=()=>choose(sel.value);
    side.prepend(sel);
    const sync=()=>{sel.value=cur();};
    wrap.addEventListener('click',()=>setTimeout(sync,0));
    sel.value=cur();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    build();
    if(isGuidePage()) mark(pageLang());
    else apply(cur());
  });
  window.__setLang=choose;
})();
