

function changeCss() {
    var style = document.getElementById("style");
    var badcssdiv = document.getElementById("badcss");
    if (style.href.endsWith("bad.css")){
        style.href = "css/index.css";
        badcssdiv.innerHTML = "BadCSS";
    } else {
        style.href = "css/bad.css";
        badcssdiv.innerHTML = "BetterCSS";   
    }

}