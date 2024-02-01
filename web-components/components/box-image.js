export const BOX_TYPE = {
    containInner: 'contain-inner',
    coverInner: 'cover-inner',
    containOuter: 'contain-outer',
    coverOuter: 'cover-outer'
}

const MAP_ALBUM_IMAGE_CLASS = {
    [BOX_TYPE.containInner]: 'box__face--inner-contain',
    [BOX_TYPE.coverInner]: 'box__face--inner-cover',
    [BOX_TYPE.containOuter]: 'box__face--outer-cover',
    [BOX_TYPE.coverOuter]: 'box__face--outer-contain',
}

const MAP_PORTRAIT_IMAGE_CLASS = {
    [BOX_TYPE.containInner]: 'box__face--inner-contain',
    [BOX_TYPE.coverInner]: 'box__face--inner-cover',
    [BOX_TYPE.containOuter]: 'box__face--outer-contain',
    [BOX_TYPE.coverOuter]: 'box__face--outer-cover',
}

class BoxImage extends HTMLElement {
    #box = null;
    #scene = null;
    #boxFace = null;

    #isPortraitImage = false;
    #isAlbumImage = false;
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
                
                .box__face {
                    position: absolute;
                    border: 0.5px solid black;
                    text-align: center;
                    background-size: contain;
                    background-repeat: no-repeat;
                    z-index: 2;
                }
                
                .box__face:not(.box__face--back) {
                    background-image: url("https://picsum.photos/700");
                }
                
                .box__text {
                    display: none;
                    color: white;
                    font-size: 40px;
                    font-weight: bold;
                    text-shadow: 3px 3px 5px black;
                }
                
                .box__face--inner-cover {
                    background-size: cover;
                }
                
                .box__face--inner-contain {
                    background-size: contain;
                }
                
                .box__face--outer-cover {
                    background-size: 500px auto;
                }
                
                .box__face--outer-contain {
                    background-size: auto 500px;
                }
                
                .box__face--blur {
                    -webkit-filter: blur(3px);
                    filter: blur(3px);
                    background-size: auto 500px;
                    display: none;
                    z-index: 1;
                }
                
                .box__face--front,
                .box__face--back {
                    width: 300px;
                    height: 300px;
                    line-height: 300px;
                }
                
                .box__face--right,
                .box__face--left {
                    width: 100px;
                    height: 300px;
                    left: 100px;
                    line-height: 300px;
                }
                
                .box__face--top,
                .box__face--bottom {
                    width: 300px;
                    height: 100px;
                    top: 50px;
                    line-height: 100px;
                }
                
                .box__face--front {
                    /* background: hsla(0, 76%, 69%, 0.7); */
                
                    background-position: 50%;
                }
                
                .box__face--right {
                    /* background: hsla(60, 100%, 50%, 0.7); */
                
                    background-position: calc(50% - 200px) 50%;
                }
                
                .box__face--back {
                    /*background: hsla(120, 100%, 50%, 0.7);*/
                }
                
                .box__face--left {
                    /* background: hsla(180, 100%, 50%, 0.7); */
                
                    background-position: calc(50% + 200px) 50%;
                }
                
                .box__face--top {
                    /* background: hsla(240, 100%, 50%, 0.7); */
                    background-position: 50% calc(50% + 200px);
                }
                
                .box__face--bottom {
                    /* background: hsla(300, 100%, 50%, 0.7); */
                    background-position: 50% calc(50% - 200px);
                }
                
                .box__face--front {
                    -webkit-transform: rotateY(0deg) translateZ(50px);
                    transform: rotateY(0deg) translateZ(50px);
                }
                
                .box__face--back {
                    -webkit-transform: rotateY(180deg) translateZ(50px);
                    transform: rotateY(180deg) translateZ(50px);
                }
                
                .box__face--right {
                    -webkit-transform: rotateY(90deg) translateZ(150px);
                    transform: rotateY(90deg) translateZ(150px);
                }
                
                .box__face--left {
                    -webkit-transform: rotateY(-90deg) translateZ(150px);
                    transform: rotateY(-90deg) translateZ(150px);
                }
                
                .box__face--top {
                    -webkit-transform: rotateX(90deg) translateZ(100px);
                    transform: rotateX(90deg) translateZ(100px);
                }
                
                .box__face--bottom {
                    -webkit-transform: rotateX(-90deg) translateZ(200px);
                    transform: rotateX(-90deg) translateZ(200px);
                }

                .box--flat {
                    -webkit-transform-style: flat;
                    transform-style: flat;
                    -webkit-transform: translateZ(-150px);
                    transform: translateZ(-150px);
                }
                
                .box--flat .box__face--back {
                    display: none;
                }
                
                .box--flat .box__face--right {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateX(200px);
                    transform: rotateY(0deg) translateZ(0px) translateX(200px);
                }
                
