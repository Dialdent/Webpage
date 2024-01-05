function clickButton(button_id){
    document.getElementById(button_id).click();
}

function navPage(c){
    window.location.href='#'+c;
    history.pushState({},'','/');
}