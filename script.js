document.addEventListener('DOMContentLoaded', () => {
    const resultInput = document.getElementById('result');
    const buttons = document.querySelector('.buttons');
    const historyList = document.getElementById('history-list');
    const themeToggle = document.getElementById('theme-toggle');
    const clearHistoryBtn = document.getElementById('clear-history');

    let currentInput = '';
    let history = [];

    // --- Helper Functions ---
    const isOperator = (char) => ['+', '−', '×', '÷', '^', '%'].includes(char);
    const isFunction = (val) => val.endsWith('(');

    // --- Event Listeners ---
    buttons.addEventListener('click', (event) => {
        const { action, value } = event.target.dataset;
        if (action) {
            handleAction(action);
        } else if (value) {
            appendValue(value);
        }
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        updateHistory();
    });

    document.addEventListener('keydown', (event) => {
        const key = event.key;
        if (key === 'Enter' || key === '=') { event.preventDefault(); calculateResult(); }
        else if (key === 'Backspace') { event.preventDefault(); deleteLast(); }
        else if (key === 'Escape') { event.preventDefault(); clearDisplay(); }
        else if (/[0-9.]/.test(key)) { event.preventDefault(); appendValue(key); }
        else if (/[+\-*/^%]/.test(key)) {
            event.preventDefault();
            appendValue({ '*': '×', '/': '÷', '-': '−' }[key] || key);
        }
        else if (key === '(' || key === ')') { event.preventDefault(); appendValue(key); }
        else if (key.toLowerCase() === 's') { event.preventDefault(); appendValue('sin('); }
        else if (key.toLowerCase() === 'c') { event.preventDefault(); appendValue('cos('); }
        else if (key.toLowerCase() === 't') { event.preventDefault(); appendValue('tan('); }
        else if (key.toLowerCase() === 'l') { event.preventDefault(); appendValue('log('); }
        else if (key.toLowerCase() === 'p') { event.preventDefault(); appendValue('π'); }
        else if (key.toLowerCase() === 'e') { event.preventDefault(); appendValue('e'); }
    });

    // --- Core Functions ---
    function handleAction(action) {
        switch (action) {
            case 'clear': clearDisplay(); break;
            case 'delete': deleteLast(); break;
            case 'calculate': calculateResult(); break;
        }
    }

    function appendValue(value) {
        const lastChar = currentInput.slice(-1);
        if (isOperator(value) && (currentInput === '' || isOperator(lastChar) || lastChar === '(')) {
            return; // Prevent invalid operator placement
        }
        if ((isFunction(value) || value === 'π' || value === 'e') && /[0-9)]/.test(lastChar)) {
            currentInput += '×'; // Auto-insert multiplication
        }
        currentInput += value;
        updateDisplay();
    }

    function clearDisplay() {
        currentInput = '';
        updateDisplay();
    }

    function deleteLast() {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
    }

    function calculateResult() {
        if (currentInput === '' || currentInput === 'Error') return;
        try {
            let expression = currentInput;
            const openParen = (expression.match(/\(/g) || []).length;
            const closeParen = (expression.match(/\)/g) || []).length;
            expression += ')'.repeat(Math.max(0, openParen - closeParen));

            const replacements = {
                '×': '*', '÷': '/', '−': '-', '^': '**',
                'sin': 'Math.sin', 'cos': 'Math.cos', 'tan': 'Math.tan',
                'log': 'Math.log10', 'ln': 'Math.log', 'sqrt': 'Math.sqrt',
                'π': 'Math.PI', 'e': 'Math.E'
            };
            expression = expression.replace(/×|÷|−|\^|sin|cos|tan|log|ln|sqrt|π|e/g, match => replacements[match]);
            expression = expression.replace(/(\d+\.?\d*)%/g, '($1/100)');

            const result = Function(`'use strict'; return (${expression})`)();
            if (isNaN(result) || !isFinite(result)) throw new Error('Invalid result');

            addToHistory(currentInput + ' = ' + result);
            currentInput = result.toString();
        } catch (error) {
            console.error("Calculation Error:", error);
            currentInput = 'Error';
        } finally {
            updateDisplay();
        }
    }

    // --- UI Update Functions ---
    function updateDisplay() {
        resultInput.value = currentInput;
        adjustFontSize();
        resultInput.scrollLeft = resultInput.scrollWidth;
    }

    function adjustFontSize() {
        const len = currentInput.length;
        if (len > 16) resultInput.style.fontSize = '24px';
        else if (len > 11) resultInput.style.fontSize = '32px';
        else if (len > 8) resultInput.style.fontSize = '40px';
        else resultInput.style.fontSize = '48px';
    }

    function addToHistory(entry) {
        history.push(entry);
        updateHistory();
    }

    function updateHistory() {
        historyList.innerHTML = history.length ? history.map(e => `<li>${e}</li>`).join('') : '<li>No history yet.</li>';
    }

    // Initial setup
    updateHistory();
    clearDisplay();
});