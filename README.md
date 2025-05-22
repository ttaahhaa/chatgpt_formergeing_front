# Saudi Interpol Chat Assistant

A Next.js-based chat application with document management, built on the NextAdmin framework, designed specifically for Saudi Interpol's needs. This application provides a secure, permission-based chat interface with document management capabilities.

![Saudi Interpol Chat Assistant](https://cdn.pimjo.com/nextadmin-2.png)

## 🚀 Features

- **AI-Powered Chat Interface**: Intuitive chat UI with streaming responses
- **Document Management**: Upload, manage, and search through documents
- **Role-Based Access Control**: Secure access with fine-grained permissions
- **Multiple Knowledge Base Modes**: 
  - Auto (Recommended)
  - Documents Only
  - General Knowledge Only
- **Dark/Light Mode**: Built-in theme switching
- **Responsive Design**: Works on desktop and mobile devices
- **Admin Features**:
  - System status monitoring
  - Log viewing and filtering
  - LLM configuration
  - User settings management

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend API server (Default: http://localhost:8000)
- Local deployment environment (no internet access required)

## 🛠️ Installation

1. Obtain the project files (local deployment only, no internet access required):

```bash
# Copy the project files to your local environment
# or extract from the provided package
cd saudi-interpol-chat
```

2. Install dependencies:

```bash
npm install
# OR
yarn install
```

3. Configure the environment variables by creating a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start the development server:

```bash
npm run dev
# OR
yarn dev
```

5. Access the application at http://localhost:3000

## 🏛️ Project Structure

```
saudi-interpol-chat/
├── public/                # Static assets
├── src/                   # Source code
│   ├── app/               # App router components
│   │   ├── (home)/        # Home routes
│   │   ├── auth/          # Authentication routes
│   │   ├── layout.tsx     # Root layout
│   │   └── providers.tsx  # Context providers
│   ├── assets/            # Icons and logos
│   ├── components/        # Reusable components
│   │   ├── Chat/          # Chat components
│   │   ├── DocumentManagement/ # Document handling
│   │   ├── Layouts/       # Layout components
│   │   ├── Logs/          # Log viewer components
│   │   ├── Settings/      # Settings components
│   │   ├── Status/        # Status components
│   │   └── ui/            # UI components
│   ├── contexts/          # Context providers
│   ├── css/               # Global styles
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── services/          # API services
│   │   ├── api/           # API endpoints
│   │   └── auth.ts        # Auth service
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper utilities
└── package.json           # Dependencies and scripts
```

## 🔐 Authentication & Authorization

The application uses JWT-based authentication. The permission system includes:

- **chat:stream**: Access to the chat interface
- **documents:upload**: Access to document management
- **settings:view**: Access to settings panel
- **admin**: Access to logs and status panels
- **model:view/change**: Permission to view and change LLM models

## 🧩 Main Components

### Chat Interface

The chat interface provides real-time streaming responses from the AI model with support for different modes:

- **Auto**: Balances between document knowledge and general knowledge
- **Documents Only**: Only uses uploaded documents for responses
- **General Knowledge Only**: Uses only the model's knowledge

### Document Management

Upload and manage documents that can be referenced by the chat:

- Supports multiple file formats
- Shows document stats (count, size, etc.)
- Batch operations (delete all)

### Admin Tools

#### Status Panel

View system status including:
- LLM status
- Embeddings status
- Vector store information
- System information

#### Log Viewer

View application logs with filtering capabilities:
- Filter by log level (ERROR, WARNING, INFO, DEBUG)
- Text search
- Download logs

#### Settings

Configure application settings:
- LLM model selection
- Data management (clear conversations, documents, cache)

## 🔄 API Integration

The application communicates with the local backend API server for:

- Authentication
- Chat streaming
- Document management
- System status
- Log retrieval

**Note**: This application is designed for local deployment with no internet access requirement.

## 🎨 Styling

The application uses:
- Tailwind CSS for styling
- Dark/light mode support via next-themes
- Responsive design for mobile and desktop

### Document Management System (DMS)
The Document Management System is a core feature enabling:
- Secure document uploading with progress tracking
- Support for multiple document formats (PDF, DOCX, TXT, CSV, etc.)
- Document metadata extraction and storage (type, size, creation date)
- Document indexing for efficient retrieval during chat
- Permission-based access controls (documents:upload permission required)
- Batch operations for document deletion and management
- Document statistics tracking (count, size, word count)
- Document preview functionality
- FormData-based secure upload process
- Progress indicator during uploads
- Drag-and-drop file upload interface

### Vector Store Integration
The application leverages a sophisticated vector store for semantic document search:
- Documents are processed and embedded using ArabERT embedding model (768 dimensions)
- FAISS vector database stores document embeddings for efficient similarity search
- The chat system can retrieve relevant document sections based on user queries
- Response sources are displayed with relevance scores for transparency
- The vector store is managed through the backend API
- Embeddings are generated using a specialized model optimized for Arabic text
- Vector store statistics are available in the Status panel
- Vector store can be cleared and rebuilt as needed
- Clear separation between document storage and vector representations

### LLM Integration
The chat system integrates with Large Language Models through Ollama:
- Support for multiple LLM models (configurable in settings)
- Model switching capability for administrators (requires model:change permission)
- Real-time status monitoring of LLM availability
- Performance metrics and usage statistics
- Streaming response generation for better user experience
- Connection health checks with model inventory
- Automatic reconnection attempts on failure
- Model selection UI with current model indicator
- Default model fallback mechanism
- User-specific model preferences

### Conversation Management
The application includes a robust conversation management system:
- Create, view, delete, and switch between conversations
- Automatic conversation creation for new users
- Conversation preview generation from initial messages
- Timestamp tracking for recency indicators
- Message counting and statistics
- Conversation search functionality
- "Recent" tag for conversations updated in the last 24 hours
- Confirmation dialogs for destructive actions
- Automatic conversation selection on login
- Empty conversation reuse to prevent duplicate empty conversations
- Optimistic UI updates for better performance

## 💻 Technical Details

### Framework and Architecture
The Saudi Interpol Chat Assistant is built using Next.js version 14, leveraging the new App Router for enhanced performance and routing capabilities. The application follows a client-server architecture where the Next.js frontend communicates with a Python-based API backend server.

Key architectural components:
- Server-side rendering (SSR) for improved performance and SEO
- API routes for secure backend communication
- React Server Components for optimized rendering
- Client-side state management for responsive UI

### Authentication Flow
1. Users log in with username and password credentials
2. The system authenticates against the backend via a secure JWT token system
3. Upon successful authentication, the token is stored in both localStorage and as an HttpOnly cookie
4. The AuthService maintains the authentication state and provides user information
5. Permissions are checked on every restricted route and component render
6. Protected routes redirect unauthenticated users to the login page
7. Token expiration is handled with automatic logout

### Chat Functionality Details
The chat system features an advanced streaming architecture:
- Conversations are stored persistently with unique IDs
- Chat history is maintained for context awareness
- User messages and AI responses are clearly separated
- The AI response is streamed in real-time for better UX
- Support for markdown rendering, code blocks with syntax highlighting
- Three knowledge modes (Auto, Documents Only, General Knowledge) for flexible information retrieval
- Error handling with retry capabilities
- Stream cancellation (Escape key or cancel button)
- Sources display with relevance percentages

#### Chat Context
- Manages the state of the current chat session using React Context API
- Stores and updates message history with pagination support
- Handles streaming state management with token accumulation
- Provides error handling for chat operations with retry capabilities
- Coordinates with the API for message sending/receiving
- Implements reducer pattern for state updates (ADD_MESSAGE, UPDATE_LAST_MESSAGE, etc.)
- Supports message updating during streaming for real-time response
- Manages knowledge mode selection (Auto/Documents Only/General Knowledge)
- Persists chat preferences in localStorage
- Provides keyboard shortcut handling (Escape to cancel streaming)
- Manages citation and source attribution for responses
- Coordinates conversation persistence with backend

#### Conversation Context
- Manages the list of all conversations with sorting capabilities
- Handles conversation selection and URL synchronization
- Provides conversation CRUD operations with optimistic updates
- Synchronizes with local storage for persistence across sessions
- Manages conversation metadata (preview, lastUpdated, messageCount)
- Implements auto-selection of recent conversations
- Handles conversation search and filtering with debounced input
- Provides batch operations (clear all conversations)
- Implements pagination for large conversation lists
- Handles race conditions during concurrent operations
- Manages conversation not found scenarios
- Provides empty conversation reuse logic

#### Theme Context
- Provides dark/light theme switching based on next-themes
- Persists theme preference in localStorage
- Handles system theme detection and preference
- Provides theme toggle component with animation
- Syncs theme across tabs/windows
- Implements prefers-color-scheme media query detection
- Provides smooth transitions between themes
- Handles server/client rendering differences
- Manages theme attribute on HTML element
- Prevents theme flash during initial load

### Secure API Service Layer

The application uses a service layer pattern for secure API communication:

#### Core API Service
- Handles base URL configuration with environment variable support (NEXT_PUBLIC_API_URL)
- Implements request/response processing with fetch API
- Manages authentication headers with JWT bearer token
- Provides error handling and retry logic for transient failures
- Handles 401 unauthorized responses with token clearing and redirect
- Uses credentials: 'include' for secure cookie handling
- Implements consistent error format across services
- Manages request timeout handling
- Provides abort controller support for cancellable requests
- Implements connection status monitoring
- JSON parsing with error handling
- Content-Type header management
- HTTP method handling (GET, POST, PUT, DELETE)
- Secure error reporting without sensitive information

#### Conversation API
- createNewConversation(): Creates new conversation with unique ID
- getConversations(): Retrieves all conversations with metadata
- getConversation(id): Gets a specific conversation by ID with messages
- saveConversation(data): Persists conversation changes with preview generation
- deleteConversation(id): Removes a conversation by ID
- clearAllConversations(): Removes all conversations with confirmation
- chat(data): Sends a message to get a response
- streamChatWithAbort(data, callbacks, signal): Sends a message with streaming response and cancellation support
- createAbortController(): Creates abort controller for streaming cancellation
- Uses TextDecoder for streaming data processing
- EventSource-like implementation for SSE (Server-Sent Events)
- Buffered stream processing for partial messages
- Stream error handling with graceful degradation

#### Document API
- uploadDocument(file): Uploads a document file with progress tracking
- getDocuments(): Retrieves all documents with complete metadata
- deleteDocument(id): Removes a specific document by ID
- clearDocuments(): Removes all documents from vector store
- Uses FormData for file uploads
- Handles multipart/form-data content type
- Manages file metadata extraction
- Supports multiple file formats
- Process file size information
- Provides document type detection

#### Status API
- getStatus(): Retrieves comprehensive system status (LLM, embeddings, documents)
- checkOllama(): Tests connection to LLM service and available models
- Provides real-time status indicators
- Reports memory usage statistics
- Collects system information
- Tracks vector store statistics
- Monitors document count and processing

#### Logs API
- getLogs(): Retrieves system logs list with metadata (size, modification time)
- getLogContent(filename): Gets content of a specific log file with filtering options
- Supports log downloading
- Provides log metadata
- Handles different log formats
- Extracts date information from log filenames

#### Settings API
- getModels(): Retrieves available LLM models list
- setModel(model): Changes the current LLM model with validation
- getPreferredModel(): Gets user's preferred model setting
- Permission-based settings access
- Setting validation and error handling
- User preference persistence
- LLM service health monitoring
- Embeddings service status tracking
- Vector store statistics and management
- Memory usage monitoring
- System information display
- Service health checks with detailed reporting
- Available models inventory
- Quick actions for system management
- Log viewing and filtering
- Data purging controls (conversations, documents, cache)
- User settings management

### Mobile Responsiveness
The application is fully responsive with features specifically designed for mobile:
- Collapsible sidebar with toggle button and overlay
- Responsive layout adjustments for small screens using Tailwind breakpoints
- Touch-friendly UI elements with appropriate sizing for touch targets
- Mobile-optimized chat interface with full-width messages
- Responsive header with simplified navigation on small screens
- Mobile-friendly document management with grid adjustments
- Touch-based scrolling optimizations with momentum scrolling
- Media queries for breakpoint-specific styling (sm, md, lg, xl, 2xl)
- Mobile-first approach to component design
- Fixed positioning for action buttons on mobile
- Optimized input handling for mobile keyboards
- Adaptive font sizes for readability on small screens
- Handling of mobile browser quirks and limitations
- Responsive image handling with appropriate sizing
- Mobile-specific gesture handling where appropriate

### Performance Optimizations
The application implements several performance optimizations:
- Lazy loading of components with dynamic imports
- Code splitting for reduced bundle size and faster initial load
- Server-side rendering for initial page load with Next.js
- Client-side navigation for subsequent routing with prefetching
- Memoization of expensive computations using useCallback and useMemo
- Loading states with skeleton UI for better perceived performance
- Optimistic UI updates for better user experience during API calls
- Debounced search inputs to reduce unnecessary API calls
- Virtualized lists for long conversation histories to improve rendering performance
- Image optimization with Next.js Image component for responsive loading
- Incremental Static Regeneration where appropriate for faster page loads
- Component-level code splitting for better chunk management
- Efficient re-rendering with React.memo and PureComponent
- Reduced bundle size through tree shaking
- CSS optimization with Tailwind's JIT compiler
- Strategic data fetching to minimize API calls
- Browser caching through appropriate headers
- Service worker implementation for offline capabilities
- Web vitals optimization (LCP, FID, CLS)
- Efficient state management to prevent unnecessary renders

### User Interface Components

#### AuthService Implementation
- Singleton pattern for consistent authentication state management
- Login/logout functionality with secure token handling and validation
- User information retrieval and caching for performance
- Permission checking with role-based access control system
- Token storage and retrieval methods with fallbacks
- Session persistence across page reloads and tabs
- User profile information management (name, email, role, permissions)
- User role detection and permission assignment
- Error handling for authentication failures
- Secure credential transmission
- Token refresh capabilities
- Permission inheritance based on roles
- Session cleanup on logout
- Initial app state setup after authentication

#### Permission System
- Fine-grained permission control based on user roles
- Predefined permissions for specific features:
  - **chat:stream**: Access to the chat interface and conversation management
  - **documents:upload**: Access to document management system
  - **settings:view**: Access to view settings panel
  - **model:view**: Permission to view available models
  - **model:change**: Permission to change the current model
  - **admin**: Access to logs and status panels (administrative functions)
- Special "*" permission for administrators (grants all access)
- Permission checking at component and route levels
- UI adaptation based on permissions (dynamic rendering)
- Permission-based navigation rendering
- Hierarchical permission structure
- Component-level permission checks
- API-level permission enforcement
- Permission debugging tools
- Default permissions based on roles

#### Protected Routes
- Route protection mechanism using ProtectedRoute component
- Authentication state verification before rendering protected content
- Redirect to login page for unauthenticated users
- Permission-specific route protection
- Loading states during authentication checks
- Server-side authentication verification
- Client-side permission enforcement
- Route access monitoring
- Unauthorized access handling
- Route-specific permission requirements
- Navigation guards for protected routes
- Access denied feedback for users

#### Login System
- Username/password authentication against backend API
- Form validation with error handling and feedback
- Secure credential transmission with HTTPS
- Login state persistence across browser sessions
- Error messaging for failed authentication attempts
- Loading state during authentication process
- Automatic redirection after successful login
- Initial conversation creation after login
- Remember me functionality
- Password input with visibility toggle
- Form validation with real-time feedback
- Error classification and appropriate messaging
- Branding on login page
- Responsive login form design
- Cross-device session management

#### ChatArea Component
- Message display with user/assistant distinction
- Streaming message rendering with typing indicator
- Markdown support with rehype/remark for rich text formatting
- Syntax highlighting for code blocks using highlight.js
- Citation of document sources with relevance scores and linking
- Input area with keyboard shortcuts (Enter to send, Shift+Enter for line break)
- Stop generation button during streaming responses
- Textarea with auto-resize functionality for dynamic content
- Keyboard shortcut hints (displayed below input)
- Empty state with suggested prompts and guidance
- Error handling with retry options and clear error messaging
- Knowledge mode selector (Auto/Documents Only/General Knowledge)
- Copy button for code blocks with clipboard API integration
- Message bubble styling with proper attribution and timestamps
- Message grouping for better readability
- Auto-scroll to bottom of conversation
- Conversation history loading with pagination
- Message persistence between sessions
- Loading indicators during API calls
- Character count for long messages
- Support for code execution and explanation

### Context System and State Management

#### Authentication Context
- Provides user authentication state across the application
- Manages JWT token storage and validation (localStorage + HttpOnly cookie)
- Provides user profile information (name, email, role, permissions)
- Handles permission checking with role-based access control
- Manages login/logout functionality with secure token handling
- Creates initial conversation after successful login
- Cleans up empty conversations during logout
- Handles authentication errors with appropriate redirects
- Updates authentication state across components
