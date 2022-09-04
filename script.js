const calculator = {
    keyPress: 'a',
    operands: ['a', 'a'],
    currentOperand: 0,
    numString: '',
    //intString: '',
    //decString: '',
    //float: false,
    negative: false,
    screen: '',

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
        const kp = this.keyPress;
        if (!isNaN(kp)) {
            if (this.numString.length < 10) {
                this.numString += kp.toString();
                //this.screen = this.numString;
                this.updateScreen(this.numString);
            }
        } else if (kp === "+") {
            calculator.addition();
        } else if (kp === "-") {
            calculator.subtraction();
        } else if (kp === "*") {
            calculator.multiplication();
        } else if (kp === "÷") {
            calculator.division();
        } else if (kp === "%") {
            calculator.percent();
        } else if (kp === "B") {
            calculator.backspace();
        } else if (kp === "C") {
            calculator.clear();
        } else if (kp === "=") {
            calculator.evaluate();
        }
    },

    addition() {
        if (this.numString.length > 0) {
            this.operator = "+";
            this.operands[this.currentOperand] = Number(this.numString);
            console.log(this.operands);
            if (this.currentOperand === 1) {
                this.operands[0] = this.operands[0] + this.operands[1];
                this.operands[1] = 'a';
                console.log(this.operands);
                this.numString = '';
                //this.currentOperand = 0;
                this.updateScreen(this.operands[0]);
            } else {
                this.numString = '';
                this.currentOperand++;
                console.log(this.currentOperand);
            }
        }
    },

    updateScreen(num) {
        document.querySelector('.screen').textContent = num;
    },
    resetOperands() {
        this.operands = ['a', 'a'];
        this.currentOperand = 0;
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