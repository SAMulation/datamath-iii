const calculator = {
    keyPress: 'a',
    currentNum: 'a',
    lastNum: 'a',  //Necessary?
    //operands = [0,0],
    //currentOperand: 0,
    numString: '',
    operator: '',
    //intString: '',
    //decString: '',
    //float: false,
    //negative: false,
    //screen: '',

    // getOperand(index) {
    //     return this.operands[index];
    // },
    // getCurrentOperand() {
    //     return this.operands[this.currentOperand];
    // },
    // getFloat() {
    //     return this.float;
    // },
    // getNumString() {
    //     if (this.float) {
    //         return Number(this.intString) + "." + Number(this.decString);
    //     } else {
    //         return Number(this.intString)
    //     }
    // },

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
                this.currentNum = Number(this.numString);
                console.log("currentNum: " + this.currentNum);
                console.log("numString: " + this.numString);
            }
        } else if (kp === "+" || kp === "-" || kp === "*" || kp === "/") {
            this.handleOperator(kp);    
        
        // else if (kp === "+") {
        //     calculator.addition();
        // } else if (kp === "-") {
        //     calculator.subtraction();
        // } else if (kp === "*") {
        //     calculator.multiplication();
        // } else if (kp === "÷") {
        //     calculator.division();
        // } else if (kp === "%") {
        //     calculator.percent();
        // } 
        } else if (kp === "B") {
            calculator.backspace();
        } else if (kp === "C") {
            calculator.clear();
        } else if (kp === "=") {
            calculator.evaluate();
        }
    },

    handleOperator(kp) {
        // operator, currentNum, and lastNum assigned and ready for next operator
        if (this.lastNum !== 'a') {
            // So, evaluate
            this.evaluate(this.operator);
        }

        // Only one number assigned
        if (this.currentNum !== 'a') {
            // No operator assigned (Just got done evaluating or just one number so far)
            // OR, operator assigned but different one was pressed
            // Either way, just assign this one
            if (this.operator === '' || this.operator !== kp) {
                this.operator = kp;
            }
        } 

        // No numbers assigned, don't assign operator
        // Unless you hit 'minus', then do +/- operation
        if (kp === '-') {
            this.numString = (this.numString === '-') ? '' : '-';
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

    subtraction() {
        if (this.numString.length === 0) { // Allows for negatives
            this.numString = "-";
        } else {
            this.operator = "-";
            this.operands[this.currentOperand] = Number(this.numString);
            console.log(this.operands);
            if (this.currentOperand === 1) {
                this.operands[0] = this.operands[0] - this.operands[1];
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