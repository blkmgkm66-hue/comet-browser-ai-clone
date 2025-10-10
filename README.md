# Comet Browser AI Clone

An Electron-based browser with integrated AI assistant, inspired by Perplexity Comet.

## Overview

This project is a functional browser application built with Electron that features:
- Full web browsing capabilities
- Integrated AI assistant panel
- Clean, modern UI design
- Navigation controls (back, forward, refresh)
- Address bar with URL and search support
- Toggle-able AI assistant sidebar

## Project Structure

```
comet-browser-ai-clone/
├── main.js                 # Electron main process
├── package.json            # Project dependencies and scripts
├── README.md              # This file
└── src/
    ├── index.html         # Main browser UI
    ├── scripts/
    │   └── renderer.js    # Browser and AI assistant logic
    └── styles/
        └── main.css       # Application styles
```

## Features

### Browser Functionality
- **Navigation Controls**: Back, forward, and refresh buttons
- **Address Bar**: Enter URLs or search queries
- **Webview Integration**: Secure browsing with Electron's webview
- **URL Auto-completion**: Automatically adds https:// protocol

### AI Assistant
- **Toggle Panel**: Show/hide AI assistant with a single click
- **Chat Interface**: Interactive chat UI for AI conversations
- **Message History**: Scrollable chat history
- **Placeholder Integration**: Ready for AI API integration (OpenAI, Claude, etc.)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/blkmgkm66-hue/comet-browser-ai-clone.git
   cd comet-browser-ai-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

## Development

To run in development mode with DevTools open:
```bash
npm run dev
```

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **JavaScript**: Core programming language
- **HTML/CSS**: UI structure and styling
- **Webview**: Secure web content rendering

## Future Enhancements

- [ ] Integrate actual AI API (OpenAI, Claude, Gemini)
- [ ] Add bookmarks functionality
- [ ] Implement browsing history
- [ ] Add tabs support for multiple pages
- [ ] Dark mode theme
- [ ] Settings panel
- [ ] Download manager
- [ ] Extensions support
- [ ] Voice input for AI assistant
- [ ] Context-aware AI responses based on current page

## AI Integration Guide

To integrate a real AI API, modify the `sendMessage()` function in `src/scripts/renderer.js`:

```javascript
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessageToChat('user', message);
    chatInput.value = '';

    // Replace with actual AI API call
    const response = await callAIAPI(message);
    addMessageToChat('ai', response);
}

async function callAIAPI(message) {
    // Example: OpenAI API integration
    // return await openai.chat.completions.create({...});
    // Add your API integration here
}
```

## License

MIT License - feel free to use and modify for your projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Inspired by Perplexity Comet browser
- Built with Electron framework
- UI design follows modern browser conventions
