/**
 * UI handling functionality
 */
class CalculatorUI {
    constructor(calculator, storage) {
        this.calculator = calculator;
        this.storage = storage;
        
        // DOM elements
        this.display = document.getElementById('display');
        this.expressionInput = document.getElementById('expression-input');
        this.calculateBtn = document.getElementById('calculate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.equalsBtn = document.getElementById('equals-btn');
        this.historyList = document.getElementById('history-list');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
        this.saveHistoryBtn = document.getElementById('save-history-btn');
        this.createCalculatorBtn = document.getElementById('create-calculator-btn');
        this.viewCalculatorsBtn = document.getElementById('view-calculators-btn');
        this.deleteCalculatorBtn = document.getElementById('delete-calculator-btn');
        this.calculatorSelector = document.getElementById('calculator-selector');
        this.calculatorsDropdown = document.getElementById('calculators-dropdown');
        this.loadCalculatorBtn = document.getElementById('load-calculator-btn');
        this.calculatorsList = document.getElementById('calculators-list');
        this.calculatorsUl = document.getElementById('calculators-ul');
        this.calculatorHistorySection = document.getElementById('calculator-history-section');
        this.savedHistoryList = document.getElementById('saved-history-list');
        this.createCalculatorModal = document.getElementById('create-calculator-modal');
        this.calculatorNameInput = document.getElementById('calculator-name-input');
        this.confirmCreateBtn = document.getElementById('confirm-create-btn');
        this.cancelCreateBtn = document.getElementById('cancel-create-btn');
        this.deleteCalculatorModal = document.getElementById('delete-calculator-modal');
        this.deleteCalculatorMessage = document.getElementById('delete-calculator-message');
        this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        this.tabs = document.querySelectorAll('.tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Keypad buttons
        this.keypadButtons = document.querySelectorAll('.calculator-keypad button[data-value]');
        
        this.initEventListeners();
    }
    
    /**
     * Initializes all event listeners
     */
    initEventListeners() {
        // Main calculator functions
        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.equalsBtn.addEventListener('click', () => this.calculate());
        this.clearBtn.addEventListener('click', () => this.clearDisplay());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.saveHistoryBtn.addEventListener('click', () => this.saveHistory());
        
        // Calculator management
        this.createCalculatorBtn.addEventListener('click', () => this.showCreateCalculatorModal());
        this.viewCalculatorsBtn.addEventListener('click', () => this.showCalculatorsList());
        this.deleteCalculatorBtn.addEventListener('click', () => this.showDeleteCalculatorModal());
        this.loadCalculatorBtn.addEventListener('click', () => this.loadSelectedCalculator());
        
        // Modal handling
        this.confirmCreateBtn.addEventListener('click', () => this.createNewCalculator());
        this.cancelCreateBtn.addEventListener('click', () => hideModal('create-calculator-modal'));
        this.confirmDeleteBtn.addEventListener('click', () => this.deleteSelectedCalculator());
        this.cancelDeleteBtn.addEventListener('click', () => hideModal('delete-calculator-modal'));
        
        // Input handling
        this.expressionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculate();
            }
        });
        
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabId = tab.getAttribute('data-tab');
                this.tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
        
