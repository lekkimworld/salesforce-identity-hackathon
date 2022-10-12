const navigationHandler_Login = async () => {
    // ask server for login details
    const resp = await fetch("/api/logindetails", {
        method: "get",
        headers: {
            "content-type": "application/json",
            accept: "application/json"
        }
    })
    const obj = await resp.json();

    // save in localStorage
    localStorage.setItem("logindetails", JSON.stringify(obj));

    // create state
    const strstate = btoa(JSON.stringify({"foo": "bar"}));
    
    // initiate login
    document.location.href = `https://${obj.mydomain}/services/oauth2/authorize?client_id=${obj.client_id}&redirect_uri=${obj.redirect_uri}&response_type=code&state=${strstate}&code_challenge=${obj.code_challenge}`;
    
}
const navigationHandler_Logout = () => {
    localStorage.removeItem("user");
    document.location.hash = "#";
};

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
const getUser = () => {
    const struser = localStorage.getItem("user");
    if (!struser) return undefined;
    return JSON.parse(struser);
}
const buildMenu = () => {
    // get user
    const user = getUser();
    console.log(`User`, user);

    // build menu
    const navigationContainer = document.getElementById("navigation");
    navigationContainer.innerText = "";
    addMenuItem(navigationContainer, "Home", "");
    addMenuItem(navigationContainer, "About", "about");
    if (!user) {
        addMenuItem(navigationContainer, "Login", "login");
    } else {
        addMenuItem(navigationContainer, "Logout", "logout");
    }
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
    } else if (["#login"].includes(hash)) {
        navigationHandler_Login();
    } else if (["#logout"].includes(hash)) {
        navigationHandler_Logout();
    }

}
const initNavigation = () => {
    const navigationContainer = document.getElementById("navigation");
    navigationContainer.addEventListener("click", navigationClickHandler);
    buildMenu();
}

window.addEventListener("DOMContentLoaded", async () => {
    initNavigation();
    navigationClickHandler();

    // look for logindetails info in local storage
    const strlogindetails = localStorage.getItem("logindetails")
    if (strlogindetails && (location.search.includes("state=") && (location.search.includes("code=") || location.search.includes("error=")))) {
        const params = new URLSearchParams(location.search);
        window.history.replaceState({}, document.title, "/");
        const auth_code = params.get("code");
        const strstate = params.get("state");
        console.log("State", JSON.parse(atob(strstate)));

        // get logindetails
        const logindetails = JSON.parse(strlogindetails);

        // exchange authcode
        const respToken = await fetch(`https://${logindetails.mydomain}/services/oauth2/token`, {
            "method": "post",
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "accept": "application/json"
            },
            body: `code=${auth_code}&code_verifier=${logindetails.code_verifier}&grant_type=authorization_code&redirect_uri=${logindetails.redirect_uri}&client_id=${logindetails.client_id}`
        })
        const tokeninfo = await respToken.json();
        console.log(tokeninfo);

        // get userinfo
        const respUserinfo = await fetch(`https://${logindetails.mydomain}/services/oauth2/userinfo`, {
                headers: {
                    authorization: `Bearer ${tokeninfo.access_token}`,
                },
            }
        );
        const userinfo = await respUserinfo.json();

        localStorage.setItem("user", JSON.stringify({
            tokeninfo,
            userinfo
        }));
        location.hash = "#";
    }
});
window.addEventListener("hashchange", navigationClickHandler);
