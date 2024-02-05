import BoxSide from "./box-side.js";
import BoxBlur from "./box-blur.js";

customElements.define("box-side", BoxSide);
customElements.define("box-blur", BoxBlur);

class BoxImage extends HTMLElement {
    #box = null;
    #scene = null;
    #boxSide = null;
    #boxBlur = null;

    #isDragging = false;
    #startX = 0;
    #startY = 0;
    #rotationX = 0;
    #rotationY = 0;

    constructor() {
        super();

        this.#render();
    }

    connectedCallback() {
        this.#scene.addEventListener("pointerdown", this.#handleMousedown());
        this.#scene.addEventListener("pointermove", this.#handleMousemove());
        this.#scene.addEventListener("pointerout", this.#handleMouseup());
        this.#scene.addEventListener("pointerup", this.#handleMouseout());
    }

    disconnectedCallback() {
        this.#scene.removeEventListener("pointerdown", this.#handleMousedown());
        this.#scene.removeEventListener("pointermove", this.#handleMousemove());
        this.#scene.removeEventListener("pointerout", this.#handleMouseup());
        this.#scene.removeEventListener("pointerup", this.#handleMouseout());
    }

    #render() {
        const shadow = this.attachShadow({mode: 'closed'});
        shadow.innerHTML = `
            <style>
                .item-centered {
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-pack: center;
                    -ms-flex-pack: center;
                    justify-content: center;
                    -webkit-box-align: center;
                    -ms-flex-align: center;
                    align-items: center;
                }
                
                .scene {
                    width: 500px;
                    height: 500px;
                    cursor: -webkit-grab;
                    cursor: grab;
                    border: 1px solid #ccc;
                    -webkit-perspective: 800px;
                    perspective: 800px;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -ms-touch-action: none;
                    touch-action: none
                }
                
                .box {
                    width: 300px;
                    height: 300px;
                    position: relative;
                    -webkit-transform-style: preserve-3d;
                    transform-style: preserve-3d;
                    -webkit-transform: translateZ(-50px);
                    transform: translateZ(-50px);
                    /*transition: transform 0.15s;*/
                    pointer-events: none;
                }
                
                .box--flat {
                    -webkit-transform-style: flat;
                    transform-style: flat;
                    -webkit-transform: translateZ(-150px);
                    transform: translateZ(-150px);
                }
                
                .box__text {
                    color: white;
                    font-size: 40px;
                    font-weight: bold;
                    text-shadow: 3px 3px 5px black;
                }
                
                @media only screen and (max-width: 600px) {
                    .scene {
                        width: 400px;
                        height: 400px;
                    }
                }
            </style>
            <div class="scene item-centered" id="scene">
                <div class="box" id="box">
                    <box-blur id="box-blur" box-position="front"></box-blur>
                    <box-side id="box-side" box-position="front">
                        <span class="box__text">front</span>
                    </box-side>
                    <box-blur id="box-blur" box-position="back"></box-blur>
                    <box-side id="box-side" box-position="back">
                        <span class="box__text">back</span>
                    </box-side>
                    <box-blur id="box-blur" box-position="right"></box-blur>
                    <box-side id="box-side" box-position="right">
                        <span class="box__text">right</span>
                    </box-side>
                    <box-blur id="box-blur" box-position="left"></box-blur>
                     <box-side id="box-side" box-position="left">
                        <span class="box__text">left</span>
                    </box-side>
                    <box-blur id="box-blur" box-position="top"></box-blur>
                    <box-side id="box-side" box-position="top">
                        <span class="box__text">top</span>
                    </box-side>
                    <box-blur id="box-blur" box-position="bottom"></box-blur>
                    <box-side id="box-side" box-position="bottom">
                        <span class="box__text">bottom</span>
                    </box-side>
                </div>
            </div>
        `;

        this.#box = shadow.getElementById("box");
        this.#scene = shadow.getElementById("scene");
        this.#boxSide = shadow.querySelectorAll("#box-side");
        this.#boxBlur = shadow.querySelectorAll("#box-blur");
    }

    static get observedAttributes() {
        return ['image-url', 'show-flat', 'enable-blur', 'enable-names', 'box-type', 'blur-offset'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const attributeCallback = this.#mapAttributesCallback(name);

        attributeCallback?.(newValue);
    }

    #mapAttributesCallback(name) {
        const attributesCallback = {
            'image-url': this.#imageUrlAttributeCallback,
            'show-flat': this.#showFlatAttributeCallback,
            'enable-blur': this.#enableBlurAttributeCallback,
            'enable-names': this.#enableNamesAttributeCallback,
            'box-type': this.#boxTypeAttributeCallback,
            'blur-offset': this.#blurOffsetAttributeCallback,
        }

        return attributesCallback[name]?.bind(this);
    }

    #imageUrlAttributeCallback(value) {
        [...this.#boxSide, ...this.#boxBlur].forEach((element) => {
            element.setAttribute('image-url', value);
        });
    }

    #showFlatAttributeCallback() {
        this.#box.classList.toggle('box--flat');

        [...this.#boxSide, ...this.#boxBlur].forEach((element) => {
            element.toggleAttribute('show-flat');
        });
    }

    #enableNamesAttributeCallback() {
        [...this.#boxSide].forEach((element) => {
            element.toggleAttribute('enable-names');
        });
    }

    #enableBlurAttributeCallback() {
        [...this.#boxBlur].forEach((element) => {
            element.toggleAttribute('enable-blur');
        });
    }


    #boxTypeAttributeCallback(value) {
        [...this.#boxSide].forEach((element) => {
            element.setAttribute('box-type', value);
        });
    }

    #blurOffsetAttributeCallback(value) {
        [...this.#boxBlur].forEach((element) => {
            element.setAttribute('blur-offset', value);
        });
    }

    #handleMousedown() {
        return (e) => {
            this.#isDragging = true;
            this.#startX = e.clientX;
            this.#startY = e.clientY;
        }
    }

    #handleMousemove() {
        return (e) => {
            if (!this.#isDragging) return;

            const deltaX = e.clientX - this.#startX;
            const deltaY = e.clientY - this.#startY;

            this.#rotationY += deltaX / 3;
            this.#rotationX -= deltaY / 3;

            this.#box.style.transform = `translateZ(-150px) rotateX(${this.#rotationX}deg) rotateY(${this.#rotationY}deg)`;

            this.#startX = e.clientX;
            this.#startY = e.clientY;
        }

    }

    #handleMouseup() {
        return () => {
            this.#isDragging = false;
        }

    }

    #handleMouseout() {
        return () => {
            this.#isDragging = false;
        }
    }
}

export default BoxImage;
