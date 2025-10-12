# Comet Browser AI Clone
## AI Agent Development Best Practices
*These principles are derived from workflow best practices for AI agent development and testing:*

- **Break down features into approved high-level tasks first** - Before diving into implementation, decompose features into clear, parent-level tasks that establish the overall scope and direction
- **Require human approval for parent tasks, then sub-tasks** - Get explicit approval on high-level tasks before breaking them into subtasks, and get approval again on the subtask breakdown before implementation
- **Ask clarifying questions before generating code or PRDs** - Always confirm requirements, constraints, and expectations upfront rather than making assumptions
- **Add testing at the end of each atomic task** - Every discrete task completion should include appropriate tests to validate functionality before moving forward
- **Proceed only one subtask at a time unless explicitly approved** - Sequential execution ensures quality and allows for course correction; only parallelize work when explicitly greenlit
- **Document results and feedback after each major phase** - Capture outcomes, lessons learned, and stakeholder feedback at phase boundaries to inform future iterations
- **Always notate source code with clear comments for all major functions and lifecycle events** - Ensure code readability and maintainability through comprehensive documentation
- **Mark key feature completions with // MILESTONE comments in code** - Track significant progress directly in the codebase for easy reference
- **Use // FIXME or // TODO for known issues or improvements needed** - Flag areas requiring attention or future enhancement
- **When a key feature or fix is completed, record the event under a 'Milestones & Development Log' section in the README** - Maintain a historical record of major achievements and changes
- **Every round of work should result in updated code comments and a new dated entry in the README milestone log** - Ensure continuous documentation of progress and decisions

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
