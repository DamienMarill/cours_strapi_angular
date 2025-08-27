# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fullstack development course project combining Directus v11 (backend) and Angular v20 (frontend). The project is a monorepo with educational proof-of-concepts (POCs) for two student projects: a meme manager and a UTAU editor.

**Key Technologies:**
- **Backend**: Directus v11.10.2 with SQLite and TypeScript support
- **Frontend**: Angular v20.2.0 with standalone components
- **Monorepo Management**: npm workspaces with centralized scripts
- **Development Tools**: concurrently, cross-env, TypeScript v5

## Common Development Commands

### Quick Start
```bash
# Install all dependencies for the entire monorepo
npm run install:all

# Initialize Directus (first time only)
npm run directus:init

# Run both Directus and Angular in development mode simultaneously
npm run dev

# Clean all node_modules directories
npm run clean
```

### Directus Backend Commands
```bash
# Development server with auto-reload
npm run directus:dev

# Build/Bootstrap Directus
npm run directus:build

# Start production server
npm run directus:start

# Initialize Directus (first time setup)
npm run directus:init

# Direct Directus commands (run from poc/directus-backend/)
cd poc/directus-backend
npm run dev         # Same as directus:dev
npm run start       # Production start
npm run init        # Initialize database and admin
npm run bootstrap   # Bootstrap configuration
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
cours-directus-angular/
├── doc/                    # Course documentation
├── poc/                    # Proof of concepts
│   ├── directus-backend/   # Directus v11 backend
│   └── angular-frontend/   # Angular v20 frontend
├── TETO-tougou-110401/    # UTAU voice library (for UTAU project)
└── package.json           # Root monorepo configuration
```

### Directus Backend Architecture
- **Version**: 11.10.2 (latest stable)
- **Database**: SQLite with native support
- **Admin Panel**: Modern, intuitive interface at http://localhost:8055
- **TypeScript**: Full TypeScript support with @directus/sdk
- **Authentication**: Built-in user management with granular permissions
- **File Management**: Advanced media handling with transformations
- **API**: REST and GraphQL endpoints out-of-the-box

### Angular Frontend Architecture
- **Version**: 20.2.0 (latest with modern features)
- **Architecture**: Standalone components (no NgModules)
- **Styling**: SCSS support configured
- **Testing**: Jasmine + Karma setup
- **Formatting**: Prettier configured with Angular parser
- **TypeScript**: Strict mode configuration

### Key Development Patterns
- **Angular**: Use standalone components exclusively
- **Directus**: Leverage database-first approach with dynamic schemas
- **Communication**: REST/GraphQL API integration with @directus/sdk
- **State Management**: Angular Signals for reactive state (planned)
- **File Uploads**: Advanced media management with automatic transformations
- **Permissions**: Role-based access control (RBAC) for granular security

## Development Workflow

### Project Setup
1. Ensure Node.js >= 18.13.0 and npm >= 9.0.0
2. Run `npm run install:all` to install all dependencies
3. Use `npm run dev` for concurrent development of both projects

### Port Configuration
- **Directus**: Runs on http://localhost:8055
- **Angular**: Runs on http://localhost:4200
- **Development**: Both run simultaneously via concurrently

### Ready to Use Setup ✅
1. Run `npm run install:all` to install dependencies (if not done)
2. **Directus is already initialized!** Database and admin user ready
3. Run `npm run dev` to start both services
4. Access admin panel at http://localhost:8055

### File Structure Guidelines
- Keep POCs in separate directories under `poc/`
- Course-specific features go in dedicated directories
- Shared utilities should be clearly documented
- Follow Directus v11 and Angular v20 best practices

### Testing Strategy
- **Angular**: Unit tests with Jasmine
- **Directus**: API endpoint testing with built-in tools
- **E2E**: Cross-application testing for full workflows

## Important Notes

### Version Requirements
- Node.js: 18.13.0 to 22.x.x (as specified by Directus)
- npm: >= 9.0.0
- TypeScript: v5 across all projects

### Development Focus
This is an educational project with two distinct application paths:
1. **Meme Manager**: Image uploads, text generation, social features with advanced media transformations
2. **UTAU Editor**: Audio file handling, Japanese phoneme support, project export with metadata management

### Dependencies to Note
- `concurrently`: Enables parallel execution of frontend and backend
- `cross-env`: Cross-platform environment variable handling
- `@directus/sdk`: TypeScript SDK for seamless API integration
- `sqlite3`: High-performance SQLite database driver
- Modern Angular features: Signals, standalone components, latest CLI

### Database Configuration
- SQLite database file: `poc/directus-backend/data.db` (✅ **Already initialized!**)
- Database is excluded from version control via .gitignore
- Admin user already created during initialization
- Admin panel available at http://localhost:8055 for visual database management
- Full configuration available in auto-generated `.env` file

### Directus Features for Educational Use
- **Visual Schema Builder**: Create collections and fields via UI
- **Relationship Management**: Visual relationship editor
- **Media Library**: Advanced file management with transformations
- **User Roles**: Granular permission system
- **API Explorer**: Built-in API documentation and testing
- **Flows**: Visual workflow automation (advanced feature)