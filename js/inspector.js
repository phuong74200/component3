/*
    require anv.js
*/

function anvDebug(scope) {
    const border = document.createElement("div");
    border.style.border = "2px solid #FF6F61";
    border.style.position = "absolute";
    border.style.boxSizing = "border-box";
    border.style.pointerEvents = "none";
    border.style.width = 300;
    border.style.height = 300;
    border.style.opacity = "0";
    border.style.transition = "all .5s, opacity .3s";
    border.style.borderRadius = "7px";
    document.body.appendChild(border)
    const div = document.createElement("div");
    div.style.maxWidth = "1000px";
    div.style.height = "auto";
    div.style.background = "rgba(255, 255, 255, .5)";
    div.style.color = "#363945";
    div.style.backdropFilter = "blur(20px)";
    div.style.position = "absolute";
    div.style.zIndex = "99";
    div.style.borderRadius = "7px";
    div.style.boxShadow = "rgba(0, 0, 0, 0.1) 0px 4px 12px";
    div.style.padding = "16px";
    div.style.fontFamily = "Rubik";
    div.style.fontSize = "14px";
    div.style.display = "none";
    div.style.pointerEvents = "none";
    document.body.appendChild(div);
    if (scope.debug) {
        function indent(node) {
            if (node.getAttribute("component")) return node;
            if (node.parentElement) return indent(node.parentElement);
            return false;
        }
        document.addEventListener("mousemove", e => {
            if (node = indent(e.target)) {
                border.style.opacity = "1";
                border.style.top = `${node.offsetTop - 10}px`;
                border.style.left = `${node.offsetLeft - 10}px`;
                border.style.width = `${node.offsetWidth + 20}px`;
                border.style.height = `${node.offsetHeight + 20}px`;

                let uid = node.getAttribute("component");
                let params = "";
                for (let param of Object.entries(scope.debug.rendered[uid].params)) {
                    params += `
                        <tr>
                            <td>${param[0].slice(1, param[0].length)}</td>
                            <td style="padding: 10px 15px">${typeof param[1]}</td>
                            <td>${param[1]}</td>
                        </tr>
                    `
                }
                let time = scope.debug.rendered[uid].time;
                function tag(value, bg = "#8042FF") {
                    return `<div style="center; background: ${bg}; width: 50px; padding: 4px; text-align: center; border-radius: 5px; ">${value}</div>`
                }
                div.innerHTML = `
                    <div>
                        <div style="display: flex; gap: 5px">
                            ${tag(`${time}ms`, `rgba(${time * 10}, ${255 - time * 10 < 0 ? 0 : 255 - time * 10}, 0)`)}
                            ${tag(e.target.getAttribute("component") ? "component" : "child")}
                            ${tag("anv")}
                        </div>
                        <div>
                            <h3>${scope.debug.rendered[uid].tag}</h3>
                            <table border=16 frame=hsides rules=rows style="width: 100%; word-break: break-all">
                                <tr>
                                    <td><b>uid</b></td>
                                    <td style="padding: 10px 15px">:</td>
                                    <td>${uid}</td>
                                </tr>
                                <tr>
                                    <td><b>bind</b></td>
                                    <td style="padding: 10px 15px">:</td>
                                    <td>${scope.debug.rendered[uid].bind}</td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <h3>parameters</h3>
                            <table border=16 frame=hsides rules=rows style="width: 100%; word-break: break-all">
                                ${params}
                            </table>
                        </div>
                    </div>
                `
                div.style.display = "flex";
                div.style.left = `${e.clientX + 10}px`;
                div.style.top = `${e.clientY + 10}px`;
                if (div.offsetHeight + div.offsetTop > window.innerHeight) {
                    div.style.top = `${e.clientY - div.offsetHeight - 10}px`;
                }
            } else {
                div.style.display = "none";
                border.style.opacity = "0";
            }
        })
    } else {
        console.error(" Debug is off!")
    }
}