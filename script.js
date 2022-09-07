/*  STATES EXPLAINED
    0: 'start' = calc just opened // [C] = N, [L] = N, [O] = N, [LO] = N
        legal: 0-9 (add first char to C) go to 'nolast', no operators b/c no # stored; =, (-): does nothing
    1: 'one' = post-eval, lastOperation still present // [C] = N, [L] = X, [O] = N, [LO] = lo,ln
        legal: 0-9 (adding to C then go to 'nolast'), op (+,-,*,/,%) (clear lastOp); % act on L; = straight to post AND check for lastOp (to repeat)
    2: 'nolast' = typing in current, no last yet // [C] = x, [L] = N, [O] = N, [LO] = N
        legal: 0-9 (adding to C/keep adding to C) stay at this, op (+,-,*,/) record op and go to 'next'; = does nothing; % acts on C
    2.5 (not used): 'op' = adding operator // before: [C] = X, [L] = N, [O] = N; after: [C] = N, [L] = X, [O] = X, go to 3
    // 3 -> 2
    3: 'next' = first num in, op in, expected next number // [C] = N, [L] = X, [O] = X, [LO] = N
        action: move C to L, clear C; fill op
        legal 0-9 (add first char to C), ** %,+/- acts on L at first, then C (see 'nexty') **, = evals L, op (+,-,*,/) just switches
    4: 'full' = same as above, but C is not blank // [C] = x, [L] = X, [O] = X, [LO] = N // % short circuits
    4: 'full' = both nums in, op in, expecting evaluation // [C] = X, [L] = X, [O] = X
        legal: 0-9 (adding to C), op (+,-,*,/,%) initiates eval, then goes to 'next' (which has LastOperation), = evals and goes to 'one'
    4.5 (not used): 'post' = evaluation // before: [C] = X, [L] = X, [O] = X; after: [C] = N, [L] = X, [O] = N
        action: evaluate expression; move answer to L, clear C, move op to lastOp; go to 'one-no-op' but store lastOp for equal
    5: 'error' = DIV/0 or overflow errors

    always: . on C (if blank then '0.' else append '.')
    except 'start': CLR yes (else N)
    unless 'start' or 'next': +/- on C (else on L), BS on C (else N), % on C (else on L)
*/


