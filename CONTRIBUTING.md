# Contributing to Private Chat Server

Thank you for considering contributing to Private Chat Server! This document outlines the process for contributing to this project.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in this project.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the Issues section
2. If not, create a new issue with a clear title and description
3. Include steps to reproduce the bug and any relevant error messages
4. Specify your environment (OS, Bun version, etc.)

### Suggesting Features

1. Check if the feature has already been suggested in the Issues section
2. If not, create a new issue with a clear title and description
3. Explain why this feature would be useful to the project

### Pull Requests

1. Fork the repository

2. Create a new branch for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes

4. Run tests if available
   ```bash
   bun test
   ```

5. Commit your changes with a descriptive commit message

6. Push to your branch

7. Create a Pull Request against the main repository

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/PrivateChatProtocol/private-chat-server.git
   ```

2. Install dependencies
   ```bash
   bun install
   ```

3. Start the development server
   ```bash
   bun run dev
   ```

## Coding Standards

- Use TypeScript for all code
- Follow the existing code style
- Add comments where necessary
- Write JSDoc comments for public functions and classes
- Keep code modular and maintainable

## Testing

- Add tests for new features when possible
- Ensure your changes don't break existing functionality

Thank you for contributing to Private Chat Server!
