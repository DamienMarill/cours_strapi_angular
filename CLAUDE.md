# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fullstack development course project combining Strapi v5 (backend) and Angular v20 (frontend). The project is a monorepo with educational proof-of-concepts (POCs) for two student projects: a meme manager and a UTAU editor.

**Key Technologies:**
- **Backend**: Strapi v5.23.0 Community Edition with SQLite
- **Frontend**: Angular v20.2.0 with standalone components
- **Monorepo Management**: npm workspaces with centralized scripts
- **Development Tools**: concurrently, cross-env, TypeScript v5

## Common Development Commands

### Quick Start
```bash
# Install all dependencies for the entire monorepo
npm run install:all

# Run both Strapi and Angular in development mode simultaneously
npm run dev

# Clean all node_modules directories
npm run clean
```

### Strapi Backend Commands
```bash
# Development server with auto-reload
npm run strapi:dev

# Build for production
npm run strapi:build

# Start production server
npm run strapi:start

# Direct Strapi commands (run from poc/strapi-backend/)
cd poc/strapi-backend
npm run develop     # Same as strapi:dev
npm run console     # Strapi console
npm run upgrade     # Upgrade to latest Strapi version
```

### Angular Frontend Commands
```bash
# Development server (default port 4200)
npm run angular:dev

# Build for production
npm run angular:build

# Run unit tests
npm run angular:test

# Direct Angular CLI commands (run from poc/angular-frontend/)
cd poc/angular-frontend
ng serve           # Same as angular:dev
ng build --watch   # Build with file watcher
ng test           # Run tests
```

## Architecture and Code Structure

### Monorepo Structure
```
cours-strapi-angular/
├── doc/                    # Course documentation
├── poc/                    # Proof of concepts
│   ├── strapi-backend/     # Strapi v5 backend
│   └── angular-frontend/   # Angular v20 frontend
├── TETO-tougou-110401/    # UTAU voice library (for UTAU project)
└── package.json           # Root monorepo configuration
```

### Strapi Backend Architecture
- **Version**: 5.23.0 (latest stable)
- **Database**: SQLite (better-sqlite3) for development
- **Plugins**: Users & Permissions, Cloud plugin
- **TypeScript**: Full TypeScript support enabled
- **Authentication**: OAuth2 integration planned (Google/GitHub/Discord)

### Angular Frontend Architecture
- **Version**: 20.2.0 (latest with modern features)
- **Architecture**: Standalone components (no NgModules)
- **Styling**: SCSS support configured
- **Testing**: Jasmine + Karma setup
- **Formatting**: Prettier configured with Angular parser
- **TypeScript**: Strict mode configuration

### Key Development Patterns
- **Angular**: Use standalone components exclusively
- **Strapi**: Follow v5 architecture with new Document Service API
- **Communication**: REST API integration between frontend and backend
- **State Management**: Angular Signals for reactive state (planned)
- **File Uploads**: Integrated file handling for both meme images and UTAU audio files

## Development Workflow

### Project Setup
1. Ensure Node.js >= 18.13.0 and npm >= 9.0.0
2. Run `npm run install:all` to install all dependencies
3. Use `npm run dev` for concurrent development of both projects

### Port Configuration
- **Strapi**: Typically runs on http://localhost:1337
- **Angular**: Runs on http://localhost:4200
- **Development**: Both run simultaneously via concurrently

### File Structure Guidelines
- Keep POCs in separate directories under `poc/`
- Course-specific features go in dedicated directories
- Shared utilities should be clearly documented
- Follow Strapi v5 and Angular v20 best practices

### Testing Strategy
- **Angular**: Unit tests with Jasmine
- **Strapi**: Integration tests for API endpoints
- **E2E**: Cross-application testing for full workflows

## Important Notes

### Version Requirements
- Node.js: 18.13.0 to 22.x.x (as specified by Strapi)
- npm: >= 9.0.0
- TypeScript: v5 across all projects

### Development Focus
This is an educational project with two distinct application paths:
1. **Meme Manager**: Image uploads, text generation, social features
2. **UTAU Editor**: Audio file handling, Japanese phoneme support, project export

### Dependencies to Note
- `concurrently`: Enables parallel execution of frontend and backend
- `cross-env`: Cross-platform environment variable handling
- `better-sqlite3`: High-performance SQLite for Strapi
- Modern Angular features: Signals, standalone components, latest CLI

### Database Configuration
- SQLite database file will be created in `poc/strapi-backend/.tmp/`
- Database is excluded from version control
- Initial setup creates admin user during first run of Strapi