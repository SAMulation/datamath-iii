/*  STATES EXPLAINED
    0: 'start' = calc just opened // [C] = N, [L] = N, [O] = N
        legal: 0-9 (adding to C), no operators b/c no # stored
    1: 'one' = first number entered, no operator // [C] = X, [L] = N, [O] = N
        legal: 0-9 (adding to C), op (=, +,-,*,/,%) (clear lastOp) // = straight to post AND check for lastOp (to repeat)
    2: 'op' = adding operator // before: [C] = X, [L] = N, [O] = N; after: [C] = N, [L] = X, [O] = X, go to 3
    3: 'next' = first num in, op in, expected next number // [C] = N, [L] = X, [O] = X
        action: move C to L, clear C; fill op
        legal 0-9 (adding to C), ** %,+/- acts on L **, = evals L, op (+,-,*,/) just switches
    4: 'full' = both nums in, op in, expecting evaluation // [C] = X, [L] = X, [O] = X
        legal: 0-9 (adding to C), op (=, +,-,*,/,%) initiates eval, then goes to 'one-no-op'
    5: 'post' = evaluation // before: [C] = X, [L] = X, [O] = X; after: [C] = N, [L] = X, [O] = N
        action: evaluate expression; move answer to L, clear C, move op to lastOp; go to 'one-no-op' but store lastOp for equal
    6: 'error' = DIV/0 or overflow errors

    always: . on C (if blank then '0.' else append '.')
    except 'start': CLR yes (else N)
    unless 'start' or 'next': +/- on C (else on L), BS on C (else N), % on C (else on L)
*/


class Calculator {
    constructor(root) {
        this.state = {
            options: ['start', 'one', 'op', 'next', 'full', 'post'],
            index: 0
        }
        this.currentNum = 'a';
        this.lastNum = 'a';
        this.operator = '';
        this.lastOperation = {
            op: '',
            num: 'a'
        };
        this.rootElement = root;

        this.bindButtons();
    }

    bindButtons() {
        const buttons = this.rootElement.querySelectorAll('button:not(#clear)');
        // Clear press or press and hold
        const clear = this.rootElement.querySelector('#clear');

        buttons.forEach(button => {
            button.addEventListener('click', event => {
                console.log('click');
                this.handleKeyPress(event.target.getAttribute("data-btn"));
            });
        })
        
        let value = 0,
        //hold_time = 1000,
        mouseHoldTimeout,
        mouseDownDone = false,
        clearScreen = false;

        clear.addEventListener('mousedown', event => {
            mouseHoldTimeout = setTimeout(() => {
                value++;
                mouseDownDone = true;
                //console.log("Clear");
                this.clearScreen();
              }, 500);
        });

        clear.addEventListener('click', event => {
            if (mouseHoldTimeout) {
              clearTimeout(mouseHoldTimeout);
              mouseHoldTimeout = null;
              //console.log("first");
              this.backspace()
            }
            if (mouseDownDone) {
              mouseDownDone = false;
              //console.log("Backspace");
              //this.backspace()
              return;
            }
            value += 15;
            //console.log("end");
        });
    }   

    getState() {
        return this.state.options[this.state.index];
    }

    getStateIndex() {
        return this.state.index;
    }

    getCurrentNum() {
        return this.currentNum;
    }

    getLastNum() {
        return this.lastNum;
    }

    getOperator() {
        return this.operator;
    }

    getLastOperator() {
        return this.lastOperation.op;
    }

    getLastOpNum() {
        return this.lastOperation.num;
    }

    setState(idx) {
        this.state.index = idx;
    }

    setCurrentNum(num) {
        this.currentNum = num;
    }

    setLastNum(num) {
        this.lastNum = num;
    }

    setOperator(num) {
        this.operator = num;
    }

    setLastOperator(op) {
        this.lastOperation.op = op;
    }

    setLastOpNum(num) {
        this.lastOperation.num = num;
    }

    handleKeyPress(kp) {
        if (!isNaN(kp)) {
            if (this.currentNum.length < 10) {
                this.setState(this.numberInput(kp));
            }
        } else if (kp === "=") {
            this.evaluate((this.getState() === 'next') ? this.getOperator() : "=");
        } else if (kp === "+" || kp === "-" || kp === "*" || kp === "/") {
            this.handleOperator(kp);   
        } else if (kp === '%') {
            this.percent();
        } else if (kp === "N") {
            this.negate();
        }
    }

