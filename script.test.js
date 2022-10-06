import Calculator from "./calculator.js";

const testCalc = new Calculator(document.querySelector('.calc1'));

describe('mock cases', () => {
    it('should give all the right negative calls', () => {
        testCalc.handleKeyPress('-');
        expect(testCalc.currentNum).toBe('a'); // Should do nothing

        testCalc.handleKeyPress('1');
        testCalc.handleKeyPress('N');
        expect(testCalc.currentNum).toBe('-1');  // Should add neg

        testCalc.handleKeyPress('N');
        expect(testCalc.currentNum).toBe('1');  // Should remove neg
    });



    it('should make a mock call with stuff', () => {
        testCalc.clearScreen();
        testCalc.handleKeyPress('1');
        testCalc.handleKeyPress('+');
        testCalc.handleKeyPress('1');
        
        expect(testCalc.currentNum).toBe('1');
        expect(testCalc.lastNum).toBe('1');
        expect(testCalc.operator).toBe('+');
    });
});

describe('simple operators', () => {
    it('should add 1 + 2 to equal 3', () => {
        expect(testCalc.addition(1, 2, '+')).toBe(3);
    });

    it('should add .1 + .2 to equal .3', () => {
        expect(testCalc.addition(0.1, 0.2, '+')).toBe(0.3);
    });
      
    it('should subtract 3 - 1 to equal 2', () => {
        expect(testCalc.subtraction(3, 1, '-')).toBe(2);
    });

    it('should subtract 3 - 1 to equal 2', () => {
        expect(testCalc.subtraction(0.2, 0.1, '-')).toBe(0.1);
    });
    
    it('should times 2 * 2 to equal 4', () => {
        expect(testCalc.multiplication(2, 2, '*')).toBe(4);
    });
    
    it('should divide 9 / 3 to equal 3', () => {
        expect(testCalc.division(9, 3, '/')).toBe(3);
    });
    
    it('should divide 9 / 0 to equal Infinity', () => {
        expect(testCalc.division(9, 0, '/')).toBe(Infinity);
    });
    
    it('should divide 9 / 0 to be Infinity', () => {
        expect(testCalc.evaluate(0, 9, '/')).toBe(Infinity);
    });
});

describe('output tests', () => {
    it('show: should be 0.3', () => {
        const result = testCalc.evaluate(0.1, 0.2, '+');
        const actual = testCalc.updateScreen(result, 'show');
        expect(actual).toBe(.3);
    })

    it('eval: should be 0.3', () => {
        const result = testCalc.evaluate(0.1, 0.2, '+');
        const actual = testCalc.updateScreen(result, 'eval');
        expect(actual).toBe(.3);
    })
});

