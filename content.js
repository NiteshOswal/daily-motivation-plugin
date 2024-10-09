// Initialize Elements
const dobSection = document.getElementById('dobSection');
const appSection = document.getElementById('appSection');
const dobInput = document.getElementById('dob');
const submitBtn = document.getElementById('submit');
const ageDisplay = document.getElementById('ageDisplay');
const progressBar = document.getElementById('progressBar');
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
const focusButton = document.getElementById('focusButton');
const countdownTimer = document.getElementById('countdownTimer');
const themeToggle = document.getElementById('themeToggle');

// Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.style.backgroundColor;
    if(currentTheme === 'rgb(30, 30, 30)') { // Dark mode
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
    } else { // Light mode
        document.body.style.backgroundColor = '#1e1e1e';
        document.body.style.color = '#ffffff';
    }
});

// Load DOB from storage
chrome.storage.local.get(['dob', 'todos', 'focusMode', 'focusStartTime'], function(result) {
    if(result.dob) {
        dobSection.style.display = 'none';
        appSection.style.display = 'block';
        startApp(result.dob, result.todos || [], result.focusMode, result.focusStartTime);
    }
});

// Handle DOB Submission
submitBtn.addEventListener('click', () => {
    const dobValue = dobInput.value;
    if(dobValue) {
        chrome.storage.local.set({dob: dobValue}, function() {
            dobSection.style.display = 'none';
            appSection.style.display = 'block';
            startApp(dobValue, [], false, null);
        });
    }
});

// Start the App
function startApp(dob, todos, focusMode, focusStartTime) {
    initializeAge(dob);
    initializeTodos(todos);
    if(focusMode && focusStartTime) {
        activateFocusMode(Math.floor(Date.now() - focusStartTime));
    }
}

// Initialize Age Counter
function initializeAge(dob) {
    const birthDate = new Date(dob);
    function updateAge() {
        const now = new Date();
        const diff = now - birthDate;
        const age = diff / (1000 * 60 * 60 * 24 * 365.25);
        ageDisplay.textContent = `Your Age: ${age.toFixed(8)} years`;

        // Update Progress Bar
        const currentYear = Math.floor(age);
        const nextYear = currentYear + 1;
        const progress = ((age - currentYear) / 1) * 100;
        progressBar.style.width = `${progress}%`;
    }
    updateAge();
    setInterval(updateAge, 100);
}

// Initialize To-Do List
function initializeTodos(todos) {
    todos.forEach(todo => addTodoItem(todo));
}

// Add To-Do Item
addTodoBtn.addEventListener('click', () => {
    const todoText = todoInput.value.trim();
    if(todoText) {
        addTodoItem(todoText);
        todoInput.value = '';
        saveTodos();
    }
});

// Add To-Do Item to DOM
function addTodoItem(text) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTodos();
    });

    li.appendChild(deleteBtn);
    todoList.appendChild(li);
}

// Save To-Dos to Storage
function saveTodos() {
    const todos = Array.from(todoList.children).map(item => item.firstChild.textContent);
    chrome.storage.local.set({todos: todos});
}

// Handle Focus Mode
focusButton.addEventListener('click', () => {
    chrome.storage.local.get(['focusMode'], function(result) {
        const isFocusMode = result.focusMode;
        if(isFocusMode) {
            deactivateFocusMode();
        } else {
            activateFocusMode(0);
        }
    });
});

function activateFocusMode(elapsedTime) {
    focusButton.textContent = 'Exit Focus Mode';
    focusButton.classList.add('active');
    const focusStart = Date.now() - elapsedTime;
    chrome.storage.local.set({focusMode: true, focusStartTime: focusStart});

    // Start Countdown
    startCountdown(focusStart);
    
    // Notify Background to start blocking
    chrome.runtime.sendMessage({action: "toggleFocusMode", enable: true});
}

function deactivateFocusMode() {
    focusButton.textContent = 'Focus Mode';
    focusButton.classList.remove('active');
    chrome.storage.local.set({focusMode: false, focusStartTime: null});
    countdownTimer.textContent = '';
    
    // Notify Background to stop blocking
    chrome.runtime.sendMessage({action: "toggleFocusMode", enable: false});
}

function startCountdown(focusStart) {
    function updateCountdown() {
        const now = Date.now();
        const elapsed = now - focusStart;
        const seconds = Math.floor((elapsed / 1000) % 60);
        const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
        const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        countdownTimer.textContent = `Focus Mode Active: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
}