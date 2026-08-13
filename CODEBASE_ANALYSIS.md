# B1Admin Codebase Analysis

## Overview

**B1Admin** is a comprehensive, free, open-source church management system built with modern web technologies. It provides churches with tools to manage members, visitors, attendance, donations, groups, forms, and much more.

---

## Tech Stack

### Frontend Framework
- **React 19.1.0** - Latest React with modern hooks and concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 6.3.5** - Fast build tool and dev server
- **React Router DOM 7.6.2** - Client-side routing

### UI Framework & Components
- **Material-UI (MUI) 7.1.2** - Comprehensive component library
- **@mui/icons-material** - Icon set
- **Custom theming** - Light/dark mode support with custom theme provider

### State Management & Data Fetching
- **TanStack React Query 5.83.0** - Server state management, caching, and synchronization
- **React Context API** - User and theme context management
- **React Cookies 8.0.1** - Cookie management

### Form & Input Libraries
- **react-select 5.8.1** - Advanced select components
- **mui-tel-input 9.0.1** - Phone number input
- **react-colorful 5.6.1** - Color picker
- **react-cropper 2.3.3** - Image cropping
- **cropperjs 1.6.2** - Image manipulation

### Calendar & Scheduling
- **react-big-calendar 1.19.4** - Full-featured calendar component
- **dayjs 1.11.19** - Date manipulation library

### Payment Processing
- **@stripe/react-stripe-js 3.8.0** - Stripe integration
- **@stripe/stripe-js 7.6.1** - Stripe SDK

### Maps & Location
- **@react-google-maps/api 2.20.0** - Google Maps integration

### Drag & Drop
- **react-dnd 16.0.1** - Drag and drop functionality
- **react-dnd-html5-backend 16.0.1** - HTML5 backend for react-dnd

### Charts & Visualization
- **react-google-charts 5.2.1** - Google Charts wrapper

### Utilities
- **axios 1.7.7** - HTTP client
- **jszip 3.10.1** - ZIP file creation
- **react-to-print 3.1.0** - Print functionality
- **react-google-recaptcha 3.1.0** - reCAPTCHA integration
- **react-ga4 2.1.0** - Google Analytics 4
- **webfontloader 1.6.28** - Web font loading

### ChurchApps Ecosystem
- **@churchapps/apphelper** - Shared UI components and utilities
- **@churchapps/apphelper-donations** - Donation management components
- **@churchapps/apphelper-forms** - Form builder components
- **@churchapps/apphelper-login** - Authentication components
- **@churchapps/apphelper-markdown** - Markdown editor
- **@churchapps/apphelper-website** - Website builder components
- **@churchapps/content-providers** - External content provider integrations
- **@churchapps/helpers** - Common helper functions

### Development Tools
- **ESLint 9.28.0** - Code linting with custom rules
- **Prettier 3.6.2** - Code formatting
- **Playwright 1.53.1** - End-to-end testing
- **TypeScript ESLint 8.35.0** - TypeScript linting

### Error Tracking
- **@sentry/react 10.27.0** - Error monitoring and tracking

---

## Core Features

### 1. **People Management**
- Member and visitor tracking
- Detailed person profiles with contact information
- Photo management
- Custom fields and attributes
- Household management
- Import/export capabilities

### 2. **Attendance Tracking**
- Service attendance recording
- Self check-in app integration
- Attendance reports and analytics
- Historical attendance data

### 3. **Group Management**
- Small groups, classes, and ministries
- Group membership tracking
- Group leaders and roles
- Group attendance
- Communication tools

### 4. **Donation Management**
- Online donation processing (Stripe & PayPal)
- Donation batching
- Fund management
- Giving statements
- Contribution reports
- Stripe import functionality
- Tax reporting

### 5. **Forms & Surveys**
- Custom form builder
- Form submissions tracking
- Conditional logic
- File uploads
- Email notifications

### 6. **Reporting**
- Pre-built reports
- Custom report builder
- Data export (CSV, Excel)
- Visual charts and graphs
- Admin-level reporting

