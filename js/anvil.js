/*
    project: anvil.js - improved component.js
    version: 4.0.0
    author : fuong74200
    day    : 22 June 2021

    - update notes:
        + 30/06/2021

*/

const Anvil = function (callbackScope) {
    const ANVIL = this;
    const utils = {
        uuidv4: () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        toFunction: function (string) {
            var scope = callbackScope;
            var scopeSplit = string.split('.');
            for (i = 0; i < scopeSplit.length - 1; i++) {
                scope = scope[scopeSplit[i]];
                if (scope == undefined) return;
            }
            return scope[scopeSplit[scopeSplit.length - 1]];
        }
    }
    this._hold_ = {
        components: {},
        expression: []
    }
    this._core_ = {
        collect: (container) => {
            let components = document.querySelectorAll("component");
            for (let component of components) {
                const tagName = component.getAttribute("*name").toUpperCase();
                this._hold_.components[tagName] = {
                    render: component.querySelector("render").cloneNode(true),
                    props: [...component.querySelectorAll("prop")].map(param => {
                        return {
                            name: param.getAttribute("*name"),
                            type: param.getAttribute("*type"),
                            default: param.textContent
                        }
                    }),
                    function: {
                        load: component.getAttribute("(load)"),
                        change: component.getAttribute("(change)")
                    }
                }
                component.remove();
            }
        },
        inherit: (src, dest) => {
            for (let attr of src.attributes) {
                if (attr.nodeName == "class")
                    dest.classList.add(attr.nodeValue);
                else
                    dest.setAttribute(attr.nodeName, attr.nodeValue);
            }
            let children = dest.querySelectorAll("*")
        },

        // listen for props change and then update the Node

        bind: function (tagName, element) {
            const BIND = this;
            this._hold_ = {
                props: {},
                include: []
            };
            this.bind = (obj, prop, getf, setf) => {
                Object.defineProperty(data.params, param.name, {
                    get: setf,
                    set: setf
                })
            };
            this.update = (propName) => {
                for (let exp of BIND._hold_.include) {
                    if (exp.expression.includes(propName)) {
                        let newContent = exp.expression.replace(/\{\{(.*?)\}\}/g, match => {
                            let parsed = this.parse(match, exp.node);
                            return parsed;
                        });
                        if (newContent != exp.node.textContent) exp.node.textContent = newContent;
                        ANVIL._core_.trigger(tagName, "change", {
                            target: exp.node,
                            bind: BIND,
                            modify: exp.node,
                            props: this._hold_.props,
                            params: this._hold_.props,
                            __anvil__: ANVIL
                        });
                    }
                }
            };

            // collect all props of the component

            this.collect = () => {
                for (let prop of ANVIL._hold_.components[tagName].props) {
                    switch (prop.type) {
                        case "Number":
                            this._hold_.props[`_${prop.name}`] = parseFloat(element.getAttribute(`${prop.name}`) || prop.default);
                            Object.defineProperty(this._hold_.props, prop.name, {
                                get: function () {
                                    return parseFloat(this[`_${prop.name}`]);
                                },
                                set: function (value) {
                                    BIND._hold_.props[`_${prop.name}`] = parseFloat(value);
                                    BIND.update(prop.name);
                                }
                            })
                            break;
                        default:
                            this._hold_.props[`_${prop.name}`] = element.getAttribute(`${prop.name}`) || prop.default;
                            Object.defineProperty(this._hold_.props, prop.name, {
                                get: function () {
                                    return this[`_${prop.name.toString()}`];
                                },
                                set: function (value) {
                                    BIND._hold_.props[`_${prop.name}`] = value.toString();
                                    BIND.update(prop.name);
                                }
                            })
                            break;
                    }
                    element.removeAttribute(prop.name)
                }
            };
            this.parse = (expression, node = null) => {
                let params = ANVIL._hold_.components[tagName].props.map((param, index, params) => {
                    return param.name;
                });
                expression = expression.slice(2, expression.length - 2);
                const f = new Function(...params, `return ${expression}`);
                const pointer = {
                    target: node,
                    props: this._hold_.props,
                    params: this._hold_.props,
                    __anvil__: ANVIL
                };
                return f.apply(pointer, Object.values(this._hold_.props));
            };
            this.build = (node) => {
                if (node.nodeType == 3) {
                    node.textContent = node.textContent.replace(/\{\{(.*?)\}\}/g, match => {
                        this._hold_.include.push({
                            node: node,
                            expression: node.textContent
                        });
                        let parsed = this.parse(match, node);
                        return parsed;
                    });
                } else {
                    if (node.attributes) {
                        for (let attr of node.attributes) {
                            if (attr.name == "*src") {
                                node.setAttribute("src", attr.value);
                            }
                            attr.value = attr.value.replace(/\{\{(.*?)\}\}/g, match => {
                                this._hold_.include.push({
                                    node: attr,
                                    expression: attr.value
                                });
                                let parsed = this.parse(match, node);
                                return parsed;
                            });
                        }
                    }
                }
                for (let child of node.childNodes) {
                    this.build(child);
                };
            }
            this.collect();
            this.build(element);
        },
        build: (node) => {
            for (let tagName of Object.keys(this._hold_.components)) {
                while (node.getElementsByTagName(`${tagName}`).length > 0) {
                    this._core_.render(node.getElementsByTagName(`${tagName}`)[0]);
                }
            }
        },
        trigger: (tagName, funcName, data) => {
            if (this._hold_.components[tagName].function[funcName]) {
                utils.toFunction(this._hold_.components[tagName].function[funcName])(data)
            }
        },
        render: (node) => {
            const tagName = node.tagName;
            const replacer = this._hold_.components[tagName].render.querySelector("*").cloneNode(true);
            const children = replacer.querySelectorAll("*");
            node.replaceWith(replacer);
            const root = replacer.querySelector("root");
            if (root) {
                console.log(root)
                root.replaceWith(...node.childNodes)
            }
            this._core_.inherit(node, replacer);
            this._core_.build(replacer);
            const bind = new this._core_.bind(tagName, replacer);
            replacer.onload = this._core_.trigger(tagName, "load", {
                target: replacer,
                bind: bind,
                props: bind._hold_.props,
                params: bind._hold_.props,
                __anvil__: ANVIL
            });
        }
    }
    this.init = () => {
        anvil._core_.collect(document);
        this._core_.build(document);
        const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    let node = mutation.addedNodes[mutation.addedNodes.length - 1];
                    if (node && node.nodeType == 1 && this._hold_.components[node.tagName]) {
                        this._core_.render(node);
                    }
                }
            }
        });
        observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    }
}