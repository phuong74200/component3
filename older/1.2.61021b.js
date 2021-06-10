/*
    component3.js

    author: phuong74200
    day: 05/31/2021
    ver: 1.2.61021b

    ** what news **

    - using varible directly inside html dom

    ** a brand of avail.js **

    J4F
*/

const components = function (callbackScope) {
    const getFunctionFromString = function (string) {
        var scope = callbackScope;
        var scopeSplit = string.split('.');
        for (i = 0; i < scopeSplit.length - 1; i++) {
            scope = scope[scopeSplit[i]];
            if (scope == undefined) return;
        }
        return scope[scopeSplit[scopeSplit.length - 1]];
    }
    let componentCons = {};
    for (let component of document.querySelectorAll("component")) {
        const name = component.getAttribute("name").toLowerCase();
        const render = component.querySelector("render");
        const params = component.querySelectorAll("param");
        componentCons[name] = {
            render: render.querySelector("*").cloneNode(true),
            callback: component.getAttribute("bind"),
            params: []
        };
        for (let param of params) {
            componentCons[name].params.push({
                name: param.getAttribute("name"),
                type: param.getAttribute("type")
            })
        }
        // feel free to keep or remove the line belows
        component.remove();
    }
    const render = function (element) {
        const tag = element.tagName.toLowerCase();
        let cloned = componentCons[tag].render.cloneNode(true);

        for (let atr of element.attributes) {
            if (atr.nodeName == "class") {
                cloned.classList.add(atr.nodeValue);
            } else {
                cloned.setAttribute(atr.nodeName, atr.nodeValue);
            }
        }
        element.replaceWith(cloned);
        for (let child of cloned.querySelectorAll("*")) {
            const tag = child.tagName.toLowerCase();
            if (componentCons[tag]) render(child);
        }
        let data = {
            target: cloned,
            params: {},
            on: {},
            api: {
                components: componentCons,
                rebuild: build,
                render: render
            }
        };
        // data.target.root = rootParent;
        for (let param of componentCons[tag].params) {
            switch (param.type) {
                case "Number":
                    data.params[param.name] = parseFloat(element.getAttribute(`${param.name}`));
                    break;
                default:
                    data.params[param.name] = element.getAttribute(`${param.name}`);
                    break;
            }
            // feel free to keep or remove the line belows
            element.removeAttribute(param.name);
        }
        // -- Replace expression inside DOM 
        cloned.innerHTML = cloned.innerHTML.replace(/\{\{(.*?)\}\}/g, match => {
            let params = componentCons[tag].params.map((param, index, params) => {
                return param.name;
            })
            const expression = match.slice(2, match.length - 2);
            const f = new Function(...params, `return ${expression}`)
            return f.apply(null, Object.values(data.params));
        });
        // -- Change root
        const root = cloned.querySelector(`root`);
        let rootParent;
        if (root) rootParent = cloned.querySelector(`root`).parentElement;
        if (root) root.replaceWith(...element.childNodes);
        data.target.root = rootParent;
        element.onload = componentCons[tag].callback ? getFunctionFromString(componentCons[tag].callback)(data) : null;
        // if (data.on.complete) data.on.complete();
        if (element.callback) element.callback(data);
        return cloned
    }
    const build = function () {
        for (let tag of Object.keys(componentCons)) {
            while (document.getElementsByTagName(`${tag}`).length > 0) {
                render(document.getElementsByTagName(`${tag}`)[0]);
            }
        }
    }
    build();
    const observer = new MutationObserver(function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                let node = mutation.addedNodes[mutation.addedNodes.length - 1];
                if (node && node.nodeType == 1 && componentCons[node.tagName.toLowerCase()]) {
                    render(node);
                }
            }
        }
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    return {
        components: componentCons,
        rebuild: build,
        render: render
    };
};
const Element = function (name, params = {}) {
    let element = document.createElement(name.toLowerCase());
    for (let key of Object.keys(params)) {
        element.setAttribute(key, params[key]);
    }
    return element;
}