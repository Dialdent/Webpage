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

function initGallery(){
    var track = document.getElementById('galleryTrack');
    if(!track){ return; }
    var wrap = track.parentElement;
    var prev = wrap.querySelector('.gal-prev');
    var next = wrap.querySelector('.gal-next');
    var dots = document.getElementById('galleryDots');
    var items = track.children;
    function metrics(){
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        var step = items[0].offsetWidth + gap;
        var visible = Math.max(1, Math.round((track.clientWidth + gap) / step));
        return { step: step, count: items.length - visible + 1 };
    }
    function update(){
        var m = metrics();
        var idx = Math.min(m.count - 1, Math.max(0, Math.round(track.scrollLeft / m.step)));
        Array.prototype.forEach.call(dots.children, function(d, i){ d.classList.toggle('active', i === idx); });
        var max = track.scrollWidth - track.clientWidth;
        prev.classList.toggle('is-hidden', track.scrollLeft <= 2);
        next.classList.toggle('is-hidden', track.scrollLeft >= max - 2);
    }
    function build(){
        var m = metrics();
        dots.innerHTML = '';
        for(var i = 0; i < m.count; i++){
            var b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', 'Fotogrāfija ' + (i + 1));
            b.addEventListener('click', (function(n){ return function(){ track.scrollTo({ left: n * metrics().step, behavior: 'smooth' }); }; })(i));
            dots.appendChild(b);
        }
        update();
    }
    prev.addEventListener('click', function(){ track.scrollBy({ left: -metrics().step, behavior: 'smooth' }); });
    next.addEventListener('click', function(){ track.scrollBy({ left: metrics().step, behavior: 'smooth' }); });
    track.addEventListener('scroll', update);
    window.addEventListener('resize', build);
    build();
}

function updateTabArrows(){
    var strip = document.getElementById('nav-tab');
    if(!strip){ return; }
    var wrap = strip.parentElement;
    var max = strip.scrollWidth - strip.clientWidth;
    var overflow = max > 2;
    var atStart = !overflow || strip.scrollLeft <= 2;
    var atEnd = !overflow || strip.scrollLeft >= max - 2;
    wrap.querySelector('.tabs-arrow-left').classList.toggle('is-hidden', atStart);
    wrap.querySelector('.tabs-arrow-right').classList.toggle('is-hidden', atEnd);
    wrap.classList.toggle('at-end', atEnd);
}

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
    updateTabArrows();
    try { localStorage.setItem('dialdent_lang', lang); } catch(e) {}
}

var timesSlideNode = null;

function buildIndicators(){
    var infoSlider = document.getElementById('infoSlider');
    var indicators = document.getElementById('infoSliderIndicators');
    var slides = infoSlider.querySelectorAll('.carousel-item');
    var current = 0;
    slides.forEach(function(slide, i){ if(slide.classList.contains('active')){ current = i; } });
    indicators.innerHTML = '';
    slides.forEach(function(slide, i){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-bs-target', '#infoSlider');
        btn.setAttribute('data-bs-slide-to', i);
        btn.setAttribute('aria-label', 'Slide ' + (i + 1));
        if(i === current){
            btn.className = 'active';
            btn.setAttribute('aria-current', 'true');
        }
        indicators.appendChild(btn);
    });
}

var SHEET_URL = 'https://docs.google.com/spreadsheets/d/1luXXELfE1xa6lyP2-iskapK1FPwa_lyx4FD-iXo_vxI/export?format=csv&gid=';

function pad2(n){ return (n < 10 ? '0' : '') + n; }

function parseSlots(csv){
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var slots = [];
    csv.split(/\r?\n/).forEach(function(line){
        var p = line.split(',');
        var d = (p[0] || '').trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        var t = (p[1] || '').trim().match(/^(\d{1,2}):(\d{2})$/);
        if(!d || !t){ return; }
        var day = new Date(+d[3], d[2] - 1, +d[1]);
        if(day <= today){ return; } // tomorrow and later only
        slots.push({
            at: new Date(+d[3], d[2] - 1, +d[1], +t[1], +t[2]),
            day: pad2(+d[1]) + '.' + pad2(+d[2]) + '.' + d[3],
            dm: pad2(+d[1]) + '.' + pad2(+d[2]) + '.',
            time: pad2(+t[1]) + ':' + t[2]
        });
    });
    slots.sort(function(a, b){ return a.at - b.at; });
    return slots;
}

