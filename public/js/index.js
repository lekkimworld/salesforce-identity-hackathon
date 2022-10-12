const addTagHeadline = (container, text) => {
    const elemHeadline = document.createElement("h1");
    elemHeadline.className = "cover-heading";
    elemHeadline.appendChild(document.createTextNode(text));
    container.appendChild(elemHeadline);
    return elemHeadline;
}
const addTagParagraph = (container, text) => {
    const e = document.createElement("p");
    e.className = "lead";
    e.appendChild(
        document.createTextNode(text)
    );
    container.appendChild(e);
    return e;
}
const addMenuItem = (container, title, hash) => {
        const currentHash = document.location.hash;
        const elem = document.createElement("a");
        const classNames = ["nav-link"];
        if ((!currentHash && !hash) || currentHash === `#${hash}`) {
            classNames.push("active");
        }
        elem.className = classNames.join(" ");
        elem.setAttribute("href", `#${hash}`);
        elem.appendChild(document.createTextNode(title));
        container.appendChild(elem);
}
const buildMenu = () => {
    const navigationContainer = document.getElementById("navigation");
    navigationContainer.innerText = "";
    addMenuItem(navigationContainer, "Home", "");
    addMenuItem(navigationContainer, "About", "about");
}
const navigationClickHandler = (ev) => {
    const hash = document.location.hash;
    buildMenu();
    
    const mainContainer = document.querySelector("main[role='main']");
    mainContainer.innerText = "";
    if (["", "#"].includes(hash)) {
        addTagHeadline(mainContainer, "Welcome");
    } else if (["#about"].includes(hash)) {
        addTagHeadline(mainContainer, "About");
        addTagParagraph(
            mainContainer,
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean id ullamcorper diam. Phasellus auctor posuere nunc at finibus. Sed faucibus quam risus, ut pulvinar lacus rhoncus sit amet. Sed ac congue diam. Suspendisse lacinia sed eros id euismod. Duis pulvinar massa eu nisi egestas viverra. Etiam nisl ex, placerat non sem ac, maximus feugiat nunc. Duis a risus sapien. Morbi suscipit leo vel eros pulvinar, vitae tincidunt erat molestie. Sed viverra nisl sed enim dapibus, ac semper neque placerat. Vestibulum et justo ac leo lacinia lacinia ac ut felis. Cras eu metus dapibus, cursus arcu et, fringilla lectus. Nulla hendrerit ac elit sed malesuada. Proin auctor felis fringilla viverra tincidunt."
        );
        addTagParagraph(
            mainContainer,
            "Cras vitae elit in urna efficitur vulputate sed in felis. Ut imperdiet nisi id quam efficitur, non ultrices ante mattis. Aenean aliquet a velit in efficitur. Nunc elementum sit amet elit in lobortis. Donec varius mauris gravida neque maximus, at elementum orci euismod. Aliquam vestibulum nunc lacus, eget ultrices augue vulputate non. Nunc tincidunt cursus posuere. Aenean elementum lorem magna, sit amet tempus felis porttitor id. Maecenas ligula odio, ullamcorper eu pretium non, vehicula at lorem. Etiam sem lectus, scelerisque et fermentum at, hendrerit in tortor. Etiam id sem quis ipsum interdum ultrices vel in ipsum. In facilisis venenatis feugiat. Duis tincidunt turpis eu massa rhoncus dictum."
        );
        
    }

}
const initNavigation = () => {
    const navigationContainer = document.getElementById("navigation");
    navigationContainer.addEventListener("click", navigationClickHandler);
    buildMenu();
}

window.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    navigationClickHandler();
});
window.addEventListener("hashchange", navigationClickHandler);
