const ALLOWED_CHILD_ELEMENTS = ['box-image'];

class ThreeDBox extends HTMLElement {
    #boxImages = null;
    #boxImage = null;
    #boxImage1 = null;
    #imagePreview = null;
    #flatCheckbox = null;
    #namesCheckbox = null;
    #blurCheckbox = null;
    #boxType = null;
    #blurRange = null;
    #showButton = null;
    #saveButton = null;
    #settingsContainer = null;

    constructor() {
        super();

        this.render();
    }

    render() {
        const shadow = this.attachShadow({mode: 'closed'});
        shadow.innerHTML = `
            <style>
                .file {
                    margin-bottom: 10px;
                }
                
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
                
                .container {
                    margin: 30px 0;
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                }
                
                @media only screen and (max-width: 600px) {
                    .container {
                        margin: 0;
                        -webkit-transform: scale(0.8);
                        -ms-transform: scale(0.8);
                        transform: scale(0.8);
                    }
                }
            </style>
            <div class="file"><input accept="image/*" type="file" id="image-preview"></div>
            <hr>
            <input type="checkbox" id="show-flat" /> <label for="show-flat">Show flat</label>
            <input type="checkbox" id="enable-names" /> <label for="enable-names">Enable names</label>
            <input type="checkbox" id="enable-blur" /> <label for="enable-blur">Enable blur</label><br>
            <hr>
            <select name="box-type" id="box-type">
                <option value="contain-inner">Contain inner</option>
                <option value="cover-inner">Cover inner</option>
                <option value="contain-outer">Contain outer</option>
                <option value="cover-outer">Cover outer</option>
            </select>
            <span>
                <label for="blur-offset">Blur offset</label>
                <input disabled type="range" min="500" max="1000" value="500" id="blur-offset" step="1" />
            </span>
            <div class="container item-centered">
                <slot></slot>
            </div>
            <button id="show">Show</button>
            <button id="save">Save</button>
            <div id="settings-container"></div>
        `;

        const childElements = this.#getChildElements(shadow);
        const isAllowedChildElements = this.#checkIsAllowedChildElements(childElements);

        if (isAllowedChildElements) {
            this.#boxImages = childElements[ALLOWED_CHILD_ELEMENTS[0]];
        }

        this.#boxImage = shadow.getElementById("box-image");
        this.#boxImage1 = shadow.getElementById("box-image-1");
        this.#imagePreview = shadow.getElementById("image-preview");
        this.#flatCheckbox = shadow.getElementById('show-flat');
        this.#namesCheckbox = shadow.getElementById('enable-names');
        this.#blurCheckbox = shadow.getElementById('enable-blur');
        this.#boxType = shadow.getElementById("box-type");
        this.#blurRange = shadow.getElementById("blur-offset");
        this.#showButton = shadow.getElementById('show');
        this.#saveButton = shadow.getElementById('save');
        this.#settingsContainer = shadow.getElementById('settings-container');

        return shadow;
    }

    static get observedAttributes() {
        return ['show-flat', 'enable-blur', 'enable-names', 'box-type', 'blur-offset'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const attributeCallback = this.#mapAttributesCallback(name);

        attributeCallback?.(newValue);
    }

    #mapAttributesCallback(name) {
        const attributesCallback = {
            'show-flat': this.#showFlatAttributeCallback,
            'enable-blur': this.#enableBlurAttributeCallback,
            'enable-names': this.#enableNamesAttributeCallback,
            'box-type': this.#boxTypeAttributeCallback,
            'blur-offset': this.#blurOffsetAttributeCallback,
        }

        return attributesCallback[name]?.bind(this);
    }

    #showFlatAttributeCallback() {
        this.#flatCheckbox.toggleAttribute('checked');

