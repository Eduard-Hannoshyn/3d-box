import BoxFace from "./box-face.js";
class BoxSide extends BoxFace {
    render() {
        const shadow = super.render();

        shadow.querySelector('style').textContent += `
            :host([box-type='contain-inner']) {
               background-size: contain;
            }
            
            :host([box-type='cover-inner']) {
               background-size: cover;
            }
            
            :host([box-type='contain-outer']) {
               background-size: auto 500px;
            }
            
            :host([box-type='cover-outer']) {
               background-size: 500px auto;
            }
            
            :host([album-image][box-type='contain-outer']) {
               background-size: 500px auto;
            }
            
            :host([album-image][box-type='cover-outer']) {
               background-size: auto 500px;
            }
            
            slot { 
                display: none;
            }
            
            :host([enable-names]) slot {
                display: block;
            }
        `;
    }
}

export default BoxSide;
