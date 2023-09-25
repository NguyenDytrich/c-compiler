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

type ASTNode = {
  type: string;
  children: ASTNode[];
  value?: string;
};

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

  /**
   * Parses a list of tokens and returns an AST
   * At this point, we're only parsing our very primitive function.
   * Our grammar is as follows:
   *   <program> ::= <function>
   *   <function> ::= "int" <identifier> "(" ")" "{" <statement> "}"
   *   <statement> ::= "return" <exp> ";"
   *   <exp> ::= <int>
   */
  parse(tokens: Token[]): ASTNode {
    const root: ASTNode = {
      type: "PROGRAM",
      children: [],
    };

    // The terminal symbol of a function is the '}'
    const FunctionDeclarationPattern: TokenType[] = [
      "KEYWORD_INT",
      "IDENTIFIER",
      "OPEN_PAREN",
      "CLOSE_PAREN",
      "OPEN_BRACE",
    ];

    const ReturnPattern: TokenType[] = ["KEYWORD_RETURN"];
    const ConstantPattern: TokenType[] = ["CONSTANT"];

    let currentNode = root;
    let tokenBuffer: Token[] = [];

    function patternMatch(a: TokenType[], b: TokenType[]) {
      return JSON.stringify(a) === JSON.stringify(b);
    }

    function recurse(): void {
      // Push the current token to the buffer
      const token = tokens.shift();
      if (!token) return;
      tokenBuffer.push(token);

      let newNode: ASTNode | undefined = undefined;

      // Compare the pattern of tokens to the defined patterns
      const statement = tokenBuffer.map((v) => v.type);
      console.log(statement);
      if (patternMatch(statement, FunctionDeclarationPattern)) {
        if (!tokenBuffer[1].value)
          throw new Error("Undefined identifier for function");
        newNode = {
          type: "FUNCTION",
          value: tokenBuffer[1].value,
          children: [],
        };
      } else if (patternMatch(statement, ReturnPattern)) {
        newNode = {
          type: "RETURN",
          children: [],
        };
      } else if (patternMatch(statement, ConstantPattern)) {
        if (!tokenBuffer[0].value)
          throw new Error("Undefined value for constant Token");
        newNode = {
          type: "CONSTANT",
          value: tokenBuffer[0].value,
          children: [],
        };
      } else if (!tokens.length) {
        return;
      }

      if (newNode) {
        currentNode.children.push(newNode);
        // Continue traversing the nodes
        currentNode = newNode;
        tokenBuffer = [];
      }
      return recurse();
    }
    recurse();

    console.log(JSON.stringify(root));

    return root;
  }
}
