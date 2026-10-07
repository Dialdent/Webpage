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

    var contactForm = document.getElementById('contactForm');
    if(contactForm){
        contactForm.addEventListener('invalid', function(e){
            var en = document.documentElement.lang === 'en';
            var msg = '';
            if(e.target.validity.valueMissing){
                msg = en ? 'Please fill out this field.' : 'Lūdzu, aizpildiet šo lauku.';
            } else if(e.target.validity.typeMismatch){
                msg = en ? 'Please enter a valid email address.' : 'Lūdzu, ievadiet derīgu e-pasta adresi.';
            }
            e.target.setCustomValidity(msg);
        }, true);
        contactForm.addEventListener('input', function(e){ e.target.setCustomValidity(''); });
        contactForm.addEventListener('submit', function(e){
            e.preventDefault();
            if(!contactForm.reportValidity()){ return; }
            var ok = document.getElementById('cfSuccess');
            var fail = document.getElementById('cfError');
            ok.classList.add('d-none');
            fail.classList.add('d-none');
            if(contactForm.querySelector('#cf-website').value){
                ok.classList.remove('d-none'); // honeypot filled in, likely a bot: pretend success, send nothing
                return;
            }
            var data = Object.fromEntries(new FormData(contactForm));
            delete data.website;
            data.name = data.vards + ' ' + data.uzvards;
            data.email = data.epasts;
            data.message = 'Tālrunis: ' + data.talrunis + '\n\n' + (data.zina || '(bez ziņas)');
            var btn = contactForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            }).then(function(r){ return r.json(); }).then(function(res){
                if(res.success){
                    contactForm.reset();
                    ok.classList.remove('d-none');
                } else {
                    fail.classList.remove('d-none');
                }
            }).catch(function(){
                fail.classList.remove('d-none');
            }).finally(function(){
                btn.disabled = false;
            });
        });
    }

    var infoSlider = document.getElementById('infoSlider');
    if(infoSlider){
        var isOctober = new Date().getMonth() === 9; // re-checked on every visit, so this clears itself each November and returns next October
        if(!isOctober){
            var octSlide = infoSlider.querySelector('.carousel-item[data-month="october"]');
            if(octSlide){ octSlide.remove(); }
        }
        var slides = infoSlider.querySelectorAll('.carousel-item');
        var indicators = document.getElementById('infoSliderIndicators');
        slides.forEach(function(slide, i){
            slide.classList.toggle('active', i === 0);
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-bs-target', '#infoSlider');
            btn.setAttribute('data-bs-slide-to', i);
            btn.setAttribute('aria-label', 'Slide ' + (i + 1));
            if(i === 0){
                btn.className = 'active';
                btn.setAttribute('aria-current', 'true');
            }
            indicators.appendChild(btn);
        });
        new bootstrap.Carousel(infoSlider, { interval: 10000, ride: 'carousel' });
    }
});