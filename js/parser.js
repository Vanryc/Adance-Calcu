/**
 * Token class for lexical analysis
 */
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    
    toString() {
        return `Token(${this.type}, ${this.value})`;
    }
}

/**
 * Tokenizes an input string into tokens
 * @param {string} inputStr - The input string to tokenize
 * @returns {Array} An array of tokens
 */
function tokenize(inputStr) {
    const tokens = [];
    let i = 0;
    
    while (i < inputStr.length) {
        let char = inputStr[i];
        
        // Skip whitespace
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        
        // Numbers
        if (/\d|\./.test(char)) {
            let num = '';
            while (i < inputStr.length && (/\d|\./.test(inputStr[i]))) {
                num += inputStr[i];
                i++;
            }
            
            // Check for valid number
            if (num.match(/\./g) && num.match(/\./g).length > 1) {
                throw new Error(`Invalid number: ${num}`);
            }
            
            tokens.push(new Token('NUMBER', parseFloat(num)));
            continue;
        }
        
        // Identifiers and keywords
        if (/[a-zA-Z]/.test(char)) {
            let ident = '';
            while (i < inputStr.length && /[a-zA-Z0-9]/.test(inputStr[i])) {
                ident += inputStr[i];
                i++;
            }
            
            const keywords = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'pi', 'e', 'if'];
            if (keywords.includes(ident)) {
                tokens.push(new Token('KEYWORD', ident));
            } else {
                tokens.push(new Token('IDENTIFIER', ident));
            }
            continue;
        }
        
        // Operators and assignment
        if (/[\+\-\*\/\^=><]/.test(char)) {
            // Handle multi-character operators
            if (char === '=' && i + 1 < inputStr.length && inputStr[i + 1] === '=') {
                tokens.push(new Token('OPERATOR', '=='));
                i += 2;
                continue;
            }
            if (char === '>' && i + 1 < inputStr.length && inputStr[i + 1] === '=') {
                tokens.push(new Token('OPERATOR', '>='));
                i += 2;
                continue;
            }
            if (char === '<' && i + 1 < inputStr.length && inputStr[i + 1] === '=') {
                tokens.push(new Token('OPERATOR', '<='));
                i += 2;
                continue;
            }
            if (char === '!' && i + 1 < inputStr.length && inputStr[i + 1] === '=') {
                tokens.push(new Token('OPERATOR', '!='));
                i += 2;
                continue;
            }
            // Single-character operators
            tokens.push(new Token('OPERATOR', char));
            i++;
            continue;
        }
        
        // Parentheses
        if (char === '(' || char === ')') {
            tokens.push(new Token('PAREN', char));
            i++;
            continue;
        }
        
        // If we reach here, it's an unknown character
        throw new Error(`Unknown character: ${inputStr[i]}`);
    }
    
    return tokens;
}

