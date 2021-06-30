
let scope = {
    taskbar: {
        load: (e) => {
            setInterval(function () {
                e.props.pra1 = e.props.pra1 + Math.round(Math.random() * 1);
            }, 50)
            window.addEventListener("mousemove", ev => {
                e.props.moux = ev.clientX;
                e.props.mouy = ev.clientY;
            })
        },
        change: (e) => {
            // console.log(e)
        }
    }
}

let anvil = new Anvil(scope);
anvil.init();
console.log(anvil);
console.log(document.getElementById("taskBar"));