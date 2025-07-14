# Perplexity Clone - AI-Powered Search Assistant

An advanced AI-powered search assistant that combines real-time web search with intelligent response generation. Built with Next.js, TypeScript, and modern AI models, this application provides a seamless conversational search experience with educational vocabulary learning features.

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🌟 Features

[![Demo](https://img.youtube.com/vi/wH8fwJRbyMw/maxresdefault.jpg)](https://youtu.be/wH8fwJRbyMw)

### Core Search Functionality
- **AI-Powered Responses**: Leverages Google's Gemini 1.5 Flash model for intelligent, context-aware answers
- **Real-Time Web Search**: Integrates with multiple search providers (Brave, SearXNG, Exa)
- **Citation Support**: Every response includes numbered citations linking to source materials

### Vocabulary Learning System
- **Smart Word Detection**: Automatically identifies educational vocabulary in responses
- **Interactive Learning Cards**: Click on marked words to see comprehensive learning materials including:
  - Pronunciation guides
  - Part of speech information
  - Definitions and usage examples
  - Synonyms and difficulty levels
  - Context from original search
- **Personal Vocabulary Library**: Access all your learned words in one place
- **Progress Tracking**: Monitor your vocabulary learning journey over time

### Discover Page
- **Trending Content**: Browse curated articles and trending topics across multiple categories
- **Category Navigation**: Explore content in Technology, Science, Business, Health, and more
- **Smart Caching**: Fast loading with intelligent session-based content caching
- **Visual Cards**: Beautiful card-based layout with thumbnails and snippets
- **External Links**: Direct access to original sources with favicon indicators

### User Experience
- **Clean, Modern Interface**: Minimalist design focused on readability
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Fast Performance**: Built with Next.js Turbopack for lightning-fast development
- **Keyboard Shortcuts**: Efficient navigation and interaction

### Data Management
- **User Authentication**: Secure login via Clerk authentication
- **Conversation History**: Access and manage past search sessions
- **Thread Organization**: Group related searches into organized threads
- **Privacy-First**: Your data remains secure and private

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4 with custom design system

### Backend
- **API Routes**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk for secure user management
- **AI Integration**: 
  - Google Gemini 1.5 Flash for response generation
  - Unified LLM service architecture for future model additions

### Infrastructure
- **Search Providers**: 
  - Brave Search API
  - Exa AI-powered search
- **Dependency Injection**: InversifyJS for clean architecture
- **Template Engine**: Nunjucks for prompt management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.0 or higher
- npm 9.0 or higher
- PostgreSQL 14.0 or higher
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:dhawan-vaibhav/perplexity-clone.git
   cd my-perplexity-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/perplexity_clone

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

   # AI Models
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   
   # Search Providers (at least one required)
   BRAVE_SEARCH_API_KEY=your_brave_api_key
   EXA_API_KEY=your_exa_api_key       # If using Exa

   # Optional
   OPENAI_API_KEY=your_openai_key     # For future OpenAI support
   ```

4. **Set up the database**
   
   Create the database:
   ```bash
   createdb perplexity_clone
   ```

   Run migrations:
   ```bash
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Search Providers

Configure your preferred search provider in the UI or set a default in your environment:

- **Brave Search**: Requires API key from [Brave Search API](https://brave.com/search/api/)
- **Exa**: Requires API key from [Exa](https://exa.ai)

### Database Schema

The application uses the following main tables:
- `threads`: Stores conversation threads
- `thread_items`: Individual messages within threads
- `vocabulary_entries`: Saved vocabulary words and learning content
- `users`: User profiles (managed by Clerk)

## 📝 Usage

### Basic Search
1. Enter your query in the search box
2. Select your preferred AI model (Gemini 1.5 Flash)
3. Choose a search provider
4. Press Enter or click the send button

### Vocabulary Learning
1. Look for highlighted words in responses
2. Click on any marked word to see detailed information
3. Access your vocabulary library from the sidebar
4. Review and practice learned words

### Managing Conversations
- Access past conversations from the Library
- Delete conversations with the confirmation dialog
- Organize related searches into threads
- Export or share specific responses

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio
```

### Project Structure

```
my-perplexity-clone/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── learn/             # Vocabulary learning pages
│   └── search/            # Search interface
├── components/            # React components
│   ├── chat/              # Chat interface components
│   ├── ui/                # Reusable UI components
│   └── vocabulary/        # Vocabulary learning components
├── src/                   # Core application logic
│   ├── entities/          # Domain models
│   ├── application/       # Use cases and interfaces
│   ├── infrastructure/    # External services and repositories
│   └── prompts/           # AI prompt templates
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── lib/                   # Utility functions
└── di/                    # Dependency injection setup
```

### Architecture Principles

- **Clean Architecture**: Separation of concerns with clear boundaries
- **Domain-Driven Design**: Business logic in the domain layer
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Loose coupling between components

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing TypeScript patterns
- Use functional components with hooks
- Maintain consistent naming conventions
- Add appropriate type definitions
- Write meaningful commit messages

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database permissions

**API Keys Not Working**
- Verify keys are correctly set in `.env.local`
- Check API quotas and limits
- Ensure keys have required permissions

**Build Errors**
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Perplexity AI](https://perplexity.ai)
- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

Built with ❤️ by Vaibhav Dhawan