/**
 * Parser class for creating AST
 */
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    
    current() {
        return this.tokens[this.position] || null;
    }
    
    advance() {
        this.position++;
    }
    
    statement() {
        // For our simple calculator, a statement is just an expression
        return this.expression();
    }
    
    expression() {
        return this.term();
    }
    
    term() {
        let left = this.factor();
        
        while (this.current() && this.current().type === 'OPERATOR' && 
               (this.current().value === '+' || this.current().value === '-')) {
            const operator = this.current().value;
            this.advance();
            const right = this.factor();
            left = { type: 'BinaryOp', operator, left, right };
        }
        
        return left;
    }
    
    factor() {
        let left = this.power();
        
        while (this.current() && this.current().type === 'OPERATOR' && 
               (this.current().value === '*' || this.current().value === '/')) {
            const operator = this.current().value;
            this.advance();
            const right = this.power();
            left = { type: 'BinaryOp', operator, left, right };
        }
        
        return left;
    }
    
    power() {
        let left = this.unary();
        
        while (this.current() && this.current().type === 'OPERATOR' && this.current().value === '^') {
            const operator = this.current().value;
            this.advance();
            const right = this.unary();
            left = { type: 'BinaryOp', operator, left, right };
        }
        
        return left;
    }
    
    unary() {
        if (this.current() && this.current().type === 'OPERATOR' && 
            (this.current().value === '+' || this.current().value === '-')) {
            const operator = this.current().value;
            this.advance();
            const operand = this.unary();
            return { type: 'UnaryOp', operator, operand };
        }
        
        return this.atom();
    }
    
    atom() {
        if (!this.current()) {
            throw new Error('Unexpected end of input');
        }
        
        if (this.current().type === 'NUMBER') {
            const value = this.current().value;
            this.advance();
            return { type: 'Number', value };
        }
        
        if (this.current().type === 'IDENTIFIER') {
            const name = this.current().value;
            this.advance();
            
            // Check for assignment
            if (this.current() && this.current().type === 'OPERATOR' && this.current().value === '=') {
                this.advance();
                const value = this.expression();
                return { type: 'Assignment', name, value };
            }
            
            return { type: 'Variable', name };
        }
        
        if (this.current().type === 'KEYWORD') {
            const func = this.current().value;
            this.advance();
            
            // Handle constants like pi and e
            if (func === 'pi' || func === 'e') {
                return { type: 'Constant', name: func };
            }
            
            // Functions require parentheses
            if (!this.current() || this.current().type !== 'PAREN' || this.current().value !== '(') {
                throw new Error(`Expected '(' after function ${func}`);
            }
            
            this.advance(); // Consume '('
            const arg = this.expression();
            
            if (!this.current() || this.current().type !== 'PAREN' || this.current().value !== ')') {
                throw new Error(`Expected ')' after function argument`);
            }
            
            this.advance(); // Consume ')'
            return { type: 'Function', name: func, argument: arg };
        }
        
        if (this.current().type === 'PAREN' && this.current().value === '(') {
            this.advance(); // Consume '('
            const expr = this.expression();
            
            if (!this.current() || this.current().type !== 'PAREN' || this.current().value !== ')') {
                throw new Error(`Expected ')'`);
            }
            
            this.advance(); // Consume ')'
            return expr;
        }
        
        throw new Error(`Unexpected token: ${this.current().toString()}`);
    }
}

/**
 * Symbol table for storing variables
 */
class SymbolTable {
    constructor() {
        this.symbols = {};
    }
    
    declare(name, value) {
        this.symbols[name] = { value };
    }
    
    lookup(name) {
        if (!(name in this.symbols)) {
            throw new Error(`Undefined variable: ${name}`);
        }
        return this.symbols[name].value;
    }
}

/**
 * Bytecode for VM execution
 */
class Bytecode {
    constructor() {
        this.code = [];
    }
    
    emit(op, arg = null) {
        this.code.push({ op, arg });
    }
}

/**
 * Generate bytecode from AST
 * @param {Object} ast - The abstract syntax tree
 * @param {Bytecode} bytecode - The bytecode object
 * @param {SymbolTable} symbolTable - The symbol table
 */
