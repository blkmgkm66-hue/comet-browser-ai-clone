# Comet Browser AI Clone
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
- **Web Content Display**: Embedded browser view for rendering web pages
### AI Assistant
- **Toggle Interface**: Show/hide AI assistant panel
- **Chat Interface**: Ask questions and get AI-powered responses
- **Context Awareness**: AI can reference current page content
## Development
### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
### Installation
```bash
npm install
```
### Running the Application
```bash
npm start
```
### Building
```bash
npm run build
```
## Milestones & Development Log
**[2025-10-13] TEST SUCCESS: Multi-tab browsing and session restore work as confirmed by Google and Netflix search/navigation. Passed end-user QA. Proceeding to Milestone 2 (AI Assistant).**

**[2025-10-13] MILESTONE: Initial multi-tab browsing and session restore completed. See renderer.js for full implementation and notated progress.**

**[2025-10-12] MILESTONE: Refactored shutdown logic in main.js to keep browser app running on all platforms unless explicitly exited. App now recreates the main window to maintain browser experience instead of quitting. Notated code with milestone and TODOs for future tab recovery.**

**[2025-10-12] MILESTONE: Added comprehensive comments, MILESTONE markers, and TODO tags to renderer.js. Code now clearly marks completed features, outlines improvement areas (AI API integration, tab/session recovery), and improves maintainability for further agentic enhancements.**

**[2025-10-12] MILESTONE: Prototyped basic tab management UI in index.html and renderer.js. New Tab and Close Tab button controls and tab list display scaffolding added and commented. Tab logic & session restore are next.**
