function clickButton(button_id){
    document.getElementById(button_id).click();
    navPage(button_id);
}

function navPage(c){
    window.location.href='#'+c;
    history.pushState({},'','/');
}