        // Keypad buttons
        this.keypadButtons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.getAttribute('data-value');
                insertAtCursor(this.expressionInput, value);
            });
        });
        
        // Modal click outside to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                hideModal(e.target.id);
            }
        });
    }
    
    /**
     * Calculates the result from the input field
     */
    calculate() {
        const expression = this.expressionInput.value.trim();
        
        if (!expression) return;
        
        try {
            // Check for commands
            if (expression.toLowerCase() === 'history') {
                this.updateHistoryDisplay();
                return;
            }
            
            if (expression.toLowerCase() === 'clear') {
                this.clearDisplay();
                return;
            }
            
            if (expression.toLowerCase() === 'exit' || expression.toLowerCase() === 'end') {
                if (expression.toLowerCase() === 'end') {
                    if (confirm('End session. Delete history?')) {
                        this.clearHistory();
                    }
                }
                return;
            }
            
            const result = this.calculator.calculate(expression);
            
            // Display result
            this.display.textContent = result;
            
            // Add to history
            this.calculator.addToHistory(expression, result);
            this.updateHistoryDisplay();
            
            // Clear input
            this.expressionInput.value = '';
        } catch (error) {
            this.display.textContent = `Error: ${error.message}`;
            console.error(error);
        }
    }
    
    /**
     * Clears the display and input
     */
    clearDisplay() {
        this.expressionInput.value = '';
        this.display.textContent = '0';
        this.expressionInput.focus();
    }
    
    /**
     * Updates the history display
     */
    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        const history = this.calculator.getHistory();
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<div class="history-item">No calculations in history</div>';
            return;
        }
        
        // Show most recent first
        [...history].reverse().forEach(item => {
            const historyItem = createElement('div', { className: 'history-item' }, [
                createElement('span', { className: 'history-expression' }, [item.expression]),
                createElement('span', { className: 'history-result' }, [`= ${item.result}`])
            ]);
            
            this.historyList.appendChild(historyItem);
        });
    }
    
    /**
     * Clears the history
     */
    clearHistory() {
        this.calculator.clearHistory();
        this.updateHistoryDisplay();
    }
    
    /**
     * Saves the current history to the current calculator
     */
    saveHistory() {
        const history = this.calculator.getHistory();
        
        if (!history.length) {
            alert('No history to save');
            return;
        }
        
        const currentCalculator = this.storage.getCurrentCalculator();
        this.storage.setCalculatorHistory(currentCalculator, history);
        alert(`History saved for calculator "${currentCalculator}"`);
    }
    
    /**
     * Shows the create calculator modal
     */
    showCreateCalculatorModal() {
        this.calculatorNameInput.value = '';
        showModal('create-calculator-modal');
        this.calculatorNameInput.focus();
    }
    
    /**
     * Creates a new calculator
     */
    createNewCalculator() {
        const name = this.calculatorNameInput.value.trim();
        
        if (!name) {
            alert('Calculator name cannot be empty');
            return;
        }
        
        if (!this.storage.createCalculator(name)) {
            alert('Calculator with this name already exists');
            return;
        }
        
        this.calculator.clearHistory();
        this.calculator.clearVariables();
        this.updateHistoryDisplay();
        this.updateCalculatorsDropdown();
        hideModal('create-calculator-modal');
        
        // Update display
        this.display.textContent = `Calculator: ${name}`;
    }
    
    /**
     * Shows the calculators list
     */
    showCalculatorsList() {
        this.calculatorSelector.style.display = 'none';
        this.calculatorsList.style.display = 'block';
        this.calculatorHistorySection.style.display = 'none';
        this.updateCalculatorsDropdown();
    }
    
    /**
     * Shows the delete calculator modal
     */
    showDeleteCalculatorModal() {
        const calculatorNames = this.storage.getCalculatorNames();
        
        if (calculatorNames.length <= 1) {
            alert('No calculators to delete');
            return;
        }
        
        this.calculatorSelector.style.display = 'block';
        this.calculatorsList.style.display = 'none';
        this.calculatorHistorySection.style.display = 'none';
        showModal('delete-calculator-modal');
    }
    
    /**
     * Loads the selected calculator
     */
    loadSelectedCalculator() {
        const selectedCalculator = this.calculatorsDropdown.value;
        
        if (!selectedCalculator) return;
        
        if (this.storage.setCurrentCalculator(selectedCalculator)) {
            const history = this.storage.getCalculatorHistory(selectedCalculator);
            this.calculator.setHistory(history);
            this.calculator.clearVariables();
            this.updateHistoryDisplay();
            this.display.textContent = `Calculator: ${selectedCalculator}`;
            
            // Show history for the selected calculator
            this.showCalculatorHistory(selectedCalculator);
        }
    }
    
    /**
     * Shows the history for a specific calculator
     * @param {string} calcName - The calculator name
     */
    showCalculatorHistory(calcName) {
        this.calculatorHistorySection.style.display = 'block';
        this.savedHistoryList.innerHTML = '';
        
        const history = this.storage.getCalculatorHistory(calcName);
        
        if (history && history.length > 0) {
            [...history].reverse().forEach(item => {
                const historyItem = createElement('div', { className: 'history-item' }, [
                    createElement('span', { className: 'history-expression' }, [item.expression]),
                    createElement('span', { className: 'history-result' }, [`= ${item.result}`])
                ]);
                
                this.savedHistoryList.appendChild(historyItem);
            });
        } else {
            this.savedHistoryList.innerHTML = '<div class="history-item">No history for this calculator</div>';
        }
    }
    
    /**
     * Deletes the selected calculator
     */
    deleteSelectedCalculator() {
        const selectedCalculator = this.calculatorsDropdown.value;
        
        if (!selectedCalculator) return;
        
        if (!this.storage.deleteCalculator(selectedCalculator)) {
            alert('Cannot delete the default calculator');
            return;
        }
        
        this.updateCalculatorsDropdown();
        hideModal('delete-calculator-modal');
        
        // Check if current calculator was deleted
        if (this.storage.getCurrentCalculator() === 'default') {
            const history = this.storage.getCalculatorHistory('default');
            this.calculator.setHistory(history);
            this.updateHistoryDisplay();
            this.display.textContent = 'Calculator: default';
        }
        
        alert(`Calculator "${selectedCalculator}" deleted`);
    }
    
    /**
     * Updates the calculators dropdown
     */
    updateCalculatorsDropdown() {
        this.calculatorsDropdown.innerHTML = '';
        this.calculatorsUl.innerHTML = '';
        
        const calculatorNames = this.storage.getCalculatorNames();
        
        calculatorNames.forEach(calcName => {
            const option = createElement('option', { value: calcName }, [calcName]);
            this.calculatorsDropdown.appendChild(option);
            
            const li = createElement('li', { style: 'margin-bottom: 5px;' }, [calcName]);
            this.calculatorsUl.appendChild(li);
        });
    }
    
    /**
     * Loads the initial calculator state
     */
    loadInitialState() {
        const currentCalculator = this.storage.getCurrentCalculator();
        const history = this.storage.getCalculatorHistory(currentCalculator);
        
        this.calculator.setHistory(history);
        this.updateHistoryDisplay();
        this.updateCalculatorsDropdown();
        this.display.textContent = `Calculator: ${currentCalculator}`;
    }
}