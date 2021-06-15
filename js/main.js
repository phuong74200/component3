let scope = {
    Menu: component => {
        let closeAll = e => {
            component.root.style.display = "none";
            document.removeEventListener("click", closeAll);
        };
        component.target.querySelector(".menu-head").addEventListener("click", e => {
            e.stopPropagation();
            component.root.style.display = "block";
            for (let node of component.root.children) {
                node.onclick = e => {
                    component.params.jsPlaceHolder = node.textContent;
                    component.target.value = node.textContent;
                    closeAll();
                }
            }
            document.addEventListener("click", closeAll);
        });
    }
}

let component = new Component(scope, { debug: true });

component.load("./components/pack1.cpn.html")

anvDebug(component);