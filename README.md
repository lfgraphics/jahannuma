# Jahannuma - جہان نما

A modern, multilingual poetry platform showcasing Urdu, Hindi, and English literature with comprehensive social features and user interaction capabilities.

## 🌟 Features

- **Multilingual Support**: Urdu (RTL), Hindi, and English content
- **Poetry Categories**: Ashaar, Ghazal, Nazm, Rubai collections
- **Social Features**: Like, comment, and share functionality
- **User Authentication**: Secure user management with Clerk
- **Responsive Design**: Mobile-first, accessible interface
- **Modern Architecture**: Next.js 15 with TypeScript and modular organization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/lfgraphics/jahannuma.git
cd jahannuma

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Clerk and Airtable credentials

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

This project follows a modern, modular architecture with feature-based organization:

```
src/
├── types/              # Type definitions by feature
├── hooks/              # Custom React hooks
├── lib/                # Server-side utilities
├── components/         # UI components by domain
└── utils/              # Client-side utilities

app/
├── api/                # Next.js API routes
├── (pages)/            # Page components
└── globals.css         # Global styles
```

### Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk
- **Database**: Airtable
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: SWR for server state
- **Deployment**: Vercel

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed architecture overview
- [Development Guide](./docs/development.md) - Development workflow and guidelines
- [SEO Guide](./docs/SEO_GUIDE.md) - SEO optimization strategies
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Upgrade and migration procedures
- [Component Guidelines](./docs/COMPONENT_GUIDELINES.md) - Component development standards

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
pnpm test             # Run tests

# Utilities
pnpm clean            # Clean build artifacts
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=

# Optional
NEXT_PUBLIC_ANALYTICS_ID=
```

Note: `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` are server-only environment variables required by API routes using `getAirtableConfig()`.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our [Development Guide](./docs/development.md)
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Poetry content contributors and curators
- Open source community for tools and libraries
- Design inspiration from classical poetry platforms

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/lfgraphics/jahannuma/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lfgraphics/jahannuma/discussions)
- **Email**: support@jahannuma.com

---

Made with ❤️ for poetry lovers worldwide

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
