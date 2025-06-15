import React from "react";

function range(...args) {
    let from = 0;
    let to;
    let step = 1;

    switch(args.length) {
        case 1:
            to = args[0];
            break;
        case 2:
            from = args[0];
            to = args[1];
            break;
        case 3:
            from = args[0];
            to = args[1];
            step = args[2];
            break;
        default:
            throw new Error('Only 1~3 arguments allowed.');
    }

    const top = Math.floor((to - from)/step);
    const f = i => i * step + from;
    return [...Array(top).keys()].map(f);
}

class Avatar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // user: this.props.user,
            uid: this.props.uid,
            eid: range(16).map(()=>Math.floor(Math.random()*16).toString(16)).join(''),
            size: 'size' in this.props ? this.props.size : 32,
        };
    }

    static getDerivedStateFromProps(props) {
        return {
            uid: props.uid,
        };
    }

    render() {
        const bytes = new TextEncoder().encode(this.state.uid);
        window.crypto.subtle.digest('sha-256', bytes).then((value) => {
            const u32arr = new DataView(new Uint8Array(value).buffer);
            const s = u32arr.getUint32(0);
            const c = document.querySelector("#avatar_" + this.state.eid);
            const ctx = c.getContext("2d");
            ctx.clearRect(0, 0, this.state.size, this.state.size);
            const colors = ['lightgreen', 'lightblue', 'pink', 'plum'];
            const ci = u32arr.getUint32(0) % colors.length;
            ctx.fillStyle= colors[ci];
            const edgel = this.state.size / 8;
            range(32).forEach((i) => {
                const m = i % 4;
                const n = Math.floor(i / 4);
                if (s & (1<<i)) { //eslint-disable-line no-bitwise
                    const x = m*edgel;
                    const y = n*edgel;
                    ctx.fillRect(x, y, edgel, edgel);
                    const x1 = (7-m) * edgel;
                    ctx.fillRect(x1, y, edgel, edgel);
                }
            });
        });
        return (
            <canvas width={this.state.size.toString()} height={this.state.size.toString()} id={"avatar_" + this.state.eid}></canvas>
        );
    }
}

export default Avatar;