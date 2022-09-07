/*  STATES EXPLAINED
    0: 'start' = calc just opened // [C] = N, [L] = N, [O] = N, [LO] = N
        legal: 0-9 (add first char to C) go to 'nolast', no operators b/c no # stored; =, (-): does nothing
    1: 'one' = post-eval, lastOperation still present // [C] = N, [L] = X, [O] = N, [LO] = lo,ln
        legal: 0-9 (adding to C then go to 'nolast'), op (+,-,*,/,%) (clear lastOp); % act on L; = straight to post AND check for lastOp (to repeat)
    2: 'nolast' = typing in current, no last yet // [C] = x, [L] = N, [O] = N, [LO] = N
        legal: 0-9 (adding to C/keep adding to C) stay at this, op (+,-,*,/) record op and go to 'next'; = does nothing; % acts on C
    2.5 (not used): 'op' = adding operator // before: [C] = X, [L] = N, [O] = N; after: [C] = N, [L] = X, [O] = X, go to 3
    3: 'next' = first num in, op in, expected next number // [C] = N, [L] = X, [O] = X, [LO] = N
        action: move C to L, clear C; fill op
        legal 0-9 (add first char to C), ** %,+/- acts on L at first, then C (see 'nexty') **, = evals L, op (+,-,*,/) just switches
    4: 'full' = same as above, but C is not blank // [C] = x, [L] = X, [O] = X, [LO] = N // % short circuits
    4: 'full' = both nums in, op in, expecting evaluation // [C] = X, [L] = X, [O] = X
        legal: 0-9 (adding to C), op (+,-,*,/,%) initiates eval, then goes to 'next' (which has LastOperation), = evals and goes to 'one'
    4.5 (not used): 'post' = evaluation // before: [C] = X, [L] = X, [O] = X; after: [C] = N, [L] = X, [O] = N, [LO] = lo,ln
        action: evaluate expression; move answer to L, clear C, move op to lastOp; go to 'one' but store lastOp for equal
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
            this.equals();

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
            // Move current to last
            if (state === 'nolast') {
                this.setLastNum(this.getCurrentNum());
                this.setCurrentNum('a');
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
    }

    equals() {
        const state = this.getState();

        if (state === 'one') {
            if (this.getLastOperator() === '-' || this.getLastOperator() === '/') {
                this.evaluate(this.getLastOpNum(), this.getLastNum(), this.getLastOperator());
            } else {
                this.evaluate(this.getLastNum(), this.getLastOpNum(), this.getLastOperator());
            }
            
        } else if (state === 'next') {
            this.evaluate(this.getLastNum(), this.getLastNum(), this.getOperator());
            this.setState(1);
        } else if (state === 'full') {
            this.evaluate(this.getCurrentNum(), this.getLastNum(), this.getOperator());
            // Store c as lastOpNum, op as lastOperator ... but where?
            this.setState(1);
        }
    }

    evaluate(c, l, op) {
        if (op === '+') {
            this.addition(l, c);
        } else if (op === '-') {
            this.subtraction(l, c);
        } else if (op === '*') {
            this.multiplication(l, c);
        } else {  // Division
            this.division(l, c);
        }

        if (this.getState() !== 'one' && this.getState() !== 'next') {
            this.resetOperator(this.getLastNum());
        } else {
            this.updateScreen(this.getLastNum());
        }
    }

    addition(l, c) {
        this.setLastNum(Number(l) + Number(c));
    }

    subtraction(l, c) {
        this.setLastNum(Number(l) - Number(c));
    }

    multiplication(l, c) {
        this.setLastNum(Number(l) * Number(c));
    }

    division(l, c) {
        this.setLastNum(Number(l) / Number(c));
    }

    percent() {
        const state = this.getState();
        let num;  // Will not get set on 'start'
        let next;

        if (state === 'one' || state === 'next') {
            num = this.getLastNum();
            next = 3;
        } else if (state === 'nolast' || state === 'full') {
            num = this.getCurrentNum();
            next = 1;
        }

        if (num) {  // Skip if 'start'
            if (state === 'full') {
                this.evaluate(Number(num) / 100, this.getLastNum(), this.getOperator());
            } else {
            this.setLastNum(Number(num) / 100);
            this.resetOperator(this.getLastNum());
            this.setState(next);
            }
        }
    }

    negate() {
        const state = this.getState();

        // "I just want to switch sign of the number I'm inputting"
        if (state === 'nolast' || state === 'full') {
            this.setCurrentNum((-this.getCurrentNum()).toString());
        // "I want to invert my last answer, disregard any curr/prev operator pressed/remembered"
        } else if (state === 'one' || state === 'next') {
            this.setLastNum((-this.getLastNum()).toString());
            this.resetOperator(this.getLastNum());
            this.setState(3);  // Not 'one' because no lastOperation
        }
    }

    resetOperator(n) {
        this.updateScreen(n);
        this.setLastOperator(this.getOperator());
        this.setLastOpNum(this.getCurrentNum());
        this.setOperator('');
        this.setCurrentNum('a');
        this.setState(1);
    }

    resetLastOperator() {
        this.setLastOperator('');
        this.setLastOpNum('a');
    }

    backspace() {
        const state = this.getState();

        if (state === 'nolast' || state === 'full') {
            let string = this.getCurrentNum();
            string = string.slice(0,-1);
            // No more characters
            this.updateScreen(string.length ? string : null);
            if (!string.length) {
                string = 'a';
            }
            this.setCurrentNum(string);
        }
    }

    clearScreen() {
        if (this.getState()) {  // Not 'start'
            // Reset all variables
            this.setCurrentNum('a');
            this.setLastNum('a');
            this.setOperator('');
            this.resetLastOperator();
            this.updateScreen();
            this.setState(0);
        }
    }

    updateScreen(displayText = "Let's math!") {
        console.log(displayText);
        if (displayText.toString().length > 20) {
            displayText = 'Overflow!';
            this.setState(0);
        } else if (displayText === Infinity) {
            displayText = 'DIV/0!';
            this.setState(0);
        } else if (!isNaN(displayText) && displayText.toString().includes('.') && displayText[displayText.length - 1] !== '.') {
            displayText = Math.floor(displayText * 10000000000) / 10000000000;
        }
        this.rootElement.querySelector('.screen').textContent = displayText;
    }

}

const calculator1 = new Calculator(document.querySelector('.calc1'));
// const calculator2 = new Calculator(document.querySelector('.calc2'));