import { Parser } from "../src";

const return2 = `
int main() {
    return 2;
}
`;

test("Parses tokens from return2", () => {
  const expected = {
    type: "PROGRAM",
    children: [
      {
        type: "FUNCTION",
        value: "main",
        children: [
          {
            type: "RETURN",
            children: [
              {
                type: "CONSTANT",
                value: "2",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  const parser = new Parser();
  const lexResult = parser.lex(return2);
  const parseResult = parser.parse(lexResult);
  expect(parseResult).toEqual(expected);
});
