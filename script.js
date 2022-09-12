/*  STATES EXPLAINED
    // Variables
    [C] = currentNum, [L] = lastNum, [O] = operator, [LO] = lastOperation (which holds lo(perator) and ln(um))
        *  Variables either hold N(othing) or X (which is something)

    0: START = calc just opened (formerly - 0: 'start')
        vars state: [C] = N, [L] = N, [O] = N, [LO] = N
        actions: 0-9 (add first char to C) go to ONEIN, no operators b/c no # stored; =, (-): also do nothing
    1: ONEIN = Typing in currentNum, no lastNum (formerly - 2: 'nolast')
        vars state: [C] = X, [L] = N, [O] = N, [LO] = N
        actions: 0-9 (keep adding to C) stay at this, op (+,-,*,/) record op and go to POSTOP; = does nothing; % acts on C
    2: POSTOP = lastNum is filled with last number, operator filled, waiting for first char of currentNum (formerly - 3: 'next')
        vars state: [C] = N, [L] = X, [O] = X, [LO] = N
        actions: 0-9 (add first char to C), ** %,+/- acts on L**, = evals L, op (+,-,*,/) just switches operator
    3: READY = Everything is 'full,' waiting for another currentNum char or some evaluation (formerly - 4: 'full')
        vars state: [C] = X, [L] = X, [O] = X, [LO] = N
        actions: 0-9 (adding to C), op (+,-,*,/) initiates eval with current [O], then goes to POSTOP (with new op stored in [O]), = evals and goes to POSTEVAL
        more actions: +/- acts on C; % act on C, then evaluates the current operator
    4: POSTEVAL = Answered is stored in L, lastOperation is present in case = keeps getting pressed
        vars state: [C] = N, [L] = X, [O] = N, [LO] = lo,ln
        actions: 0-9 (add first char to C, then go to ONEIN), op (+,-,*,/,%) (clear LO); % act on L; = straight to post AND use LO (to repeat)

    always: . on C (if blank then '0.' else append '.')
    except START: CLR yes (else N)
    unless START or POSTOP: +/- on C (else on L), BS on C (else N), % on C (else on L)
*/

// Global variables
const START = 0,
      ONEIN = 1,
      POSTOP = 2,
      READY = 3,
      POSTEVAL = 4;