### 7. **Serving/Ministry Planning**
- Service planning
- Plan types and templates
- Task management
- Task automations
- Song library with ChordPro support
- PraiseCharts integration
- Team scheduling

### 8. **Sermons & Media**
- Sermon management
- Playlists
- Live stream scheduling
- Bulk import
- Media library

### 9. **Calendar Management**
- Event calendars
- Calendar sharing
- Multiple calendar support
- Integration with groups and services

### 10. **Website Builder**
- Drag-and-drop page builder
- Custom blocks and sections
- Responsive design
- File management
- Custom CSS/JS
- Global styling
- SEO optimization

### 11. **Settings & Configuration**
- Church profile settings
- Role-based permissions
- Payment gateway configuration
- Mobile app settings
- API integrations
- Multi-church support

### 12. **Profile & Devices**
- User profile management
- Device management for check-in kiosks
- OAuth integrations

---

## Architecture

### Project Structure
```
B1Admin/
├── src/
│   ├── attendance/          # Attendance tracking
│   ├── calendars/           # Calendar management
│   ├── components/          # Shared UI components
│   ├── dashboard/           # Dashboard/home page
│   ├── device/              # Device authentication
│   ├── donations/           # Donation management
│   ├── forms/               # Form builder
│   ├── groups/              # Group management
│   ├── helpers/             # Utility functions
│   ├── people/              # People management
│   ├── profile/             # User profile
│   ├── reports/             # Reporting
│   ├── sermons/             # Sermon management
│   ├── serverAdmin/         # Admin features
│   ├── serving/             # Ministry planning
│   ├── settings/            # Settings pages
│   ├── site/                # Website builder
│   ├── App.tsx              # Main app component
│   ├── Authenticated.tsx    # Authenticated routes
│   └── index.tsx            # Entry point
├── public/                  # Static assets
├── tests/                   # Playwright tests
├── types/                   # TypeScript type definitions
├── .github/                 # GitHub workflows
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

### Key Design Patterns

1. **Lazy Loading**: All page components are lazy-loaded for optimal performance
2. **Code Splitting**: Manual chunks defined in Vite config for better caching
3. **Context Providers**: User and theme contexts for global state
4. **Error Boundaries**: Graceful error handling
5. **Suspense Fallbacks**: Loading states for async components
6. **Multi-stage Docker Build**: Separate development and production stages

### API Integration
The application connects to multiple microservices:
- **Attendance API** - Attendance tracking
- **Giving API** - Donation processing
- **Membership API** - People and group management
- **Reporting API** - Report generation
- **Messaging API** - Communication features
- **Content API** - Website content
- **Lessons API** - Curriculum management

---

## Areas for Improvement

### 1. **Performance Optimization**
- ✅ Already implements code splitting and lazy loading
- **Recommendation**: Add React.memo() to frequently re-rendering components
- **Recommendation**: Implement virtual scrolling for large lists (people, donations)
- **Recommendation**: Add service worker for offline capabilities

### 2. **Testing Coverage**
- ✅ Playwright tests configured
- **Recommendation**: Increase test coverage (unit tests with Vitest)
- **Recommendation**: Add component testing with React Testing Library
- **Recommendation**: Implement visual regression testing

### 3. **Type Safety**
- ⚠️ `strictNullChecks: false` in tsconfig
- **Recommendation**: Enable strict null checks gradually
- **Recommendation**: Replace `any` types with proper interfaces
- **Recommendation**: Add runtime validation with Zod or Yup

### 4. **Accessibility (a11y)**
- **Recommendation**: Add ARIA labels to interactive elements
- **Recommendation**: Implement keyboard navigation testing
- **Recommendation**: Add screen reader support testing
- **Recommendation**: Ensure WCAG 2.1 AA compliance

### 5. **Security**
- ✅ Environment variables for sensitive data
- **Recommendation**: Implement Content Security Policy (CSP)
- **Recommendation**: Add rate limiting for API calls
- **Recommendation**: Implement CSRF protection
- **Recommendation**: Regular dependency audits (npm audit)

### 6. **Docker & DevOps**
- ⚠️ Current Dockerfile uses Node 12 (EOL)
- ✅ **FIXED**: Updated to Node 20 with multi-stage build
- ✅ **ADDED**: Docker Compose for easier local development
- **Recommendation**: Add health checks to Docker containers
- **Recommendation**: Implement CI/CD pipeline improvements

### 7. **Code Quality**
- ✅ ESLint and Prettier configured
- **Recommendation**: Add pre-commit hooks with Husky
- **Recommendation**: Implement conventional commits
- **Recommendation**: Add code coverage thresholds

### 8. **Documentation**
- ✅ README with basic setup
- **Recommendation**: Add JSDoc comments to complex functions
- **Recommendation**: Create API documentation
- **Recommendation**: Add architecture decision records (ADRs)
- **Recommendation**: Component storybook for UI components

### 9. **State Management**
- ✅ React Query for server state
- **Recommendation**: Consider Zustand or Jotai for complex client state
- **Recommendation**: Implement optimistic updates for better UX

### 10. **Internationalization (i18n)**
- ✅ i18next configured
- **Recommendation**: Add more language translations
- **Recommendation**: Implement RTL support for Arabic/Hebrew

### 11. **Monitoring & Analytics**
- ✅ Sentry for error tracking
- ✅ Google Analytics integration
- **Recommendation**: Add performance monitoring (Web Vitals)
- **Recommendation**: Implement user behavior analytics
- **Recommendation**: Add custom event tracking

### 12. **Mobile Responsiveness**
- **Recommendation**: Audit mobile experience
- **Recommendation**: Add touch gesture support
- **Recommendation**: Optimize for mobile performance

---

## Running Locally with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   cd /home/trix/projects/B1Admin
   ```

