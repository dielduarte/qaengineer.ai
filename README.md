<div align="center">

# 🤖 QAengineer.ai

### _Write tests in plain English. Let AI handle the rest._

> **⚠️ RESEARCH PHASE - NOT PRODUCTION READY**
>
> This project is currently in active research and development phase. It is **not ready for production use**.
> APIs, features, and functionality may change significantly. Use at your own risk.

[![npm version](https://badge.fury.io/js/%40qaengineer%2Fcli.svg)](https://badge.fury.io/js/%40qaengineer%2Fcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

_Ship with confidence. Catch bugs before your users do._

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [📚 Examples](#-examples) • [🔧 Configuration](#-configuration)

</div>

---

## 🌟 What is QAengineer.ai?

QAengineer.ai transforms end-to-end testing by letting you write tests in **natural language**. No more complex selectors, no more brittle test code—just describe what you want to test, and let AI handle the execution.

```markdown
# Test Example

go to https://www.google.com and make sure the page is loaded successfully.
```

That's it. That's a test. ✨

## 🚀 Quick Start

### 1. Initialize your project

```bash
npx @qaengineer/cli init
```

_This creates a `.qaengineer` folder with example tests and configuration._

### 2. Run your tests

```bash
npx @qaengineer/cli run --apiKey=your_key --provider=openai --model=gpt-4
```

### 3. Add to your package.json (optional)

```json
{
  "scripts": {
    "qa": "@qaengineer/cli run --apiKey=$OPENAI_API_KEY --provider=openai --model=gpt-4",
    "qa:init": "@qaengineer/cli init"
  }
}
```

## ✨ Features

- 🗣️ **Natural Language Tests** - Write tests in plain English
- 🤖 **AI-Powered Execution** - Let AI handle the technical details
- 🔧 **Multiple AI Providers** - OpenAI, Anthropic, and more
- 🎯 **Smart Test Discovery** - Automatically finds and runs all `.md` test files
- 📊 **Detailed Reporting** - Clear success/failure reports with troubleshooting
- 🔄 **CI/CD Ready** - Works seamlessly in any CI/CD pipeline
- 🏠 **Local Development** - Run tests locally with fast feedback

## 📚 Examples

### Basic Navigation Test

```markdown
# Homepage Load Test

Navigate to https://example.com and verify the page loads successfully.
Check that the main heading is visible.
```

### Form Interaction Test

```markdown
# Contact Form Test

Go to https://example.com/contact
Fill out the contact form with:

- Name: "John Doe"
- Email: "john@example.com"
- Message: "Hello, this is a test message"
  Submit the form and verify success message appears.
```

### E-commerce Flow Test

```markdown
# Product Purchase Flow

Visit the online store at https://shop.example.com
Search for "laptop"
Click on the first product
Add it to cart
Proceed to checkout
Verify the cart contains the selected item
```

## 🔧 Configuration

### Supported AI Providers

| Provider      | Models                                  | Setup                                    |
| ------------- | --------------------------------------- | ---------------------------------------- |
| **OpenAI**    | `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo` | `--provider=openai --apiKey=your_key`    |
| **Anthropic** | `claude-3-sonnet`, `claude-3-haiku`     | `--provider=anthropic --apiKey=your_key` |

### Environment Variables

```bash
# .env file
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Configuration File

Create a `config.md` file in your `.qaengineer` folder for shared setup:

```markdown
<!-- config.md -->

# Shared Configuration

Before running any tests:

1. Navigate to https://app.example.com
2. Login with username: test@example.com
3. Wait for dashboard to load

All tests should start from the authenticated dashboard.
```

## 🏗️ Project Structure

```
your-project/
├── .qaengineer/
│   ├── config.md          # Shared configuration
│   ├── homepage-test.md   # Test files
│   ├── login-test.md
│   └── checkout-test.md
├── package.json
└── ...
```

## 🔍 How It Works

1. **📝 Write Tests** - Create `.md` files with natural language descriptions
2. **🤖 AI Processing** - AI interprets your tests and converts them to actions
3. **🎭 Playwright Execution** - Tests run via Playwright for reliable automation
4. **📊 Smart Reporting** - Get detailed results with troubleshooting suggestions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- 🌐 [Website](https://qaengineer.ai)

---

<div align="center">

**Made with ❤️ by the QAengineer.ai team**

_Star ⭐ this repo if you find it helpful!_

</div>
