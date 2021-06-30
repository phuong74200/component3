/*
    project: anvil.js - next version of component.js
    version: 4.0.0
    author : fuong74200
    day    : 22 June 2021
*/

const Anvil = function (scope) {
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

    this.core = {
        attributes: {
            inherit: function (source, dest) {
                for (let atr of source.attributes) {
                    if (atr.nodeName == "class")
                        dest.classList.add(atr.nodeValue);
                    else
                        dest.setAttribute(atr.nodeName, atr.nodeValue);
                }
            }
        },
        expressionParse: (expression, params) => {
            console.log(expression)
            expression = expression.slice(2, expression.length - 2);
            const f = new Function(...params, `return ${expression}`)
            return f.apply(null, Object.values(params));
        }
    };

    this.map = {};
    this.expressions = [];

    this.collector = (node) => {
        for (let componentNode of node.querySelectorAll("component")) {
            const tag = componentNode.tagName.toLowerCase();
            this.map[componentNode.getAttribute("name").toLowerCase()] = {
                render: componentNode.querySelector("render").querySelector("*").cloneNode(true),
                params: [...componentNode.querySelectorAll("param")].map((param, index) => {
                    return {
                        name: param.getAttribute("name"),
                        type: param.getAttribute("type"),
                        hold: param.getAttribute("hold")
                    }
                }),
                bind: componentNode.getAttribute("bind")
            }
            // componentNode.remove();
        }
    }

    this.render = (node) => {
        const tag = node.tagName.toLowerCase();
        const map = this.map[tag] ? this.map[tag] : null;
        const renderNode = map.render.cloneNode(true);

        this.core.attributes.inherit(node, renderNode);
        node.replaceWith(renderNode);
        for (let child of renderNode.querySelectorAll("*")) if (this.map[child.tagName.toLowerCase()]) this.render(child);

        for (let child of renderNode.querySelectorAll("*")) child.textContent = child.textContent.replace(/\{\{(.*?)\}\}/g, match => {
            this.core.expressionParse(match, tag);
        })
    }

    function generateParams(node) {
        return node;
    }

    const build = () => {
        for (let tag of Object.keys(this.map)) {
            while (document.getElementsByTagName(`${tag}`).length > 0) {
                this.render(document.getElementsByTagName(`${tag}`)[0]);
            }
        }
    }

    this.collector(document)
    build();
}

let anvil = new Anvil();
console.log(anvil.map);