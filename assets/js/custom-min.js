function clickButton(c){document.getElementById(c).click();navPage(c)};

function navPage(c){window.location.href='#'+c;history.pushState({},'','/')}