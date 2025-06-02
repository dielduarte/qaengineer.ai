# QAengineer.ai

An e2e test framework built with AI, empowering you to define test goals while the AI handles the execution details.

## Installation

Run init command:

```
npx @qaengineer init
```

the init command will install and create a `.qaengineer` folder for you at the project root, with a few example tests.

You can run the executable or add a npm script to execute your tests

```json
{
  "scripts": {
    "qa": "@qaengineer run --apiKey={your_key} --provider={your provider} --model={the model's name}"
  }
}
```

The QA engineer project uses AI sdk behind the scenes to communicate with providers and modules in an easier way. To check the list of providers and modules Qaengineer supports, please refer to the AI SDK's documentation: https://ai-sdk.dev/providers/ai-sdk-providers
