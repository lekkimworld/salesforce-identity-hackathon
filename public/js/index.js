const getMyDomainFromLoginDetails = (logindetails) => {
    const myDomain =
        logindetails.mydomain.indexOf("https://") === 0 ? logindetails.mydomain : `https://${logindetails.mydomain}`;
    return myDomain;
};
const getLoginDetails = async () => {
    // get logindetails
    const strlogindetails = localStorage.getItem("logindetails");
    let logindetails;
    if (strlogindetails) {
        logindetails = JSON.parse(strlogindetails);
    } else {
        const resp = await fetch("/api/logindetails", {
            method: "get",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
        });
        logindetails = await resp.json();
        localStorage.setItem("logindetails", JSON.stringify(logindetails));
    }
    return logindetails;
};
let usermgr = new Promise(async (resolve, reject) => {
    // get logindetails
    const logindetails = await getLoginDetails();

    // get usermanager
    const mgr = new oidc.UserManager({
        authority: logindetails.mydomain,
        client_id: logindetails.client_id,
        redirect_uri: logindetails.redirect_uri,
        scope: "openid refresh_token",
        loadUserInfo: true,
        userStore: new oidc.WebStorageStateStore({ store: window.localStorage }),
    });
    console.log("Adding event listeners on the UserManager");
    mgr.events.addAccessTokenExpired(() => {
        console.log("Received AccessTokenExpired event");
    });
    mgr.events.addAccessTokenExpiring(() => {
        console.log("Received AccessTokenExpiring event");
    });
    resolve(mgr);
});

const getUserManager = async () => {
    return await usermgr;
};
const navigationHandler_Login = async () => {
    // get user manager
    const mgr = await getUserManager();
    mgr.signinRedirect({
        state: {
            foo: "baz",
        },
    });
};
const navigationHandler_Logout = async () => {
    const mgr = await getUserManager();
    await mgr.removeUser();
    await mgr.signoutRedirect();
    document.location.hash = "#";
};

const addTagHeadline = (container, text) => {
    const elemHeadline = document.createElement("h1");
    elemHeadline.className = "cover-heading";
    elemHeadline.appendChild(document.createTextNode(text));
    container.appendChild(elemHeadline);
    return elemHeadline;
};
const addTagParagraph = (container, text) => {
    const e = document.createElement("p");
    e.className = "lead";
    e.appendChild(document.createTextNode(text));
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
};
const getUser = async () => {
    const mgr = await getUserManager();
    return mgr.getUser();
};
const buildMenu = async () => {
    // get user
    const user = await getUser();

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
};
const navigationClickHandler = async (ev) => {
    const mgr = await getUserManager();
    const user = await getUser();
    const hash = document.location.hash;
    console.log("Current hash", hash);
    buildMenu();

    const mainContainer = document.querySelector("main[role='main']");
    mainContainer.innerText = "";
    if (["", "#"].includes(hash)) {
        if (user) {
            addTagHeadline(mainContainer, `Welcome ${user.profile.name}`);
            const respData = await fetch("/api/userinfo", {
                headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${user.access_token}`,
                },
            });
            const data = await respData.json();
            addTagParagraph(mainContainer, `UUID: ${data.uuid}`);
        } else {
            addTagHeadline(mainContainer, `Welcome - please authenticate`);
        }
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
};

window.addEventListener("DOMContentLoaded", async () => {
    // init app
    navigationClickHandler();

    // look for logindetails info in local storage and handle callback if applicable
    if (
        location.search.includes("state=") &&
        (location.search.includes("code=") || location.search.includes("error="))
    ) {
        const mgr = await getUserManager();
        const user = await mgr.signinCallback();
        window.history.replaceState({}, document.title, "/");

        // reload
        location.reload();
    }
});
window.addEventListener("hashchange", navigationClickHandler);
