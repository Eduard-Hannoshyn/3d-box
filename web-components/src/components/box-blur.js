import BoxFace from "./box-face.js";

class BoxBlur extends BoxFace {
    static get observedAttributes() {
        return [...super.observedAttributes, 'blur-offset'];
    }

    render() {
        const shadow = super.render();

        shadow.querySelector('style').textContent += `
            :host {
                display: none;
            }
            
            :host([enable-blur]) {
                display: block;
                -webkit-filter: blur(3px);
                filter: blur(3px);
                background-size: 500px auto;
                z-index: 1;
            }
            
            :host([album-image][enable-blur]) {
                background-size: auto 500px;
            }
        `;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        const attributeCallback = this.#mapAttributesCallback(name);

        attributeCallback?.(newValue);
    }

    #mapAttributesCallback(name) {
        const attributesCallback = {
            'blur-offset': this.blurOffsetAttributeCallback,
        }

        return attributesCallback[name]?.bind(this);
    }

    imageUrlAttributeCallback(value) {
        super.imageUrlAttributeCallback(value).then(() => {
            this.blurOffsetAttributeCallback(this.getAttribute('blur-offset'));
        })
    }

    blurOffsetAttributeCallback(value) {
        this.style.backgroundSize = this.isAlbumImage
            ? `auto ${value}px`
            : `${value}px auto`;
    }
}

export default BoxBlur;