        this.#boxImages.forEach((boxImage) => {
            boxImage.toggleAttribute('show-flat');
        });
    }

    #enableNamesAttributeCallback() {
        this.#namesCheckbox.toggleAttribute('checked');

        this.#boxImages.forEach((boxImage) => {
            boxImage.toggleAttribute('enable-names');
        });
    }

    #enableBlurAttributeCallback() {
        this.#blurCheckbox.toggleAttribute('checked');
        this.#blurRange.toggleAttribute('disabled');

        this.#boxImages.forEach((boxImage) => {
            boxImage.toggleAttribute('enable-blur');
        });
    }

    #boxTypeAttributeCallback(value) {
        this.#boxType.value = value;

        this.#boxImages.forEach((boxImage) => {
            boxImage.setAttribute('box-type', value);
        });
    }

    #blurOffsetAttributeCallback(value) {
        this.#blurRange.value = value;

        this.#boxImages.forEach((boxImage) => {
            boxImage.setAttribute('blur-offset', value);
        });
    }

    connectedCallback() {
        this.#imagePreview.addEventListener("change", this.#handleImageChange());
        this.#flatCheckbox.addEventListener("change", this.#handleFlatChange());
        this.#namesCheckbox.addEventListener("change", this.#handleNamesChange());
        this.#blurCheckbox.addEventListener("change", this.#handleBlurChange());
        this.#boxType.addEventListener("change", this.#handleBoxTypeChange());
        this.#blurRange.addEventListener("change", this.#handleBlurOffsetChange());
        this.#showButton.addEventListener("click", this.#handleShowSettingsClick());
        this.#saveButton.addEventListener("click", this.#handleSaveSettingsClick());
    }

    disconnectedCallback() {
        this.#imagePreview.removeEventListener("change", this.#handleImageChange());
        this.#flatCheckbox.removeEventListener("change", this.#handleFlatChange());
        this.#namesCheckbox.removeEventListener("change", this.#handleNamesChange());
        this.#blurCheckbox.removeEventListener("change", this.#handleBlurChange());
        this.#boxType.removeEventListener("change", this.#handleBoxTypeChange());
        this.#blurRange.removeEventListener("change", this.#handleBlurOffsetChange());
        this.#showButton.removeEventListener("click", this.#handleShowSettingsClick());
        this.#saveButton.removeEventListener("click", this.#handleSaveSettingsClick());
    }

    #getChildElements(shadow) {
        const elements = shadow.querySelector('slot').assignedElements();

        return Object.groupBy(elements, ({tagName}) => tagName.toLowerCase());
    }

    #checkIsAllowedChildElements(elements) {
        return Object.keys(elements).every((tagName) => {
            const isAllowed = ALLOWED_CHILD_ELEMENTS.includes(tagName);

            if (!isAllowed) {
                throw new Error(`Element <${tagName}> not allowed as a child of <three-d-box>, only <box-image> allowed as child`);
            }

            return isAllowed;
        });
    }

    #handleImageChange() {
        return ({currentTarget}) => {
            const [file] = currentTarget.files;

            if (file) {
                const imageUrl = URL.createObjectURL(file);

                this.#boxImages.forEach((boxImage) => {
                    boxImage.setAttribute('image-url', imageUrl);
                })
            }
        }
    }

    #handleFlatChange() {
        return () => {
            this.#boxImages.forEach((boxImage) => {
                boxImage.toggleAttribute('show-flat');
            })
        }

    }

    #handleNamesChange() {
        return () => {
            this.#boxImages.forEach((boxImage) => {
                boxImage.toggleAttribute('enable-names');
            })
        }


    }

    #handleBlurChange() {
        return () => {
            this.#blurRange.toggleAttribute('disabled');

            this.#boxImages.forEach((boxImage) => {
                boxImage.toggleAttribute('enable-blur');
            })
        }

    }

    #handleBoxTypeChange() {
        return ({currentTarget}) => {
            const selectedOption = currentTarget.options[currentTarget.selectedIndex];

            this.#boxImages.forEach((boxImage) => {
                boxImage.setAttribute('box-type', selectedOption.value);
            })
        }
    }

    #handleBlurOffsetChange() {
        return ({currentTarget}) => {
            this.#boxImages.forEach((boxImage) => {
                boxImage.setAttribute('blur-offset', currentTarget.value);
            })
        }

    }

    #getSettings() {
        const settings = {
            filePath: this.#imagePreview.value || 'default',
            showFlat: this.#flatCheckbox.checked,
            enableBlur: this.#blurCheckbox.checked,
            enableNames: this.#namesCheckbox.checked,
            boxType: this.#boxType.value,
            blurOffset: this.#blurRange.value,
        };

        return JSON.stringify(settings, null, 2);
    }

    #handleShowSettingsClick() {
        return () => {
            this.#settingsContainer.innerHTML = `<pre>${this.#getSettings()}</pre>`;
            this.#settingsContainer.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
        }

    }

    #handleSaveSettingsClick() {
        return () => {
            const blob = new Blob([this.#getSettings()], {type: 'application/json'});
            const downloadLink = document.createElement('a');

            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${this.#imagePreview.value || 'settings'}.json`;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }
}

export default ThreeDBox;
