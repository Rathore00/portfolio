(function(){
  const LINKS={
    email:'mailto:parulrathore365@gmail.com',
    linkedin:'https://www.linkedin.com/in/parul-rathour-74174917a',
    instagram:'https://www.instagram.com/canvas_0ff?igsh=dnFib3htNXloamF5',
    x:'https://x.com/ParulRath0ur',
    resume:'resume.html'
  };

  const MARKUP=`
<div class="cm-root" id="contact-modal" aria-hidden="true">
  <div class="cm-backdrop" data-cm-close tabindex="-1"></div>
  <div class="cm-card" role="dialog" aria-modal="true" aria-labelledby="cm-title" tabindex="-1">
    <h2 class="cm-title" id="cm-title">Get In Touch</h2>
    <div class="cm-info">
      <div class="cm-block">
        <p class="cm-label">Say Hi</p>
        <a class="cm-mail" href="${LINKS.email}">parulrathore365@gmail.com</a>
      </div>
      <div class="cm-block">
        <p class="cm-label">Life &amp; Travel Visual Documentation</p>
        <a class="cm-text-link" href="${LINKS.instagram}" target="_blank" rel="noopener">Instagram</a>
      </div>
      <div class="cm-block">
        <p class="cm-label">Socials</p>
        <div class="cm-socials">
          <a class="cm-social" href="${LINKS.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><img src="Asset/images/home/icon-linkedin.svg" alt="" width="16" height="16"></a>
          <a class="cm-social" href="${LINKS.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><img src="Asset/images/home/icon-ig.svg" alt="" width="16" height="16"></a>
          <a class="cm-social" href="${LINKS.x}" target="_blank" rel="noopener" aria-label="X"><img src="Asset/images/home/icon-x.svg" alt="" width="16" height="16"></a>
        </div>
      </div>
      <div class="cm-block">
        <p class="cm-label">View</p>
        <a class="cm-resume" href="${LINKS.resume}">
          <span class="cm-resume-ico" aria-hidden="true"><img src="Asset/images/know/icon-play.svg" alt="" width="11" height="11"></span>
          Resume
        </a>
      </div>
    </div>
    <div class="cm-foot">
      <p class="cm-note">We can yapp :)</p>
      <div class="cm-badge" aria-hidden="true">
        <div class="cm-badge-spin">
          <svg class="cm-badge-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#C9F24A" fill-rule="evenodd" d="M100 0a100 100 0 1 1 0 200A100 100 0 0 1 100 0zm0 48a52 52 0 1 0 0 104 52 52 0 0 0 0-104z"/>
            <path id="cm-badge-ring" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" fill="none"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</div>`;

  function isTouchCta(el){
    if(!el||el.closest('.cm-root')) return false;
    if(el.classList.contains('btn-touch')) return true;
    const text=(el.textContent||'').replace(/\s+/g,' ').trim();
    return text==='Get In Touch'||text==='Get in Touch';
  }

  function layoutBadgeRing(root){
    const svg=root.querySelector('.cm-badge-svg');
    if(!svg) return;
    svg.querySelectorAll('.cm-badge-text').forEach(function(n){ n.remove(); });
    const ns='http://www.w3.org/2000/svg';
    const words=['Design','Sip Tea','Repeat'];
    const cx=100, cy=100, r=76;
    const charAngle=0.195;
    words.forEach(function(word,wi){
      const chars=Array.from(word);
      const wordAngle=chars.length*charAngle;
      const center=(wi/words.length)*Math.PI*2 - Math.PI/2;
      const start=center - wordAngle/2;
      chars.forEach(function(ch,ci){
        if(ch===' ') return;
        const a=start + (ci+0.5)*charAngle;
        const x=cx + r*Math.cos(a);
        const y=cy + r*Math.sin(a);
        const deg=(a*180/Math.PI)+90;
        const text=document.createElementNS(ns,'text');
        text.setAttribute('class','cm-badge-text');
        text.setAttribute('fill','#2a0a18');
        text.setAttribute('font-family','Playfair Display, Georgia, serif');
        text.setAttribute('font-size','26');
        text.setAttribute('font-weight','400');
        text.setAttribute('font-style','normal');
        text.setAttribute('text-anchor','middle');
        text.setAttribute('dominant-baseline','middle');
        text.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+') rotate('+deg.toFixed(2)+')');
        text.textContent=ch;
        svg.appendChild(text);
      });
    });
  }

  function init(){
    if(document.getElementById('contact-modal')) return;
    document.body.insertAdjacentHTML('beforeend',MARKUP);

    const root=document.getElementById('contact-modal');
    const card=root.querySelector('.cm-card');
    try{ layoutBadgeRing(root); }catch(err){}
    if(document.fonts&&document.fonts.ready){
      document.fonts.ready.then(function(){ try{ layoutBadgeRing(root); }catch(err){} });
    }
    let lastFocus=null;

    function open(trigger){
      lastFocus=trigger||document.activeElement;
      const mob=document.getElementById('mobMenu');
      if(mob) mob.classList.remove('open');
      root.classList.add('is-open');
      root.setAttribute('aria-hidden','false');
      document.documentElement.classList.add('cm-lock');
      card.focus({preventScroll:true});
    }
    function close(){
      if(!root.classList.contains('is-open')) return;
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden','true');
      document.documentElement.classList.remove('cm-lock');
      if(lastFocus&&lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener('click',function(e){
      const a=e.target.closest('a');
      if(!a||!isTouchCta(a)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      open(a);
    },true);

    root.addEventListener('click',function(e){
      if(e.target.closest('[data-cm-close]')) close();
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape') close();
    });

    if(/[?&]contact=1(?:&|$)/.test(location.search)) open(null);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