function renderTimes(groupId, idPrefix, slots){
    var group = document.getElementById(groupId);
    if(!group || !slots.length){ return false; }
    var list = group.querySelector('.cf-list');
    var row, last = '';
    slots.forEach(function(s, i){
        if(s.day !== last){
            last = s.day;
            row = document.createElement('div');
            row.className = 'd-flex flex-wrap align-items-center gap-2 mb-2';
            var lbl = document.createElement('span');
            lbl.className = 'cf-date small fw-semibold';
            lbl.textContent = s.day;
            row.appendChild(lbl);
            list.appendChild(row);
        }
        var inp = document.createElement('input');
        inp.type = 'checkbox';
        inp.className = 'btn-check';
        inp.name = group.dataset.name;
        inp.id = idPrefix + i;
        inp.value = s.day + ' ' + s.time;
        inp.autocomplete = 'off';
        var lab = document.createElement('label');
        lab.className = 'btn btn-outline-primary btn-sm rounded-pill';
        lab.htmlFor = inp.id;
        lab.textContent = s.time;
        row.appendChild(inp);
        row.appendChild(lab);
    });
    group.classList.remove('d-none');
    return true;
}

function addTimesSlide(dentist, hygienist){
    var infoSlider = document.getElementById('infoSlider');
    if(!infoSlider || !timesSlideNode || (!dentist.length && !hygienist.length)){ return; }
    [['#ntDentist', dentist], ['#ntHyg', hygienist]].forEach(function(row){
        var line = timesSlideNode.querySelector(row[0]);
        if(row[1].length){
            line.querySelector('span').textContent = row[1].map(function(s){ return s.dm + ' ' + s.time; }).join(', ');
            line.classList.remove('d-none');
        }
    });
    var first = infoSlider.querySelector('.carousel-item');
    if(first){ first.after(timesSlideNode); } else { infoSlider.querySelector('.carousel-inner').appendChild(timesSlideNode); }
    timesSlideNode = null;
    buildIndicators();
    if(document.documentElement.lang === 'en'){ setLang('en'); }
}

function loadTimes(){
    var box = document.getElementById('cfTimes');
    function get(gid){
        return fetch(SHEET_URL + gid, { cache: 'no-store' })
            .then(function(r){ if(!r.ok){ throw new Error('sheet'); } return r.text(); })
            .then(parseSlots)
            .catch(function(){ return []; }); // one sheet failing must not hide the other
    }
    Promise.all([get('0'), get('67707315')]).then(function(res){
        addTimesSlide(res[0].slice(0, 3), res[1].slice(0, 3));
        if(box){
            var a = renderTimes('cfTimesDentist', 'cf-d-', res[0]);
            var b = renderTimes('cfTimesHyg', 'cf-h-', res[1]);
            if(a || b){ box.classList.remove('d-none'); }
        }
    });
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
            var fd = new FormData(contactForm);
            var dentistTimes = fd.getAll('laikiZobarsts');
            var hygTimes = fd.getAll('laikiHigienists');
            var timeLines = [];
            if(dentistTimes.length){ timeLines.push('Zobārste: ' + dentistTimes.join(', ')); }
            if(hygTimes.length){ timeLines.push('Higiēniste: ' + hygTimes.join(', ')); }
            delete data.website;
            delete data.laikiZobarsts;
            delete data.laikiHigienists;
            data.name = data.vards + ' ' + data.uzvards;
            data.email = data.epasts;
            data.message = 'Tālrunis: ' + data.talrunis + (timeLines.length ? '\nVēlamie laiki:\n' + timeLines.join('\n') : '') + '\n\n' + (data.zina || '(bez ziņas)');
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
        timesSlideNode = document.getElementById('timesSlide'); // held back until the sheet has times to show
        if(timesSlideNode){ timesSlideNode.remove(); }
        infoSlider.querySelectorAll('.carousel-item').forEach(function(slide, i){
            slide.classList.toggle('active', i === 0);
        });
        buildIndicators();
        new bootstrap.Carousel(infoSlider, { interval: 10000, ride: 'carousel' });
    }

    var tabStrip = document.getElementById('nav-tab');
    if(tabStrip){
        var tabWrap = tabStrip.parentElement;
        tabWrap.querySelector('.tabs-arrow-left').addEventListener('click', function(){ tabStrip.scrollBy({ left: -160, behavior: 'smooth' }); });
        tabWrap.querySelector('.tabs-arrow-right').addEventListener('click', function(){ tabStrip.scrollBy({ left: 160, behavior: 'smooth' }); });
        tabStrip.addEventListener('scroll', updateTabArrows);
        window.addEventListener('resize', updateTabArrows);
        window.addEventListener('load', updateTabArrows);
        updateTabArrows();
    }

    initGallery();
    loadTimes();
});