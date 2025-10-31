# GEMINI.md

## Project Overview

This is a Gemini-powe
erface where a user can interact with a Gemini model. The chatbot is capable of using tools to perform specific functions, such as getting the weather or checking an order status.

The project is set up to be used within AI Studio, which explains some of the non-standard configurations like the use of `index.tsx` for bootstrapping and loading dependencies from a CDN via an `importmap`.

The core technologies used are:

- **Angular**: The main framework for building the application.
- **@google/genai**: The client library for interacting with the Gemini API.
- **TailwindCSS**: For styling the application.

## Building and Running

To run this project locally, you will need to have Node.js installed.

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Set API Key**:
    The project requires a Gemini API key. The key is currently hardcoded in `src/services/gemini.service.ts`. It is highly recommended to move this key to an environment variable. For local development, you can create a `.env.local` file in the root of the project and add the following line:

    ```
    GEMINI_API_KEY=your_api_key
    ```

    You will then need to modify the `gemini.service.ts` to read the key from the environment variable.

3.  **Run the Application**:
    ```bash
    npm run dev
    ```
    This will start a development server on `http://localhost:3000`.

### Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Serves the production build locally.

## Development Conventions

- **Standalone Components**: The application uses Angular's standalone components, which simplifies the architecture by reducing the need for NgModules.
- **Signals**: The state of the application is managed using Angular Signals.
- **Function Calling**: The chatbot uses function calling to extend its capabilities. The available tools are defined in `src/services/available-tools.ts`.
- **Styling**: The application is styled using TailwindCSS.

## File-by-File Breakdown

- `index.tsx`: The entry point for the application, which bootstraps the main Angular component. This is a convention for AI Studio projects.
- `index.html`: The main HTML file that contains the root component of the application. It also includes the `importmap` for loading dependencies from a CDN.
- `package.json`: Defines the project's dependencies and scripts.
- `angular.json`: The configuration file for the Angular CLI.
- `src/app.component.ts`: The main component of the application. It manages the chat interface and user interactions.
- `src/services/gemini.service.ts`: The service that interacts with the Gemini API. It handles sending messages, receiving responses, and function calling.
- `src/services/available-tools.ts`: Defines the tools that the chatbot can use.
- `src/models/chat.model.ts`: Contains the data model for chat messages.
- `src/components/chat-message/chat-message.component.ts`: The component for displaying a single chat message.
