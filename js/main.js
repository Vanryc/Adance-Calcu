/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize storage
        const storage = new CalculatorStorage();
        
        // Initialize calculator
        const calculator = new Calculator();
        
        // Initialize UI
        const ui = new CalculatorUI(calculator, storage);
        
        // Load initial state
        ui.loadInitialState();
        
    } catch (error) {
        console.error('Error initializing calculator:', error);
        alert('Failed to initialize calculator: ' + error.message);
    }
});