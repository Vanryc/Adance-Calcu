/**
 * Calculator functionality
 */
class Calculator {
    constructor() {
        this.history = [];
        this.variables = {};
    }
    
    /**
     * Calculates the result of an expression
     * @param {string} expression - The expression to calculate
     * @returns {number} The result of the calculation
     */
    calculate(expression) {
        try {
            // Check for commands
            if (expression.toLowerCase() === 'history') {
                return "Command: Show History";
            }
            
            if (expression.toLowerCase() === 'clear') {
                return "Command: Clear Display";
            }
            
            if (expression.toLowerCase() === 'exit' || expression.toLowerCase() === 'end') {
                return "Command: End Session";
            }
            
            // Tokenize and parse
            const tokens = tokenize(expression);
            const parser = new Parser(tokens);
            const ast = parser.statement();
            
            // Semantic analysis
            const symbolTable = new SymbolTable();
            for (const [varName, value] of Object.entries(this.variables)) {
                symbolTable.declare(varName, value);
            }
            
            // Generate bytecode and execute
            const bytecode = new Bytecode();
            generateBytecode(ast, bytecode, symbolTable);
            const vm = new VM(symbolTable);
            const result = vm.run(bytecode);
            
            // Update variables
            for (const [varName, entry] of Object.entries(symbolTable.symbols)) {
                this.variables[varName] = entry.value;
            }
            
            return result;
        } catch (error) {
            throw new Error(`Calculation error: ${error.message}`);
        }
    }
    
    /**
     * Adds a calculation to history
     * @param {string} expression - The expression
     * @param {number} result - The calculation result
     */
    addToHistory(expression, result) {
        if (!this.history.length || this.history[this.history.length - 1].expression !== expression) {
            this.history.push({ expression, result });
        }
    }
    
    /**
     * Clears the calculator history
     */
    clearHistory() {
        this.history = [];
    }
    
    /**
     * Gets the history of calculations
     * @returns {Array} The history array
     */
    getHistory() {
        return this.history;
    }
    
    /**
     * Sets the history from an external source
     * @param {Array} history - The history array to set
     */
    setHistory(history) {
        this.history = Array.isArray(history) ? [...history] : [];
    }
    
    /**
     * Clears all variables
     */
    clearVariables() {
        this.variables = {};
    }
}