                .box--flat .box__face--left {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateX(-200px);
                    transform: rotateY(0deg) translateZ(0px) translateX(-200px);
                }
                
                .box--flat .box__face--top {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateY(-150px);
                    transform: rotateY(0deg) translateZ(0px) translateY(-150px);
                }
                
                .box--flat .box__face--bottom {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateY(250px);
                    transform: rotateY(0deg) translateZ(0px) translateY(250px);
                }
                
               .box--blur .box__face--blur {
                    display: block;
                }

                .box--names .box__text {
                    display: block;
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
                    <div class="box__face box__face--front box__face--blur"></div>
                    <div class="box__face box__face--front"><span class="box__text">front</span></div>
                    <div class="box__face box__face--back box__face--blur">tt</div>
                    <div class="box__face box__face--back"><span class="box__text">back</span></div>
                    <div class="box__face box__face--right box__face--blur"></div>
                    <div class="box__face box__face--right"><span class="box__text">right</span></div>
                    <div class="box__face box__face--left box__face--blur"></div>
                    <div class="box__face box__face--left"><span class="box__text">left</span></div>
                    <div class="box__face box__face--top box__face--blur"></div>
                    <div class="box__face box__face--top"><span class="box__text">top</span></div>
                    <div class="box__face box__face--bottom box__face--blur"></div>
                    <div class="box__face box__face--bottom"><span class="box__text">bottom</span></div>
                </div>
            </div>
        `;

        this.#box = shadow.getElementById("box");
        this.#scene = shadow.getElementById("scene");
        this.#boxFace = shadow.querySelectorAll(".box__face:not(.box__face--back)");
    }

    static get observedAttributes() {
        return ['image-url', 'show-flat', 'enable-blur', 'enable-names', 'box-type', 'blur-offset'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const attributeCallback = this.#mapAttributesCallback(name);

        attributeCallback(newValue);
    }

    #mapAttributesCallback(name) {
        const attributesCallback = {
            'image-url': this.imageUrlAttributeCallback,
            'show-flat': this.#showFlatAttributeCallback,
            'enable-blur': this.#enableBlurAttributeCallback,
            'enable-names': this.#enableNamesAttributeCallback,
            'box-type': this.#boxTypeAttributeCallback,
            'blur-offset': this.#blurOffsetAttributeCallback,
        }

        return attributesCallback[name].bind(this);
    }

    #getImage(value) {
        const image = new Image();

        return new Promise((resolve, reject) => {
            image.src = value;
            image.onload = function (t) {
                resolve(image);
            };
            image.onerror = function () {
                reject('Sorry something went wrong');
            }
        })
    }

    imageUrlAttributeCallback(value) {
        this.#getImage(value)
            .then(({src, width, height}) => {
                    this.#isAlbumImage = width > height;
                    this.#isPortraitImage = width < height;

                    [...this.#boxFace].forEach((element) => {
                        element.style.backgroundImage = `url('${src}')`;
                    });

                    this.#boxTypeAttributeCallback(this.getAttribute('box-type'));
                    this.#blurOffsetAttributeCallback(this.getAttribute('blur-offset'));
                }
            ).catch((message) => {
            console.error(message);
        })
    }

    #showFlatAttributeCallback(value) {
        this.#toggleBoxClassByAttributeValue('box--flat', value);
    }

    #enableBlurAttributeCallback(value) {
        this.#toggleBoxClassByAttributeValue('box--blur', value);
    }

    #enableNamesAttributeCallback(value) {
        this.#toggleBoxClassByAttributeValue('box--names', value);
    }

    #toggleBoxClassByAttributeValue(className, value) {
        if (value !== null) {
            this.#box.classList.add(className);
        } else {
            this.#box.classList.remove(className);
        }
    }

    #resetPrevBoxTypeClass(element) {
        Object.values({...MAP_ALBUM_IMAGE_CLASS, ...MAP_PORTRAIT_IMAGE_CLASS}).forEach((className) => {
            const isContains = element.classList.contains(className);

            if (isContains) {
                element.classList.remove(className);
            }
        })
    }

    #boxTypeAttributeCallback(value) {
        [...this.#boxFace].forEach((element) => {
            const isBlurElement = element.classList.contains('box__face--blur');

            if (!isBlurElement) {
                let boxTypeClass = this.#isAlbumImage
                    ? MAP_ALBUM_IMAGE_CLASS[value]
                    : MAP_PORTRAIT_IMAGE_CLASS[value];

                this.#resetPrevBoxTypeClass(element);
                element.classList.add(boxTypeClass);
            }
        });
    }

    #blurOffsetAttributeCallback(value) {
        [...this.#boxFace].forEach((element) => {
            const isBlurElement = element.classList.contains('box__face--blur');

            if (isBlurElement) {
                element.style.backgroundSize = this.#isAlbumImage
                    ? `auto ${value}px`
                    : `${value}px auto`;
            }
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
