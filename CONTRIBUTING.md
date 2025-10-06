# Contributing to BitBond

Thank you for your interest in contributing to BitBond! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Clarinet 1.0+
- Git
- Basic knowledge of Clarity smart contracts
- Familiarity with React/TypeScript (for frontend contributions)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/bitbond.git
   cd bitbond
   ```

2. **Install Dependencies**
   ```bash
   # Install Clarinet
   curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-installer.sh | bash
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Run Tests**
   ```bash
   # Smart contract tests
   clarinet test
   
   # Frontend tests
   cd frontend
   npm test
   ```

## 📋 Contribution Guidelines

### Code Style

#### Clarity Smart Contracts
- Use descriptive function and variable names
- Add comments for complex logic
- Follow Clarity best practices
- Include proper error handling
- Use consistent indentation (2 spaces)

#### Frontend (TypeScript/React)
- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Include proper error boundaries
- Write unit tests for new components

### Commit Messages

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(contracts): add early exit penalty calculation
fix(frontend): resolve wallet connection issue
docs: update README with deployment instructions
```

### Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run all tests
   clarinet test
   cd frontend && npm test
   
   # Check code quality
   cd frontend && npm run lint
   ```

4. **Submit Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all tests pass

## 🏗️ Project Structure

### Smart Contracts (`contracts/`)
- `bond-vault.clar` - Main bond management
- `bond-nft.clar` - NFT implementation
- `bond-marketplace.clar` - P2P trading
- `sbtc-token.clar` - Mock token for testing

### Frontend (`frontend/`)
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/app/` - Next.js app router

### Tests (`tests/`)
- `bitbond_test.ts` - Comprehensive test suite

## 🧪 Testing

### Smart Contract Testing
- Use Clarinet testing framework
- Test both success and failure cases
- Include edge cases and boundary conditions
- Mock external dependencies

### Frontend Testing
- Unit tests for components and hooks
- Integration tests for user flows
- E2E tests for critical paths
- Visual regression tests for UI changes

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - OS and version
   - Node.js version
   - Clarinet version
   - Browser (for frontend issues)

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots or error messages

3. **Additional Context**
   - Related issues
   - Workarounds attempted
   - Impact assessment

## 💡 Feature Requests

For feature requests, please:

1. **Check Existing Issues**
   - Search for similar requests
   - Comment on existing issues if relevant

2. **Provide Details**
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach
   - Mockups or examples if applicable

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead:
1. Email security@bitbond.org
2. Include detailed description
3. Provide steps to reproduce
4. Wait for response before disclosure

### Security Best Practices

- Never commit private keys or secrets
- Use environment variables for sensitive data
- Follow secure coding practices
- Keep dependencies updated
- Review code for security vulnerabilities

## 📚 Resources

### Documentation
- [Clarity Language Documentation](https://clarity-lang.org/)
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)
- [Next.js Documentation](https://nextjs.org/docs)

### Community
- [Stacks Discord](https://discord.gg/stacks)
- [Clarity Discord](https://discord.gg/clarity)
- [BitBond Discord](https://discord.gg/bitbond)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Community announcements
- Special Discord role

## 📝 License

By contributing to BitBond, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

If you have questions about contributing:
- Open a GitHub issue with the `question` label
- Join our Discord community
- Email contributors@bitbond.org

Thank you for contributing to BitBond! 🚀
