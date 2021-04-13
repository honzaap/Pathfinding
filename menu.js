let menu = document.getElementById("side-menu");
let toggle = menu.getElementsByClassName("menu-toggle-container")[0];
let icon_open = toggle.getElementsByClassName("menu-open")[0];
let icon_closed = toggle.getElementsByClassName("menu-closed")[0];


toggle.onclick = function(){
    if(toggle.classList.contains("closed")){
        menu.style.transform = "translateX(0%)";
        icon_closed.style.display = "flex";
        icon_open.style.display = "none";
        toggle.classList.remove("closed");
        toggle.classList.add("open");
    }
    else{
        menu.style.transform = "translateX(-95%)";
        icon_open.style.display = "flex";
        icon_closed.style.display = "none";
        toggle.classList.remove("open");
        toggle.classList.add("closed");
    }
}