// Browser functionality
const webview = document.getElementById('webview');
const urlInput = document.getElementById('url-input');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const goBtn = document.getElementById('go-btn');

// AI Assistant elements
const aiToggleBtn = document.getElementById('ai-toggle-btn');
const aiPanel = document.getElementById('ai-panel');
const closeAiBtn = document.getElementById('close-ai-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Navigation controls
backBtn.addEventListener('click', () => {
    if (webview.canGoBack()) {
        webview.goBack();
    }
});

forwardBtn.addEventListener('click', () => {
    if (webview.canGoForward()) {
        webview.goForward();
    }
});

refreshBtn.addEventListener('click', () => {
    webview.reload();
});

goBtn.addEventListener('click', () => {
    navigateToUrl();
});

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        navigateToUrl();
    }
});

function navigateToUrl() {
    let url = urlInput.value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    webview.src = url;
}

// Update URL bar when page changes
webview.addEventListener('did-navigate', (e) => {
    urlInput.value = e.url;
});

webview.addEventListener('did-navigate-in-page', (e) => {
    urlInput.value = e.url;
});

// AI Assistant toggle
aiToggleBtn.addEventListener('click', () => {
    aiPanel.classList.toggle('hidden');
});

closeAiBtn.addEventListener('click', () => {
    aiPanel.classList.add('hidden');
});

// AI Chat functionality
sendBtn.addEventListener('click', () => {
    sendMessage();
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Display user message
    addMessageToChat('user', message);
    chatInput.value = '';

    // Simulate AI response (placeholder for actual AI integration)
    setTimeout(() => {
        const response = 'This is a placeholder response. Integrate with an AI API like OpenAI or Claude for actual functionality.';
        addMessageToChat('ai', response);
    }, 1000);
}

function addMessageToChat(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize
webview.addEventListener('dom-ready', () => {
    console.log('Webview ready');
});
