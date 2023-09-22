/**
 * https://norasandler.com/2017/11/29/Write-a-Compiler.html
 */
import { Parser } from "../src";

// A simple program that returns a constant
const program = `
int main() {
  return 2;
}
`;

test("Lexes tokens", () => {
  const parser = new Parser();
  const lexResult = parser.lex(program);
  expect(lexResult).toEqual([
    {
      type: "KEYWORD_INT",
    },
    {
      type: "IDENTIFIER",
      value: "main",
    },
    {
      type: "OPEN_PAREN",
    },
    {
      type: "CLOSE_PAREN",
    },
    {
      type: "OPEN_BRACE",
    },
    {
      type: "KEYWORD_RETURN",
    },
    {
      type: "CONSTANT",
      value: "2",
    },
    {
      type: "SEMICOLON",
    },
    {
      type: "CLOSE_BRACE",
    },
  ]);
});