class Calculator {
    constructor(root) {
        this.state = 0;
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
        const clear = this.rootElement.querySelector('.clear');
        const buttons = this.rootElement.querySelectorAll('.button:not(.clear)');

        buttons.forEach(button => {
            // was click
            button.addEventListener('pointerdown', event => {
                console.log('click');
                this.handleKeyPress(event.target.getAttribute("data-btn"));
            });
        })
        
        let mouseHoldTimeout;

        // was mousedown
        clear.addEventListener('pointerdown', event => {
            mouseHoldTimeout = setTimeout(() => {
                console.log("Clear");
                this.clearScreen();
                mouseHoldTimeout = false;
              }, 500);
        });

        // was click
        clear.addEventListener('pointerup', event => {
            if (mouseHoldTimeout) {
              clearTimeout(mouseHoldTimeout);
              mouseHoldTimeout = null;
              console.log("backspace")
              this.backspace()
            }
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
        return this.state;
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
        this.state = idx;
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
                this.updateScreen(this.getCurrentNum()), 'show';
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
        let state = this.getState();

        // Stop looking for post-eval operator
        if (state === POSTEVAL) {
            this.resetLastOperator();
        }

        if (this.getCurrentNum() === 'a') {
            this.setCurrentNum('');
        }

        // Protecting against leading zeroes
        if (!(this.getCurrentNum() === '0' && kp === '0')) {
            this.setCurrentNum(this.getCurrentNum() + kp);
            this.updateScreen(this.getCurrentNum(), 'show');
            console.log("currentNum: " + this.getCurrentNum());
            console.log("LastNum: " + this.getLastNum());
            
            if (state === START || state == POSTEVAL) {
                state = ONEIN;            
            } else if (state == POSTOP) {
                state = READY;
            }
            
            this.setState(state);
        }
    }

    handleOperator(kp) {
        const state = this.getState();

        if (state === ONEIN || state === POSTEVAL) {
            this.setOperator(kp);
            if (state === POSTEVAL) {
                this.resetLastOperator();
            }
            // Move current to last
            if (state === ONEIN) {
                this.setLastNum(this.getCurrentNum());
                this.setCurrentNum('a');
            }
            this.setState(POSTOP);

        // Just updating the operator
        } else if (state === POSTOP) {
            this.setOperator(kp);
        } else if (state === READY) {
            this.evaluate(this.getCurrentNum(), this.getLastNum(), this.getOperator());
            this.setOperator(kp);
            //this.resetOperator(this.getLastNum());  // Necessary?
            this.resetLastOperator();
            this.setState(POSTOP);

        }
    }

    equals() {
        const state = this.getState();

        if (state === POSTEVAL) {
            if (this.getLastOperator() === '-' || this.getLastOperator() === '/') {
                this.evaluate(this.getLastOpNum(), this.getLastNum(), this.getLastOperator());
            } else {
                this.evaluate(this.getLastNum(), this.getLastOpNum(), this.getLastOperator());
            }
            
        } else if (state === POSTOP) {
            this.setCurrentNum(this.getLastNum());
            this.evaluate(this.getCurrentNum(), this.getLastNum(), this.getOperator());
            this.resetOperator(this.getLastNum());
        } else if (state === READY) {
            this.evaluate(this.getCurrentNum(), this.getLastNum(), this.getOperator());
            // Store c as lastOpNum, op as lastOperator ... but where?
            this.setState(POSTEVAL);
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

        // DIV/0 Protection
        if (op === '/' && Number(c) === 0) {
            this.clearScreen();
            this.updateScreen('DIV/0!', 'show')
        } else {
            if (this.getState() !== POSTEVAL && this.getState() !== POSTOP) {
                this.resetOperator(this.getLastNum());
            } else {
                this.updateScreen(this.getLastNum(), 'eval');
            }
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

        if (state === POSTEVAL || state === POSTOP) {
            num = this.getLastNum();
            next = POSTOP;
        } else if (state === ONEIN || state === READY) {
            num = this.getCurrentNum();
            next = POSTEVAL;
        }

        if (num) {  // Skip if 'start'
            if (state === READY) {
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
        if (state === ONEIN || state === READY) {
            this.setCurrentNum((-Number(this.getCurrentNum())).toString());
        // "I want to invert my last answer, disregard any curr/prev operator pressed/remembered"
        } else if (state === POSTEVAL || state === POSTOP) {
            this.setLastNum(-this.getLastNum());
            this.resetOperator(this.getLastNum());
            this.setState(POSTOP);  // Not POSTEVAL because no lastOperation
        }
    }

    resetOperator(n) {
        this.updateScreen(n, 'eval');
        this.setLastOperator(this.getOperator());
        this.setLastOpNum(this.getCurrentNum());
        this.setOperator('');
        this.setCurrentNum('a');
        this.setState(POSTEVAL);
    }

    resetLastOperator() {
        this.setLastOperator('');
        this.setLastOpNum('a');
    }

    backspace() {
        let state = this.getState();
        let string = this.getCurrentNum();

        if (state === ONEIN || state === READY) {
            string = string.slice(0,-1);
            // No more characters
            if (!string.length) {
                if (state === ONEIN) {
                    state = START;
                    string = 'a';
                } else {
                    state = POSTOP;
                    string = '0';
                }
                this.setState(state);
            }
            this.setState(this.getState());
            this.updateScreen(string === 'a' ? undefined : string, 'show');
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
            this.setState(START);
        }
    }

    updateScreen(displayText = "Math Time!", view = 'show') {
        // view:
        //   'show' = Print string (but not if it's too long)
        //   'eval' = Print number

        // console.log(displayText);
        // if (displayText.length > 20) {
        //     displayText = 'Overflow!';
        //     this.setState(START);
        // } else if (displayText === Infinity) {
        //     displayText = 'DIV/0!';
        //     this.setState(START);
        // // } else if (displayText.length > 10 && !isNaN(displayText) && displayText.toString().includes('.') && displayText[displayText.length - 1] !== '.') {
        // } else if (!isNaN(displayText) && displayText[displayText.length - 1] !== '.') {
        //     // Don't lose '2.0' on your way to '2.02'
        //     if (!displayText.toString().includes('.0') && !(displayText[displayText.length - 1] === 0)) {
        //         displayText = Math.floor(displayText * 10000000) / 10000000;
        //         displayText = displayText.toString();
        //     }
        // }

        // displayText = displayText.toString();
        // console.log(displayText.length > 11);
        // if (displayText.length > 11) {
        //     console.log('toolong')
        //     displayText = displayText.substring(0,12);
        // }

        // // Remove trailing zeroes
        // if (displayText.includes('.') && this.getState() === POSTEVAL) {
        //     while (displayText[displayText.length - 1] == 0) {
        //         displayText = displayText.substring(0,displayText.length - 1);
        //     }
        // }


        // console.log(displayText);
        // if (displayText.length > 11) {
        //     console.log('toolong')
        // }
        // if (displayText.toString().length > 11) {
        //     displayText = ((!isNan(displayText)) ? displayText.toString() : displayText).substring(0,12);
        // }
        if (view === 'show' && displayText.length > 12) {
            displayText = displayText.substring(0, 12);
        }

        if (view === 'eval') {
            displayText = Number(displayText);
            displayText = Math.floor(displayText * 10000000) / 10000000;
            if (displayText.toString().length > 12) {
                displayText = "Overflow!";
            }
        }

        this.rootElement.querySelector('.screen').textContent = displayText;
    }

}

// To open the help for mobile
helps = document.querySelectorAll('.helpLink');
helps.forEach(help => {
    // was click
    help.addEventListener('click', event => {
        document.querySelector('.page-sidebar').classList.toggle("visible");
        document.querySelector('.page-subheader').classList.toggle("hide");
    });
})

const calculator1 = new Calculator(document.querySelector('.calc1'));
// const calculator2 = new Calculator(document.querySelector('.calc2'));