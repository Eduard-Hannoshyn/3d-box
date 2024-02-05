const BOX_TYPE = {
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

document.getElementById("app").innerHTML = `
<div class="file"><input accept="image/*" type="file" id="image-preview"></div>
<hr>
<input type="checkbox" id="show-flat" checked /> <label for="show-flat">Show flat</label>
<input type="checkbox" id="enable-names" checked /> <label for="enable-names">Enable names</label>
<input type="checkbox" id="enable-blur" checked /> <label for="enable-blur">Enable blur</label><br>
<hr>
<select name="box-type" id="box-type">
  <option value="contain-inner">Contain inner</option>
  <option value="cover-inner">Cover inner</option>
  <option value="contain-outer">Contain outer</option>
  <option value="cover-outer">Cover outer</option>
</select>
<span>
    <label for="blur-offset">Blur offset</label>
    <input type="range" min="500" max="1000" value="500" id="blur-offset" step="1" />
</span>
  <div class="container item-centered">
    <div class="scene item-centered" id="scene">
      <div class="box" id="box">
        <div class="box__face box__face--front box__face--blur"></div>
        <div class="box__face box__face--front"><span class="box__text">front</span></div>
        <div class="box__face box__face--back box__face--blur"></div>
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
   </div>
 <button id="show">Show</button>
 <button id="save">Save</button>
 <div id="settings-container"></div>
`;

const showButton = document.getElementById('show');
const saveButton = document.getElementById('save');
const settingsContainer = document.getElementById('settings-container');
const flatCheckbox = document.getElementById('show-flat');
const namesCheckbox = document.getElementById('enable-names');
const blurCheckbox = document.getElementById('enable-blur');
const blurRange = document.getElementById("blur-offset");
const boxType = document.getElementById("box-type");
const scene = document.getElementById("scene");
const box = document.getElementById("box");
const imagePreview = document.getElementById("image-preview");
const boxFace = document.querySelectorAll(".box__face:not(.box__face--back)");

let isPortraitImage = false;
let isAlbumImage = false;
let isDragging = false;
let startX, startY;
let rotationX = 0;
let rotationY = 0;

function handleMousedown(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
}

function handleMousemove(e) {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    rotationY += deltaX / 3;
    rotationX -= deltaY / 3;

    box.style.transform = `translateZ(-150px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;

    startX = e.clientX;
    startY = e.clientY;
}

function handleMouseup() {
    isDragging = false;
}

function handleMouseout() {
    isDragging = false;
}

function getImage(file) {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    return new Promise(function (resolve, reject) {
        image.src = imageUrl;
        image.onload = function () {
            resolve(image);
        };
        image.onerror = function () {
            reject('Sorry something went wrong');
        }
    })
}

function resetPrevBoxTypeClass(element) {
    Object.values({...MAP_ALBUM_IMAGE_CLASS, ...MAP_PORTRAIT_IMAGE_CLASS}).forEach(function (className) {
        const isContains = element.classList.contains(className);

        if (isContains) {
            element.classList.remove(className);
        }
    })
}

function handleImage({currentTarget}) {
    const [file] = currentTarget.files;

    if (file) {
        getImage(file)
            .then(function ({src, width, height}) {
                    isAlbumImage = width > height;
                    isPortraitImage = width < height;

                    [...boxFace].forEach(function (element) {
                        element.style.backgroundImage = `url('${src}')`;
                    });

                    handleBoxTypeSelect({currentTarget: boxType});
                    handleBlurOffset({currentTarget: blurRange});
                }
            ).catch(function (message) {
            console.error(message);
        })
    }
}

function handleBlurOffset({currentTarget}) {
    [...boxFace].forEach(function (element) {
        const isBlurElement = element.classList.contains('box__face--blur');

        if (isBlurElement) {
            element.style.backgroundSize = isAlbumImage
                ? `auto ${currentTarget.value}px`
                : `${currentTarget.value}px auto`;
        }
    });
}

function handleBoxTypeSelect({currentTarget}) {
    const selectedOption = currentTarget.options[currentTarget.selectedIndex];
    const selectedValue = selectedOption.value;

    [...boxFace].forEach(function (element) {
        const isBlurElement = element.classList.contains('box__face--blur');

        if (!isBlurElement) {
            let boxTypeClass = isAlbumImage
                ? MAP_ALBUM_IMAGE_CLASS[selectedValue]
                : MAP_PORTRAIT_IMAGE_CLASS[selectedValue];

            resetPrevBoxTypeClass(element);
            element.classList.add(boxTypeClass);
        }
    });
}

function handleBlurEnable({currentTarget}) {
    if (currentTarget.checked) {
        blurRange.removeAttribute('disabled');
    } else {
        blurRange.setAttribute('disabled', true);
    }
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

function showSettings() {
    settingsContainer.innerHTML = `<pre>${getSettings()}</pre>`;
    settingsContainer.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

function saveSettings() {
    const blob = new Blob([getSettings()], {type: 'application/json'});
    const downloadLink = document.createElement('a');

    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${imagePreview.value || 'settings'}.json`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

showButton.onclick = showSettings;
saveButton.onclick = saveSettings;
blurCheckbox.onchange = handleBlurEnable;
boxType.onchange = handleBoxTypeSelect;
blurRange.onchange = handleBlurOffset;
imagePreview.onchange = handleImage;

scene.onpointerdown = handleMousedown;
scene.onpointermove = handleMousemove;
scene.onpointerout = handleMouseout;
scene.onpointerup = handleMouseup;