function generateBytecode(ast, bytecode, symbolTable) {
    switch (ast.type) {
        case 'Number':
            bytecode.emit('PUSH', ast.value);
            break;
            
        case 'Variable':
            bytecode.emit('LOAD', ast.name);
            break;
            
        case 'Constant':
            if (ast.name === 'pi') {
                bytecode.emit('PUSH', Math.PI);
            } else if (ast.name === 'e') {
                bytecode.emit('PUSH', Math.E);
            }
            break;
            
        case 'BinaryOp':
            generateBytecode(ast.left, bytecode, symbolTable);
            generateBytecode(ast.right, bytecode, symbolTable);
            
            switch (ast.operator) {
                case '+': bytecode.emit('ADD'); break;
                case '-': bytecode.emit('SUB'); break;
                case '*': bytecode.emit('MUL'); break;
                case '/': bytecode.emit('DIV'); break;
                case '^': bytecode.emit('POW'); break;
                default: throw new Error(`Unknown operator: ${ast.operator}`);
            }
            break;
            
        case 'UnaryOp':
            generateBytecode(ast.operand, bytecode, symbolTable);
            
            if (ast.operator === '-') {
                bytecode.emit('NEG');
            }
            break;
            
        case 'Assignment':
            generateBytecode(ast.value, bytecode, symbolTable);
            bytecode.emit('STORE', ast.name);
            break;
            
        case 'Function':
            generateBytecode(ast.argument, bytecode, symbolTable);
            
            switch (ast.name) {
                case 'sin': bytecode.emit('SIN'); break;
                case 'cos': bytecode.emit('COS'); break;
                case 'tan': bytecode.emit('TAN'); break;
                case 'sqrt': bytecode.emit('SQRT'); break;
                case 'log': bytecode.emit('LOG'); break;
                case 'ln': bytecode.emit('LN'); break;
                default: throw new Error(`Unknown function: ${ast.name}`);
            }
            break;
            
        default:
            throw new Error(`Unknown AST node type: ${ast.type}`);
    }
}

/**
 * Virtual Machine for executing bytecode
 */
class VM {
    constructor(symbolTable) {
        this.stack = [];
        this.symbolTable = symbolTable;
    }
    
    run(bytecode) {
        for (const { op, arg } of bytecode.code) {
            this.execute(op, arg);
        }
        
        if (this.stack.length !== 1) {
            throw new Error('Invalid expression');
        }
        
        return this.stack[0];
    }
    
    execute(op, arg) {
        switch (op) {
            case 'PUSH':
                this.stack.push(arg);
                break;
                
            case 'POP':
                this.stack.pop();
                break;
                
            case 'ADD': {
                const right = this.stack.pop();
                const left = this.stack.pop();
                this.stack.push(left + right);
                break;
            }
                
            case 'SUB': {
                const right = this.stack.pop();
                const left = this.stack.pop();
                this.stack.push(left - right);
                break;
            }
                
            case 'MUL': {
                const right = this.stack.pop();
                const left = this.stack.pop();
                this.stack.push(left * right);
                break;
            }
                
            case 'DIV': {
                const right = this.stack.pop();
                const left = this.stack.pop();
                if (right === 0) {
                    throw new Error('Division by zero');
                }
                this.stack.push(left / right);
                break;
            }
                
            case 'POW': {
                const right = this.stack.pop();
                const left = this.stack.pop();
                this.stack.push(Math.pow(left, right));
                break;
            }
                
            case 'NEG': {
                const value = this.stack.pop();
                this.stack.push(-value);
                break;
            }
                
            case 'SIN': {
                const value = this.stack.pop();
                this.stack.push(Math.sin(value));
                break;
            }
                
            case 'COS': {
                const value = this.stack.pop();
                this.stack.push(Math.cos(value));
                break;
            }
                
            case 'TAN': {
                const value = this.stack.pop();
                this.stack.push(Math.tan(value));
                break;
            }
                
            case 'SQRT': {
                const value = this.stack.pop();
                if (value < 0) {
                    throw new Error('Cannot take square root of negative number');
                }
                this.stack.push(Math.sqrt(value));
                break;
            }
                
            case 'LOG': {
                const value = this.stack.pop();
                if (value <= 0) {
                    throw new Error('Cannot take logarithm of non-positive number');
                }
                this.stack.push(Math.log10(value));
                break;
            }
                
            case 'LN': {
                const value = this.stack.pop();
                if (value <= 0) {
                    throw new Error('Cannot take natural logarithm of non-positive number');
                }
                this.stack.push(Math.log(value));
                break;
            }
                
            case 'LOAD': {
                const value = this.symbolTable.lookup(arg);
                this.stack.push(value);
                break;
            }
                
            case 'STORE': {
                const value = this.stack[this.stack.length - 1]; // Peek at top of stack
                this.symbolTable.declare(arg, value);
                break;
            }
                
            default:
                throw new Error(`Unknown operation: ${op}`);
        }
    }
}