# Comet Browser AI Clone

## AI Agent Development Best Practices

*These principles are derived from workflow best practices for AI agent development and testing:*

- **Break down features into approved high-level tasks first** - Before diving into implementation, decompose features into clear, parent-level tasks that establish the overall scope and direction
- **Require human approval for parent tasks, then sub-tasks** - Get explicit approval on high-level tasks before breaking them into subtasks, and get approval again on the subtask breakdown before implementation
- **Ask clarifying questions before generating code or PRDs** - Always confirm requirements, constraints, and expectations upfront rather than making assumptions
- **Add testing at the end of each atomic task** - Every discrete task completion should include appropriate tests to validate functionality before moving forward
- **Proceed only one subtask at a time unless explicitly approved** - Sequential execution ensures quality and allows for course correction; only parallelize work when explicitly greenlit
- **Document results and feedback after each major phase** - Capture outcomes, lessons learned, and stakeholder feedback at phase boundaries to inform future iterations

*Attribution: Inspired by transcript-based workflow methodology emphasizing iterative development with continuous human oversight.*

---

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

To modify the application:

1. Edit `main.js` for main process changes
2. Edit `src/index.html` for UI structure
3. Edit `src/scripts/renderer.js` for browser and AI logic
4. Edit `src/styles/main.css` for styling
