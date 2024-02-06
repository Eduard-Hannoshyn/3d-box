import BoxImage from "../components/box-image.js";

customElements.define("box-image", BoxImage);

const boxImage = document.getElementById("box-image");
const boxImage1 = document.getElementById("box-image-1");
const imagePreview = document.getElementById("image-preview");
const flatCheckbox = document.getElementById('show-flat');
const namesCheckbox = document.getElementById('enable-names');
const blurCheckbox = document.getElementById('enable-blur');
const boxType = document.getElementById("box-type");
const blurRange = document.getElementById("blur-offset");
const showButton = document.getElementById('show');
const saveButton = document.getElementById('save');
const settingsContainer = document.getElementById('settings-container');

function handleImageChange({currentTarget}) {
    const [file] = currentTarget.files;

    if (file) {
        const imageUrl = URL.createObjectURL(file);
        boxImage.setAttribute('image-url', imageUrl);
        boxImage1.setAttribute('image-url', imageUrl);
    }
}

function handleFlatChange() {
    boxImage.toggleAttribute('show-flat');
    boxImage1.toggleAttribute('show-flat');
}

function handleNamesChange() {
    boxImage.toggleAttribute('enable-names');
    boxImage1.toggleAttribute('enable-names');
}

function handleBlurChange() {
    blurRange.toggleAttribute('disabled');
    boxImage.toggleAttribute('enable-blur');
    boxImage1.toggleAttribute('enable-blur');

}

function handleBoxTypeChange({currentTarget}) {
    const selectedOption = currentTarget.options[currentTarget.selectedIndex];

    boxImage.setAttribute('box-type', selectedOption.value);
    boxImage1.setAttribute('box-type', selectedOption.value);
}

function handleBlurOffsetChange({currentTarget}) {
    boxImage.setAttribute('blur-offset', currentTarget.value);
    boxImage1.setAttribute('blur-offset', currentTarget.value);
}

function getSettings() {
    const settings = {
        filePath: imagePreview.value || 'default',
        showFlat: flatCheckbox.checked,
        enableBlur: blurCheckbox.checked,
        enableNames: namesCheckbox.checked,
        boxType: boxType.value,
        blurOffset: blurRange.value,
    };

    return JSON.stringify(settings, null, 2);
}

function handleShowSettingsClick() {
    settingsContainer.innerHTML = `<pre>${getSettings()}</pre>`;
    settingsContainer.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

function handleSaveSettingsClick() {
    const blob = new Blob([getSettings()], {type: 'application/json'});
    const downloadLink = document.createElement('a');

    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${imagePreview.value || 'settings'}.json`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


imagePreview.onchange = handleImageChange;
flatCheckbox.onchange = handleFlatChange;
namesCheckbox.onchange = handleNamesChange;
blurCheckbox.onchange = handleBlurChange;
boxType.onchange = handleBoxTypeChange;
blurRange.onchange = handleBlurOffsetChange;
showButton.onclick = handleShowSettingsClick;
saveButton.onclick = handleSaveSettingsClick;