class Calculator {
    constructor(root) {
        this.state = {
            options: ['start', 'one', 'nolast', 'next', 'full', 'error'],
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
        // Clear press or press and hold
        const clear = this.rootElement.querySelector('#clear');
        const buttons = this.rootElement.querySelectorAll('button:not(#clear)');

        buttons.forEach(button => {
            button.addEventListener('click', event => {
                console.log('click');
                this.handleKeyPress(event.target.getAttribute("data-btn"));
            });
        })
        
        let value = 0,
        mouseHoldTimeout,
        mouseDownDone = false;

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
              this.backspace()
            }
            if (mouseDownDone) {
              mouseDownDone = false;
              return;
            }
            value += 15;
        });

        // Key Press Handling
        window.addEventListener('keydown', event => {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
            console.log(event.key)
            switch (event.key) {
                case "0":
                case "1":
                case "2": 
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8": 
                case "9":
                case "+":    
                case "-":    
                case "*":
                case "/":
                case "%":
                case ".":
                    this.handleKeyPress(event.key);
                    break;
                case "Backspace":
                    this.handleKeyPress('B');
                    break;
                case "Escape":
                    this.handleKeyPress('C');
                    break;
                case "_":
                    this.handleKeyPress('N');
                    break;
                case "Enter":
                    this.handleKeyPress('=');
                    break;
                default:
                    return; // Quit when this doesn't handle the key event.
            }
          
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
          }, true);
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
        // Numbers
        if (!isNaN(kp)) {
            // Max length of 10 for currentNum (may change that later)
            if (this.currentNum.length < 10) {
                this.numberInput(kp);
            }

        // Decimal
        } else if (kp === '.') {
            // Don't add a decimal if it's already there
            if (!(this.getCurrentNum().includes('.'))) {
                this.setCurrentNum((this.getCurrentNum() === 'a') ? '0.' : this.getCurrentNum() + ".");
                this.updateScreen(this.getCurrentNum());
            }
        
        // Equals
        } else if (kp === "=") {
            this.evaluate((this.getState() === 'next') ? this.getOperator() : "=");

        // Operators
        } else if (kp === "+" || kp === "-" || kp === "*" || kp === "/") {
            this.handleOperator(kp);   

        // Percentage
        } else if (kp === '%') {
            this.percent();

        // Negation
        } else if (kp === "N") {
            this.negate();

        // Backspace
        } else if (kp === 'B') {
            this.backspace();

        // Clear (Mostly for keypresses)
        } else if (kp === 'C') {
            this.clearScreen();
        }
    }

    numberInput(kp) {
        let state = this.getStateIndex();

        // Stop looking for post-eval operator
        if (state === 1) {
            this.resetLastOperator();
        }

        if (this.getCurrentNum() === 'a') {
            this.setCurrentNum('');
        }
        this.setCurrentNum(this.getCurrentNum() + kp.toString());
        this.updateScreen(this.getCurrentNum());
        console.log("currentNum: " + this.getCurrentNum());
        console.log("LastNum: " + this.getLastNum());
        
        if (state === 0 || state == 1) {
            state = 2;            
        } else if (state == 3) {
            state = 4;
        }
        
        this.setState(state);
    }

    handleOperator(kp) {
        const state = this.getState();

        if (state === 'one' || state === 'nolast') {
            this.setOperator(kp);
            if (state === 'one') {
                this.resetLastOperator();
            }
            this.setState(3);

        // Just updating the operator
        } else if (state === 'next') {
            this.setOperator(kp);
        } else if (state === 'full') {
            this.evaluate(this.getCurrentNum(), this.getLastNum(), this.getOperator());
            this.setOperator(kp);
            this.resetOperator();  // Necessary?
            this.setState(3);

        }
        // if (state === 'full') {
        //     this.evaluate(kp);
        // } else if (state === 'next') {
        //     this.setOperator(kp);
        // } else if (state === 'one') {


        //     // Trying to do an operation on an answer
        //     if (this.getLastOperator() !== '') {
        //         this.setOperator(this.getLastOperator());
        //     } else {
        //         this.setLastNum(Number(this.getCurrentNum()));
        //         this.setCurrentNum('a');
        //         this.setOperator(kp);
        //     }

        //     this.resetLastOperator();
        //     this.setState(2);
        // }
    }

    negate() {
        // Need exception to handle recent answer (which is lastNum)
        let current = this.getCurrentNum();

        if (current !== 'a') {
            if (!isNaN(current)) {
                current = current.toString();
            }

            // Already negative
            if (current[0] === '-') {
                current = current.substring(1);
            // Currently positive
            } else {
                current = '-' + current;
            }

            this.setCurrentNum(current);
            this.updateScreen(this.getCurrentNum())
        }
    }

    resetLastOperator() {
        this.setLastOperator('');
        this.setLastOpNum('a');
    }

    clearScreen() {
        if (this.getState()) {
            this.setState(0);
            this.setCurrentNum('a');
            this.setLastNum('a');
            this.setOperator('');
            this.resetLastOperator();
            this.updateScreen();
        }
    }

    backspace() {
        //console.log(this.getState());
        // Not on start or after an answer
        // HERE: This still needs to be reworked
        //       Also, prevent BS to 'a'
                        // HERE: Making sure BS works but not on answers
                //       and can't bring up 'a'
        if (this.getState() !== 'start' && !(this.getState() === 'one' && this.getLastOperator !== '')) {  
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
            this.setOperator(op);
            this.setCurrentNum(this.getLastOpNum());
            this.setState(4);
        }

        if (op === "=") {
            op = this.getOperator();
        }

        // Edge case of equals hit after hitting operator
        if (this.getState() === 'next') {
            this.setCurrentNum(this.getLastNum());
        }

        //this.setState(5);
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
        this.setLastNum(Number(this.getCurrentNum()) - Number(this.getLastNum()));
        this.resetOperator();
    }

    percent() {
        this.setLastNum(Number(this.getCurrentNum()) / 100);
        this.resetOperator();
    }

    multiplication() {
        this.setLastNum(Number(this.getCurrentNum()) * Number(this.getLastNum()));
        this.resetOperator();
    }

    division() {
        this.setLastNum(Number(this.getCurrentNum()) / Number(this.getLastNum()));
        this.resetOperator();
    }

    updateScreen(displayText = "Let's math!") {
        if (!isNaN(displayText) && displayText.toString().includes('.')) {
            displayText = Math.floor(displayText * 10000000000) / 10000000000;
        }
        this.rootElement.querySelector('.screen').textContent = displayText;
    }

}

const calculator1 = new Calculator(document.querySelector('.calc1'));
// const calculator2 = new Calculator(document.querySelector('.calc2'));