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
const addTagSubheadline = (container, text) => {
    const elemHeadline = document.createElement("h2");
    elemHeadline.className = "cover-heading-small";
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
const addTagLink = (container, text, link) => {
    const e = document.createElement("p");
    e.className = "lead";
    const e2 = document.createElement("a");
    e2.href = link;
    e2.target = "_new";
    e2.appendChild(document.createTextNode(text));
    e.appendChild(e2);
    container.appendChild(e);
    return e;
};
const addTagJson = (container, json) => {
    const e = document.createElement("p");
    const e2 = document.createElement("pre");
    e.appendChild(e2);
    e2.appendChild(document.createTextNode(JSON.stringify(json, undefined, 2)));
    container.appendChild(e);
    return e;
};
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
    
    // build menu
    const navigationContainer = document.getElementById("navigation");
    navigationContainer.innerText = "";
    addMenuItem(navigationContainer, "Home", "");
    addMenuItem(navigationContainer, "About", "about");
    if (!user) {
        addMenuItem(navigationContainer, "Login", "login");
    } else {
        addMenuItem(navigationContainer, "Token Info", "token");
        addMenuItem(navigationContainer, "Logout", "logout");
    }
}
const navigationClickHandler = async (ev) => {
    const user = getUser();
    const hash = document.location.hash;
    buildMenu();
    
    const mainContainer = document.querySelector("main[role='main']");
    mainContainer.innerText = "";
    if (["", "#"].includes(hash)) {
        if (user) {
            addTagHeadline(mainContainer, `Welcome ${user.userinfo.name}`);
            const respData = await fetch("/api/userinfo", {
                headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${user.tokeninfo.access_token}`
                }
            });
            if (respData.status === 401) {
                // see if we have a refresh token
                const refresh_token = user.tokeninfo.refresh_token;
                if (refresh_token) {
                    // attempt to refresh access token
                    const logindetails = JSON.parse(localStorage.getItem("logindetails"));
                    const respRefresh = await fetch(`https://${logindetails.mydomain}/services/oauth2/token`, {
                        method: "post",
                        headers: {
                            "content-type": "application/x-www-form-urlencoded",
                            accept: "application/json",
                        },
                        body: `client_id=${logindetails.client_id}&grant_type=refresh_token&refresh_token=${refresh_token}`,
                    });
                    const dataRefresh = await respRefresh.json();
                    user.tokeninfo = dataRefresh;
                    user.tokeninfo.refresh_token = refresh_token;
                    localStorage.setItem("user", JSON.stringify(user));
                    document.location.reload();
                } else {
                    document.location.hash = "#error";
                }
                return;
            }
            const data = await respData.json();
            addTagParagraph(mainContainer, `UUID: ${data.uuid}`)
        } else {
            addTagHeadline(mainContainer, `Welcome - please authenticate`);
        }
    } else if (["#token"].includes(hash)) {
        const user = JSON.parse(localStorage.getItem("user"));
        const logindetails = JSON.parse(localStorage.getItem("logindetails"));

        // grab the id_token
        const idtoken = user.tokeninfo.id_token;
        const idtokenParts = idtoken.split(".");
        const idtokenHeader = JSON.parse(atob(idtokenParts[0]));
        const idtokenPayload = JSON.parse(atob(idtokenParts[1]));
        
        addTagHeadline(mainContainer, "Token Info");
        addTagParagraph(
            mainContainer,
            `Below is the various pieces of token information obtained from the IdP. To get the OpenID Connect configuration and keys for signature info use the link below.`
        );
        addTagLink(
            mainContainer,
            `/.well-known/openid-configuration`,
            `https://${logindetails.mydomain}/.well-known/openid-configuration`
        );
        addTagLink(
            mainContainer,
            `/id/keys`,
            `https://${logindetails.mydomain}/id/keys`
        );
        addTagSubheadline(mainContainer, "ID Token, header");
        addTagJson(mainContainer, idtokenHeader);
        addTagSubheadline(mainContainer, "ID Token, payload")
        addTagJson(
            mainContainer,
            idtokenPayload
        );
        addTagSubheadline(mainContainer, "Userinfo");
        addTagJson(mainContainer, user.userinfo);
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

window.addEventListener("DOMContentLoaded", async () => {
    // init app
    navigationClickHandler();

    // look for logindetails info in local storage and handle callback if applicable
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
        const respUserinfo = await fetch(`https://${logindetails.mydomain}/services/oauth2/userinfo?access_token=${tokeninfo.access_token}`);
        const userinfo = await respUserinfo.json();
        console.log(userinfo);

        // save user
        localStorage.setItem("user", JSON.stringify({
            tokeninfo,
            userinfo
        }));
        location.reload();
    }
});
window.addEventListener("hashchange", navigationClickHandler);
