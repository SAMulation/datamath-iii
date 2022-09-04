const calculator = {
    keyPress: '',
    operands: [undefined, undefined],
    currentOperand: 0,
    numString: '',
    //intString: '',
    //decString: '',
    //float: false,
    negative: false,

    getOperand(index) {
        return this.operands[index];
    },
    getCurrentOperand() {
        return this.operands[this.currentOperand];
    },
    getFloat() {
        return this.float;
    },
    getNumString() {
        if (this.float) {
            return Number(this.intString) + "." + Number(this.decString);
        } else {
            return Number(this.intString)
        }
    },

    setKeyPress(key) {
        this.keyPress = key;
    },
    setOperand1(num) {
        this.operand1 = num;
    },
    setOperand2(num) {
        this.operand2 = num;
    },
    setOperator(option) {
        this.operator = option;
    },
    setFloat(flag) {
        this.float = flag;
    },

    handleKeyPress() {
        if (!isNaN(this.keyPress)) {
            this.numString += this.keyPress.toString();
        }
    }
}
  
  

buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('click', event => {
        // 👇️ {bar: 'foo'}
        calculator.setKeyPress(event.target.getAttribute("data-btn"));
        console.log(event.target.getAttribute('data-btn'));
        calculator.handleKeyPress();
    });
})