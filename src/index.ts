type TokenType =
  | "KEYWORD_INT"
  | "KEYWORD_RETURN"
  | "IDENTIFIER"
  | "OPEN_PAREN"
  | "CLOSE_PAREN"
  | "OPEN_BRACE"
  | "CLOSE_BRACE"
  | "CONSTANT"
  | "SEMICOLON";

interface Token {
  type: TokenType;
  value?: string;
}

/**
 * Regex of things like identifiers, constants, etc.
 * The order in which the map is defined determines
 * the order in which the tokens are lexed
 */
const TokenRegex: Map<TokenType, RegExp> = new Map([
  ["KEYWORD_INT", /int/],
  ["KEYWORD_RETURN", /return/],
  ["OPEN_PAREN", /\(/],
  ["CLOSE_PAREN", /\)/],
  ["OPEN_BRACE", /\{/],
  ["CLOSE_BRACE", /\}/],
  ["SEMICOLON", /\;/],
  ["CONSTANT", /^[0-9]+$/],
  ["IDENTIFIER", /^[a-zA-Z]+$/],
]);

/**
 * Regex that determines how to break apart the tokens.
 */
const TokenDeliminater = /[\s\(\)\{\}\;]/;

/** A list of tokens that have values */
const TokensWithValues = ["IDENTIFIER", "CONSTANT"];

export class Parser {
  public readonly verbose: boolean = false;
  constructor(
    args?: Partial<{
      verbose: boolean;
    }>
  ) {
    this.verbose = args?.verbose ?? false;
  }
  /**
   * Lexes and lists tokens from a C program
   * @param program A program written in the C programming language
   * @returns An array of lexed tokens
   */
  lex(program: string): Token[] {
    const tokens: Token[] = [];

    const _lex = (s: string) => {
      if (this.verbose) {
        console.log(`Token: ${s}`);
      }
      // Test against each token type to see if it matches
      for (const [tokenType, tokenRegex] of TokenRegex.entries()) {
        if (tokenRegex.test(s)) {
          let value: string | undefined;
          // If this token has an associated value with it,
          // e.g. IDENTIFIER main, copy the value from the buffer
          if (TokensWithValues.includes(tokenType)) {
            value = buffer;
          }

          return value
            ? {
                type: tokenType,
                value,
              }
            : { type: tokenType };
        }
      }
      throw new Error(`Unexpected syntax ${s}`);
    };

    let buffer: string = "";
    // Iterate over the program
    for (let i = 0; i < program.length; i++) {
      // Check if the current character is a deliminater
      if (TokenDeliminater.test(program[i])) {
        if (buffer.length) {
          // Lex the token
          tokens.push(_lex(buffer));
        }
        // Lex the delimiter if it is not whitespace
        if (!/\s/.test(program[i])) tokens.push(_lex(program[i]));
        buffer = "";
      } else {
        buffer += program[i];
      }
    }

    return tokens;
  }
}
