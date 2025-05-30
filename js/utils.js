/**
 * Utility functions for the calculator
 */

/**
 * Shows a modal dialog
 * @param {string} modalId - The ID of the modal to show
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Hides a modal dialog
 * @param {string} modalId - The ID of the modal to hide
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

/**
 * Inserts text at the current cursor position in an input element
 * @param {HTMLInputElement} input - The input element
 * @param {string} value - The text to insert
 */
function insertAtCursor(input, value) {
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    const currentValue = input.value;
    
    input.value = currentValue.substring(0, startPos) + value + currentValue.substring(endPos);
    input.selectionStart = input.selectionEnd = startPos + value.length;
    input.focus();
}

/**
 * Creates a DOM element with given attributes and children
 * @param {string} tag - The tag name
 * @param {Object} attributes - The attributes to set
 * @param {Array} children - The child elements or text
 * @returns {HTMLElement} The created element
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else {
            element.setAttribute(key, value);
        }
    }
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    
    return element;
}