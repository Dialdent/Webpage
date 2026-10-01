function clickButton(button_id){
    document.getElementById(button_id).click();
    navPage(button_id);
}

function navPage(c){
    window.location.href='#'+c;
    history.pushState({},'','/');
}

document.addEventListener('scroll', function(){
    if(document.getElementsByClassName('navbar-collapse')[0].classList[5] === 'show'){
        document.getElementById('navButton').click();
    }
});

function setLang(lang){
    document.querySelectorAll('[data-en]').forEach(function(el){
        if(lang === 'en'){
            if(!el.dataset.lv){ el.dataset.lv = el.textContent; }
            el.textContent = el.dataset.en;
        } else if(el.dataset.lv){
            el.textContent = el.dataset.lv;
        }
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(function(btn){
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    try { localStorage.setItem('dialdent_lang', lang); } catch(e) {}
}

document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.lang-btn').forEach(function(btn){
        btn.addEventListener('click', function(){ setLang(this.dataset.lang); });
    });
    var saved;
    try { saved = localStorage.getItem('dialdent_lang'); } catch(e) {}
    if(saved === 'en'){ setLang('en'); }
});