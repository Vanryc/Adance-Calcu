/**
 * Storage functionality for calculator profiles
 */
class CalculatorStorage {
    constructor() {
        this.calculators = {};
        this.currentCalculator = "default";
        this.loadCalculators();
    }
    
    /**
     * Loads calculators from storage
     */
    loadCalculators() {
        try {
            const stored = localStorage.getItem('calculators');
            if (stored) {
                this.calculators = JSON.parse(stored);
            }
            
            const currentCalc = localStorage.getItem('currentCalculator');
            if (currentCalc) {
                this.currentCalculator = currentCalc;
            }
        } catch (error) {
            console.warn('Failed to load calculators from storage:', error);
        }
        
        // Ensure default calculator exists
        if (!this.calculators['default']) {
            this.calculators['default'] = [];
        }
    }
    
    /**
     * Saves calculators to storage
     */
    saveCalculators() {
        try {
            localStorage.setItem('calculators', JSON.stringify(this.calculators));
            localStorage.setItem('currentCalculator', this.currentCalculator);
        } catch (error) {
            console.warn('Failed to save calculators to storage:', error);
        }
    }
    
    /**
     * Gets the list of calculator names
     * @returns {Array} Array of calculator names
     */
    getCalculatorNames() {
        return Object.keys(this.calculators);
    }
    
    /**
     * Gets a calculator's history by name
     * @param {string} name - The calculator name
     * @returns {Array} The history array
     */
    getCalculatorHistory(name) {
        return this.calculators[name] || [];
    }
    
    /**
     * Sets a calculator's history
     * @param {string} name - The calculator name
     * @param {Array} history - The history array
     */
    setCalculatorHistory(name, history) {
        this.calculators[name] = [...history];
        this.saveCalculators();
    }
    
    /**
     * Creates a new calculator
     * @param {string} name - The calculator name
     * @returns {boolean} Success indicator
     */
    createCalculator(name) {
        if (!name || this.calculators[name]) {
            return false;
        }
        
        this.calculators[name] = [];
        this.currentCalculator = name;
        this.saveCalculators();
        return true;
    }
    
    /**
     * Deletes a calculator
     * @param {string} name - The calculator name
     * @returns {boolean} Success indicator
     */
    deleteCalculator(name) {
        if (name === 'default' || !this.calculators[name]) {
            return false;
        }
        
        delete this.calculators[name];
        
        if (this.currentCalculator === name) {
            this.currentCalculator = 'default';
        }
        
        this.saveCalculators();
        return true;
    }
    
    /**
     * Sets the current calculator
     * @param {string} name - The calculator name
     * @returns {boolean} Success indicator
     */
    setCurrentCalculator(name) {
        if (!this.calculators[name]) {
            return false;
        }
        
        this.currentCalculator = name;
        this.saveCalculators();
        return true;
    }
    
    /**
     * Gets the current calculator name
     * @returns {string} The current calculator name
     */
    getCurrentCalculator() {
        return this.currentCalculator;
    }
}