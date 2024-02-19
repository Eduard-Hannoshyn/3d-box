class BoxFace extends HTMLElement {
    isAlbumImage = false;

    constructor() {
        super();

        this.render();
    }

    static get observedAttributes() {
        return ['image-url'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const attributeCallback = this.#mapAttributesCallback(name);

        attributeCallback?.(newValue);
    }

    #mapAttributesCallback(name) {
        const attributesCallback = {
            'image-url': this.imageUrlAttributeCallback,
        }

        return attributesCallback[name]?.bind(this);
    }

    getImage(value) {
        const image = new Image();

        return new Promise((resolve, reject) => {
            image.src = value;
            image.onload = function () {
                resolve(image);
            };
            image.onerror = function () {
                reject('Sorry something went wrong');
            }
        })
    }

    imageUrlAttributeCallback(value) {
        return this.getImage(value)
            .then(({src, width, height}) => {
                    const image = {src, width, height};
                    this.isAlbumImage = width > height;

                    if (this.isAlbumImage) {
                        this.setAttribute('album-image', '');
                    } else {
                        this.removeAttribute('album-image');
                    }

                    const isNotBack = this.getAttribute('box-position') !== 'back'

                    if (isNotBack) {
                        this.style.backgroundImage = `url('${src}')`;
                    }

                    return image;
                }
            ).catch((message) => {
                console.error(message);
            })
    }

    render() {
        const shadow = this.attachShadow({mode: 'closed'});
        shadow.innerHTML = `
            <style>
                :host {
                    position: absolute;
                    border: 0.5px solid black;
                    text-align: center;
                    background-size: contain;
                    background-repeat: no-repeat;
                    z-index: 2;
                }
                
                :host(:not([box-position="back"])) {
                    background-image: url("https://picsum.photos/700");
                }
                
                :host([box-position="top"]),
                :host([box-position="bottom"]) {
                    width: 300px;
                    height: 100px;
                    top: 50px;
                    line-height: 100px;
                }
                
                :host([box-position="right"]),
                :host([box-position="left"]) {
                    width: 100px;
                    height: 300px;
                    left: 100px;
                    line-height: 300px;
                }
                
               :host([box-position="front"]),
               :host([box-position="back"]) {
                    width: 300px;
                    height: 300px;
                    line-height: 300px;
               }
                
               :host([box-position="top"]) {
                    background-position: 50% calc(50% + 200px);
                    -webkit-transform: rotateX(90deg) translateZ(100px);
                    transform: rotateX(90deg) translateZ(100px);
               }
                
               :host([box-position="bottom"]) {
                    background-position: 50% calc(50% - 200px);
                    -webkit-transform: rotateX(-90deg) translateZ(200px);
                    transform: rotateX(-90deg) translateZ(200px);
               }
                
               :host([box-position="right"]) {
                    background-position: calc(50% - 200px) 50%;
                    -webkit-transform: rotateY(90deg) translateZ(150px);
                    transform: rotateY(90deg) translateZ(150px);
               }
                
               :host([box-position="left"]) {
                    background-position: calc(50% + 200px) 50%;
                    -webkit-transform: rotateY(-90deg) translateZ(150px);
                    transform: rotateY(-90deg) translateZ(150px);
               }
                
               :host([box-position="front"]) {
                    background-position: 50%;
                    -webkit-transform: rotateY(0deg) translateZ(50px);
                    transform: rotateY(0deg) translateZ(50px);
               }
                
               :host([box-position="back"]) {
                    -webkit-transform: rotateY(180deg) translateZ(50px);
                    transform: rotateY(180deg) translateZ(50px);
               }
                
               :host([show-flat][box-position="top"]) {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateY(-150px);
                    transform: rotateY(0deg) translateZ(0px) translateY(-150px);
               }
                
               :host([show-flat][box-position="bottom"]) {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateY(250px);
                    transform: rotateY(0deg) translateZ(0px) translateY(250px);
               }
                
               :host([show-flat][box-position="right"]) {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateX(200px);
                    transform: rotateY(0deg) translateZ(0px) translateX(200px);
               }
                
               :host([show-flat][box-position="left"]) {
                    -webkit-transform: rotateY(0deg) translateZ(0px) translateX(-200px);
                    transform: rotateY(0deg) translateZ(0px) translateX(-200px);
               }
                
               :host([show-flat][box-position="back"]) {
                    display: none;
               }
            </style>
            <slot></slot>
        `;

        return shadow;
    }
}

export default BoxFace;
