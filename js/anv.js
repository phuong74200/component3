/*
    component3.js - anv.js

    author: phuong74200
    day: 05/31/2021
    ver: 1.4.61021b

    ** what news ** 1.2.61021b.js **

    - using varible directly inside html dom
    - fixing expression errors when using IF statement

    ** what news ** 1.3.61121b.js **

    - Replace innerHTML which mays cause xss with a new algorithm
    - Once you change the value of params the DOM would be affected too

     ** what news ** 1.4.61221b.js **

    - Once params changed, just the DOM which related to param change
    - Fixed the bug which caused expressions missing after reMap

    ** a brand of avail.js **

    J4F
*/

const Component = function (callbackScope) {
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
        function reMap(map, value) {
            if (map.node.nodeType == 3) {
                map.node.textContent = map.expression;
            } else {
                map.node.setAttribute(map.target, map.expression);
            }
            mapping(map.node, false);
        }
        for (let param of componentCons[tag].params) {
            let SELF = data.params;
            switch (param.type) {
                case "Number":
                    data.params[`_${param.name}`] = parseFloat(element.getAttribute(`${param.name}`));
                    Object.defineProperty(data.params, param.name, {
                        get: function (value) {
                            return parseFloat(this[`_${param.name}`])
                        },
                        set: function (value) {
                            this[`_${param.name}`] = parseFloat(value);
                            for (let map of maps) {
                                if (map.expression.includes(param.name)) {
                                    reMap(map)
                                }
                            }
                        }
                    })
                    break;
                default:
                    data.params[`_${param.name}`] = element.getAttribute(`${param.name}`);
                    Object.defineProperty(data.params, param.name, {
                        get: function (value) {
                            return this[`_${param.name}`]
                        },
                        set: function (value) {
                            this[`_${param.name}`] = value;
                            for (let map of maps) {
                                if (map.expression.includes(param.name)) {
                                    reMap(map)
                                }
                            }
                        }
                    })
                    break;
            }
            // feel free to keep or remove the line belows
            element.removeAttribute(param.info);
        }
        // -- Replace expression inside DOM
        let maps = [];
        function mapping(node, re = true) {
            if (node.nodeType == 3) {
                node.textContent = node.textContent.replace(/\{\{(.*?)\}\}/g, match => {
                    let params = componentCons[tag].params.map((param, index, params) => {
                        return param.name;
                    })
                    const expression = match.slice(2, match.length - 2);
                    if (re) {
                        maps.push({
                            node: node,
                            expression: node.textContent,
                            target: "content"
                        });
                    }
                    const f = new Function(...params, `return ${expression}`)
                    return f.apply(null, Object.values(data.params));
                });
            } else if (node.nodeType == 1) {
                for (let atr of node.attributes) {
                    atr.value = atr.value.replace(/\{\{(.*?)\}\}/g, match => {
                        let params = componentCons[tag].params.map((param, index, params) => {
                            return param.name;
                        })
                        const expression = match.slice(2, match.length - 2);
                        if (re) {
                            maps.push({
                                node: node,
                                expression: atr.value,
                                target: atr.name == "c-src" ? "src" : atr.name
                            });
                        }
                        const f = new Function(...params, `return ${expression}`)
                        return f.apply(null, Object.values(data.params));
                    });
                }
            }
            for (let child of node.childNodes) mapping(child);
        }
        mapping(cloned);
        console.log(maps)
        for (let node of cloned.querySelectorAll("[c-src]")) {
            node.setAttribute("src", node.getAttribute("c-src"));
            node.removeAttribute("c-src");
        }

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
        build: build,
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