2. **Copy environment file**
   ```bash
   cp .env.sample .env
   ```

3. **Edit `.env` file** (optional - defaults work for development)
   ```bash
   nano .env
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

5. **Access the application**
   - Open browser to: http://localhost:3101

### Docker Commands

**Start in detached mode:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop containers:**
```bash
docker-compose down
```

**Rebuild after changes:**
```bash
docker-compose up --build
```

**Run production build:**
```bash
docker-compose -f docker-compose.prod.yml up
```

### Without Docker Compose

**Build the image:**
```bash
docker build -t b1admin:dev --target development .
```

**Run the container:**
```bash
docker run -p 3101:3101 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  -e REACT_APP_STAGE=demo \
  b1admin:dev
```

---

## Traditional Local Setup (Without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy environment file:**
   ```bash
   cp .env.sample .env
   ```

3. **Run postinstall script:**
   ```bash
   npm run postinstall
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

5. **Access at:** http://localhost:3101

---

## Testing

**Run all tests:**
```bash
npm test
```

**Run tests in UI mode:**
```bash
npm run test:ui
```

**Run tests in headed mode:**
```bash
npm run test:headed
```

**Debug tests:**
```bash
npm run test:debug
```

**View test report:**
```bash
npm run test:report
```

---

## Building for Production

**Build the application:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

---

## Key Technologies Summary

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 19.1.0 |
| Language | TypeScript | 5.8.3 |
| Build Tool | Vite | 6.3.5 |
| UI Library | Material-UI | 7.1.2 |
| State Management | TanStack Query | 5.83.0 |
| Routing | React Router | 7.6.2 |
| Testing | Playwright | 1.53.1 |
| Linting | ESLint | 9.28.0 |
| Payment | Stripe | 7.6.1 |

---

## Contributing

This is an open-source project. Contributions are welcome! Please:
1. Join the [Slack Channel](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg)
2. Check the [issues log](https://github.com/ChurchApps/ChurchAppsSupport/issues)
3. Follow the development guide at [churchapps.org/dev](https://churchapps.org/dev)

---

## License

This project is free and open-source. See LICENSE file for details.

---

## Support

- **Website**: https://b1.church/
- **Facebook Community**: https://www.facebook.com/churchapps.org
- **GitHub Sponsors**: https://github.com/sponsors/ChurchApps/
- **Partner Page**: https://churchapps.org/partner