    numberInput(kp) {
        let state = this.getStateIndex();

        if (this.getCurrentNum() === 'a') {
            this.setCurrentNum('');
        }
        this.setCurrentNum(this.getCurrentNum() + kp.toString());
        this.updateScreen(this.getCurrentNum());
        console.log("currentNum: " + this.getCurrentNum());
        console.log("LastNum: " + this.getLastNum());
        
        if (state === 0) {
            state = 1;            
        } else if (state == 3) {
            state = 4;
        }
        return state;
    }

    handleOperator(kp) {
        const state = this.getState();
        if (state === 'full') {
            this.evaluate(kp);
        } else if (state === 'next') {
            this.setOperator(kp);
        } else if (state === 'one') {
            this.setState(2);
            this.setLastNum(Number(this.getCurrentNum()));
            this.setCurrentNum('a');
            this.setOperator(kp);
            this.setState(3);
        }
    }


        // // operator, currentNum, and lastNum assigned and ready for next operator
        // if (this.lastNum !== 'a') {
        //     // So, evaluate
        //     this.evaluate(this.operator);
        // }

        // // Only one number assigned
        // if (this.currentNum !== 'a') {
        //     // No operator assigned (Just got done evaluating or just one number so far)
        //     // OR, operator assigned but different one was pressed
        //     // Either way, just assign this one
        //     if (this.operator !== kp) {
        //         if (this.operator === '') {
        //             this.lastNum = this.currentNum;
        //             this.numString = '';
        //         }

        //         this.operator = kp;
        //     }

        // } 

        // // No numbers assigned, don't assign operator
        // // Unless you hit 'minus', then do +/- operation
        // if (kp === '-') {
        //     this.numString = (this.numString === '-') ? '' : '-';
        //     // this.currentNum = Number(this.numString);
        //     // this.updateScreen(this.currentNum);
        // }
        // console.log("operator: " + this.operator);
    


    clearScreen() {
        if (this.getState()) {
            this.setState(0);
            this.setCurrentNum('a');
            this.setLastNum('a');
            this.setOperator('');
            this.setLastOperator('');
            this.setLastOpNum('a');
            this.updateScreen();
        }
    }

    backspace() {
        //console.log(this.getState());
        if (this.getState() !== 'start') {  // Not on start
            if(this.getState() === 'next') {  //On last, clear operator
                this.setOperator('');
                this.setCurrentNum(this.getLastNum());
                this.setLastNum('a');
                this.setState(1);
            }
            let string = this.getCurrentNum();
            string = string.slice(0,-1);
            if (string === '') {
                string = 'a';
            }
            //console.log(string);
            this.setCurrentNum(string);
            this.updateScreen(this.getCurrentNum());
        }
    }

    evaluate(op = "=") {
        // Edge case of hitting equals multiple times
        if (this.getState() === 'one' && this.getLastOperator()) {
            op = this.getLastOperator();
            this.setCurrentNum(this.getLastOpNum);
        }
        
        if (op === "=") {
            op = this.getOperator();
        }

        // Edge case of equals hit after hitting operator
        if (this.getState() === 'next') {
            this.setCurrentNum(this.getLastNum());
        }

        if (op === '+') {
            this.addition();
        } else if (op === '-') {
            this.subtraction();
        } else if (op === '*') {
            this.multiplication();
        } else {  // Division
            this.division();
        }

        //this.resetOperator();
    }

    resetOperator() {
        this.updateScreen(this.getLastNum());
        this.setLastOperator(this.getOperator());
        this.setLastOpNum(this.getCurrentNum());
        this.setOperator('');
        this.setCurrentNum('a');
        this.setState(1);
    }

    addition() {
        this.setLastNum(Number(this.getCurrentNum()) + Number(this.getLastNum()));
        this.resetOperator();
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

    updateScreen(displayText = "Let's math!") {
        this.rootElement.querySelector('.screen').textContent = displayText;
    }
    resetOperands() {
        this.operands = ['a', 'a'];
        this.currentOperand = 0;
    }


}
  
  

const calculator1 = new Calculator(document.querySelector('.calc1'));
// const calculator2 = new Calculator(document.querySelector('.calc2'));