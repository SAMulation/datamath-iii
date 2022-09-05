/*  STATES EXPLAINED
    1: 'start' = calc just opened // [C] = N, [L] = N, [O] = N
        legal: 0-9 (adding to C), no operators b/c no # stored
    2: 'one-no-op' = first number entered, no operator // [C] = X, [L] = N, [O] = N
        legal: 0-9 (adding to C), op (=, +,-,*,/,%) (clear lastOp) // = straight to post AND check for lastOp (to repeat)
    3: 'next', 'one-op' = first num in, op in, expected next number // [C] = X, [L] = N, [O] = X
        action: move C to L, clear C; fill op
        legal 0-9 (adding to C), ** %,+/- acts on L **, = evals L, op (+,-,*,/) just switches
    4: 'full' = both nums in, op in, expecting evaluation // [C] = X, [L] = X, [O] = X
        legal: 0-9 (adding to C), op (=, +,-,*,/,%) initiates eval, then goes to 'one-no-op'
    5: 'post' = evaluation occuring // [C] = N, [L] = X, [O] = N
        action: evaluate expression; move answer to L, clear C, move op to lastOp; go to 'one-no-op' but store lastOp for equal

    always: . on C (if blank then '0.' else append '.')
    except 'start': CLR yes (else N)
    unless 'start' or 'next': +/- on C (else on L), BS on C (else N), % on C (else on L)
*/


class Calculator {
    constructor(root) {
        this.state = {
            options: ['start', 'one', 'next', 'full', 'post'],
            index: 0
        }
        this.keyPress = 'a';
        this.currentNum = 'a';
        this.lastNum = 'a';
        this.numString = '';
        this.operator = '';
        this.lastOperator = '';
        this.rootElement = root;

        this.bindButtons();
    }

    bindButtons() {
        const buttons = this.rootElement.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', event => {
                this.handleKeyPress(event.target.getAttribute("data-btn"));
            });
        })
    }   

    getState() {
        return this.state.options[this.state.index];
    }

    setState(idx) {
        this.state.index = idx;
    }
    
    handleKeyPress(kp) {
        if (!isNaN(kp)) {
            if (this.numString.length < 10) {
                this.numString += kp.toString();
                //this.screen = this.numString;
                this.updateScreen(this.numString);
                this.currentNum = Number(this.numString);
                console.log("currentNum: " + this.currentNum);
                console.log("numString: " + this.numString);
            }
        } else if (kp === "=") {
            calculator.evaluate(this.operator);
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
        } else if (kp === "N") {
            calculator.negate();
        } else if (kp === "C") {
            calculator.clear();
        }
    }

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
            if (this.operator !== kp) {
                if (this.operator === '') {
                    this.lastNum = this.currentNum;
                    this.numString = '';
                }

                this.operator = kp;
            }

        } 

        // No numbers assigned, don't assign operator
        // Unless you hit 'minus', then do +/- operation
        if (kp === '-') {
            this.numString = (this.numString === '-') ? '' : '-';
            // this.currentNum = Number(this.numString);
            // this.updateScreen(this.currentNum);
        }
        console.log("operator: " + this.operator);
    }

    evaluate(op) {
        if (op === "+") {
            this.addition();            
        }
    }

    addition() {
        if (this.numString.length > 0) {
            //this.operator = "+";
            this.numString = '';
            console.log("numString: " + this.numString);
            console.log("currentNum")
            this.currentNum += this.lastNum;
            this.updateScreen(this.currentNum);
            this.lastNum = 'a';
            this.currentNum = 'a';
            this.operator = '';

            // console.log(this.operands);
            // if (this.currentOperand === 1) {
            //     this.operands[0] = this.operands[0] + this.operands[1];
            //     this.operands[1] = 'a';
            //     console.log(this.operands);
            //     this.numString = '';
            //     //this.currentOperand = 0;
            //     this.updateScreen(this.operands[0]);
            // } else {
            //     this.numString = '';
            //     this.currentOperand++;
            //     console.log(this.currentOperand);
            // }
        }
    }

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
    }

    updateScreen(num) {
        this.rootElement.querySelector('.screen').textContent = num;
    }
    resetOperands() {
        this.operands = ['a', 'a'];
        this.currentOperand = 0;
    }


}
  
  

const calculator1 = new Calculator(document.querySelector('.calc1'));
// const calculator2 = new Calculator(document.querySelector('.calc2'));