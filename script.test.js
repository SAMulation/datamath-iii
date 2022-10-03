import Calculator from "./calculator.js";

const testCalc = new Calculator(document.querySelector('.calc1'));

test('adds 1 + 2 to equal 3', () => {
  expect(testCalc.addition(1, 2)).toBe(3);
});