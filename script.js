import Calculator from "./calculator.js";

// To open the help for mobile
const helps = document.querySelectorAll('.helpLink');
helps.forEach(help => {
    // was click
    help.addEventListener('click', event => {
        document.querySelector('.page-sidebar').classList.toggle("visible");
        document.querySelector('.page-subheader').classList.toggle("hide");
    });
})

const calculator1 = new Calculator(document.querySelector('.calc1'));
window.calc1 = calculator1;
// const calculator2 = new Calculator(document.querySelector('.calc2'));