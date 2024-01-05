function clickButton(c){document.getElementById(c).click()};

function navPage(c){window.location.href='#'+c;history.pushState({},'','/'+c)}
if (performance.navigation.type === 1) {window.location.replace(window.location.origin);}