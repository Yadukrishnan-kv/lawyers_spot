# LawyerSpot Mobile App — Reference Guide

> **Purpose**: This document serves as the single source of truth for mobile app developers porting the LawyerSpot web platform to a native mobile app (iOS/Android). It documents every screen, module, feature, and design token.

---

## 1. Design System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Navy-950 | `#050d1a` | Darkest bg (dark mode body) |
| Navy-900 | `#0a1628` | Dark backgrounds, headings |
| Navy-800 | `#122240` | Card bg in dark mode |
| Navy-700 | `#1a3058` | Borders in dark mode |
| Royal-600 | `#2563eb` | Primary CTA, accent, active tab |
| Royal-500 | `#3b82f6` | Primary hover |
| Royal-400 | `#60a5fa` | Light accent |
| Gold-500 | `#d4a853` | Top-rated badges, gold buttons |
| Gold-400 | `#e8c468` | Gold hover state |
| Emerald-600 | `#059669` | Success, verified badge, header accent |
| Slate-50 | `#f8fafc` | Page bg (light mode) |
| Slate-200 | `#e2e8f0` | Borders, dividers |
| Slate-500 | `#64748b` | Secondary text |
| Slate-700 | `#334155` | Body text |
| Amber-500 | `#f59e0b` | Star ratings |

### Typography

| Role | Font | Web CSS Var | Weight |
|------|------|-------------|--------|
| Body | Inter | `--font-inter` | 400 / 600 |
| Display | Plus Jakarta Sans | `--font-jakarta` | 700 / 800 |
| Accent | Manrope | `--font-manrope` | 600 / 700 |

### Spacing & Layout

- Page max width: `1280px` (max-w-7xl)
- Horizontal padding: `16px` (mobile) / `24px` (tablet) / `32px` (desktop)
- Section padding: `80px` (py-20)
- Border radius: `1rem` (xl), `1.25rem` (2xl), `1.5rem` (3xl)
- Shadows: `soft` (0 4px 24px rgba(10,22,40,0.08)), `premium` (0 12px 40px rgba(10,22,40,0.12))

### Glass / Frost Effect

```
bg-white/70 backdrop-blur-xl border border-white/40
```

---

## 2. Screen Map (All Modules)

### 2.1 Public Screens

| # | Screen | Description | Key UI Elements |
|---|--------|-------------|-----------------|
| 1 | **Home** (`/`) | Landing page | Search form (name/city/practice), hero CTA, stats bar, practice grid (6+ cards), top lawyers (horizontal scroll), Q&A feed, articles grid, SEO browse links, app download CTA |
| 2 | **Lawyer Directory** (`/lawyers`) | Searchable lawyer listing | Search bar, 3 dropdown filters (city/practice/sort), results grid, lawyer cards with image/name/rating/specialization/location, pagination |
| 3 | **Lawyer Profile** (`/lawyers/[slug]`) | Lawyer detail page | Hero header (gradient bg, avatar, name, rating, badges), booking widget (calendar, time slots, consult type), 4 tabs (About, Experience, Reviews, FAQ), contact reveal, similar lawyers carousel |
| 4 | **Q&A Home** (`/qa`) | Legal Q&A feed | Category pills/chips, question cards (title, excerpt, answers count, views), search, trending topics sidebar |
| 5 | **Q&A Detail** (`/qa/[slug]`) | Single Q&A post | Question header, lawyer answer cards (avatar, name, answer text, upvotes), post answer form |
| 6 | **Ask Question** (`/qa/ask`) | Submit a legal question | Category dropdown, question textarea (6 rows), submit button |
| 7 | **Articles Hub** (`/articles`) | Legal knowledge center | Article cards (cover image, category badge, title, read time), category filter tabs |
| 8 | **Article Detail** (`/articles/[slug]`) | Full article | Cover image, title, author/date, rich text body with TOC (table of contents), related articles |
| 9 | **City Landing** (`/city/[slug]`) | SEO city page | City hero, lawyer count, practice area links, lawyer cards from that city |
| 10 | **City + Practice** (`/city/[slug]/[practice]`) | Combo SEO page | City + practice area header, filtered lawyer results |
| 11 | **All Cities** (`/cities`) | City index | Alphabetical grid of city cards with lawyer counts |
| 12 | **All Courts** (`/courts`) | Court index | Court cards with lawyer counts |
| 13 | **Court Detail** (`/court/[slug]`) | Court-specific lawyers | Court name/hero, lawyer listing |
| 14 | **Practice Area** (`/practice/[slug]`) | Practice area hub | Practice name, description, lawyer count, lawyer cards |
| 15 | **Guides** (`/guides`) | Law guides index | Guide cards by category |
| 16 | **Acts** (`/acts`) | Acts & sections index | Alphabetical list of acts |
| 17 | **Act Detail** (`/acts/[slug]`) | Individual act page | Act name, sections list |
| 18 | **IPC** (`/ipc`) | Indian Penal Code hub | IPC sections browse |
| 19 | **BNS** (`/bns`) | Bharatiya Nyaya Sanhita hub | BNS sections browse |
| 20 | **Indian Kanoon** (`/indian-kanoon`) | Indian Kanoon resource | Embedded search, recent judgments |
| 21 | **Search Results** (`/search`) | Site-wide search | Search input, tabs (lawyers/articles/QA), results list |
| 22 | **About** (`/about`) | About us | Company info, mission, team |
| 23 | **Privacy** (`/privacy`) | Privacy policy | Legal document text |
| 24 | **Terms** (`/terms`) | Terms of service | Legal document text |
| 25 | **HTML Sitemap** (`/html-sitemap`) | SEO sitemap | All internal links organized by category |

### 2.2 Auth Screens

| # | Screen | Description | Key UI Elements |
|---|--------|-------------|-----------------|
| 26 | **Client Login** (`/login`) | User login | Email input, password input, forgot password link, signup CTA |
| 27 | **Client Signup** (`/signup`) | New user registration | Name, email, password, confirm password, terms checkbox |
| 28 | **Lawyer Login** (`/lawyer-login`) | Lawyer login | Email, password, forgot password, signup CTA |
| 29 | **Lawyer Signup** (`/lawyer-signup`) | Lawyer registration | Name, email, phone, bar council number, practice area, password, terms |

### 2.3 Client Dashboard

| # | Screen | Description | Key UI Elements |
|---|--------|-------------|-----------------|
| 30 | **Dashboard Home** (`/dashboard`) | User overview | Side nav (Consultations, Saved, Notifications, Messages, Documents, Settings), upcoming consultations card, recent activity feed |
| 31 | **Saved Lawyers** (`/dashboard/saved`) | Bookmarked lawyers | Lawyer card list with remove button |
| 32 | **Notifications** (`/dashboard/notifications`) | Activity alerts | Notification list (icon, text, timestamp, read/unread) |
| 33 | **Messages** (`/dashboard/messages`) | Chat with lawyers | Conversation list, chat detail view |
| 34 | **Documents** (`/dashboard/documents`) | Shared documents | Document list with download/view |
| 35 | **Settings** (`/dashboard/settings`) | Account settings | Profile edit, password change, preferences |

### 2.4 Lawyer Dashboard

| # | Screen | Description | Key UI Elements |
|---|--------|-------------|-----------------|
| 36 | **Dashboard Home** (`/lawyer-dashboard`) | Lawyer overview | Stats cards (Leads, Appointments, Earnings, Rating), quick actions (Edit Profile, Write Articles, Answer Q&A, Subscription, Settings), verification panel, client chats preview, availability card |
| 37 | **Profile Editor** (`/lawyer-dashboard/profile`) | Edit lawyer profile | Avatar upload, name, phone, address, bio, education, specialization tags, courts, timeline, fee settings, FAQs |
| 38 | **Articles Manager** (`/lawyer-dashboard/articles`) | CRUD articles | Article list (title, status, date), create/edit/delete |
| 39 | **New Article** (`/lawyer-dashboard/articles/new`) | Create article | Cover image upload, title, category, rich text body (TipTap editor), publish toggle |
| 40 | **Edit Article** (`/lawyer-dashboard/articles/[slug]`) | Edit article | Same as new with pre-filled data |
| 41 | **Q&A Manager** (`/lawyer-dashboard/qa`) | Manage Q&A answers | List of questions lawyer has answered, reply to new questions |
| 42 | **Edit Q&A** (`/lawyer-dashboard/qa/[id]`) | Edit answer | Question display, answer editor |
| 43 | **Settings** (`/lawyer-dashboard/settings`) | Account settings | Name, email, password change, notification prefs |
| 44 | **Subscription** (`/lawyer-dashboard/subscription`) | Plan management | Current plan display, plan comparison grid, upgrade/downgrade CTA |

### 2.5 Booking Flow

| # | Step | Description |
|---|------|-------------|
| 45 | **Booking Widget** (embedded in profile) | Select date (calendar), time slot (dropdown), consultation type (video/phone/in-person), confirm button |
| 46 | **Booking Confirm Modal** | Client name, email, date/time summary, confirm button, loading state, error handling |
| 47 | **Booking Success** (redirect to dashboard) | Booking appears in "Upcoming Consultations" |

---

## 3. Component Inventory (Reusable Patterns)

### Cards
- **LawyerCard**: Image (3:2 ratio), name, badges (Top Rated/Verified), star rating, experience, location, specialization tags, "View Profile" button
- **Q&A Card**: Category pill, title, excerpt, answer count, view count
- **Article Card**: Cover image (16:9), category badge, title, read time, hover scale effect
- **Stat Card**: Icon circle, large value, label
- **Practice Area Card**: Icon (lucide), name, lawyer count, hover lift effect

### Navigation
- **Bottom Tab Bar** (proposed): Home, Lawyers, Q&A, Articles, Account
- **Header**: Brand logo + tagline, main nav links, search toggle, auth menu
- **Mobile Drawer**: Utility links, main menu, SEO nav links
- **Mega Menu**: Desktop large dropdown with columns (lawyers, practice areas, resources, more)

### Lists & Feeds
- **Lawyer Grid**: 2 columns mobile, 3 columns tablet, 4 columns desktop
- **Article Grid**: 1 column mobile, 2 columns tablet, 3 columns desktop
- **Q&A List**: Single column cards
- **Filter Bar**: Search input + dropdown selectors, horizontal scroll on mobile

### Forms
- **Search Form**: Text input, city select, practice select
- **Login/Signup**: Email, password, name fields, validation
- **Ask Question**: Category select, textarea
- **Booking**: Calendar grid, time slot select, consult type select

### Overlays & Modals
- **Booking Confirm Modal**: Summary + client info + confirm
- **Contact Reveal**: Click-to-reveal phone number
- **Language Picker**: Dropdown with language options
- **Mobile Menu**: Full-screen overlay with nav links

---

## 4. Navigation Architecture

```
Bottom Tab Bar (all users)
├── Home
├── Lawyers (search/directory)
├── Q&A
├── Articles
└── Account
    ├── Login (if not auth'd)
    │   ├── Client Login
    │   └── Lawyer Login
    ├── Dashboard (if client)
    ├── Lawyer Dashboard (if lawyer)
    └── Settings
```

### Auth Flows

```
Client:
  Signup → Dashboard
  Login → Dashboard
  Booking (not auth'd) → Login → Dashboard → Booking confirmed

Lawyer:
  Signup → Lawyer Dashboard
  Login → Lawyer Dashboard
```

---

## 5. Key Features & User Stories

### 5.1 Lawyer Discovery
- Search by name, specialization, city, practice area
- Filter by rating, experience, fees
- View detailed profile with all credentials

### 5.2 Online Booking
- Calendar date picker with availability
- Choose time slot (4+ slots per day)
- Choose consultation type (Video/Phone/In-Person)
- Secure payment or free booking
- Booking confirmation with email notification

### 5.3 Legal Q&A
- Browse questions by category
- Search questions
- Post a new question (anonymous or registered)
- Lawyers can answer and get visibility
- Upvote answers, track views

### 5.4 Knowledge Base
- Articles with rich text formatting
- Category browsing
- Related articles
- Table of contents navigation

### 5.5 SEO Pages
- City pages: `/city/mumbai`, `/city/delhi`
- Practice pages: `/practice/divorce`, `/practice/property`
- Combo pages: `/city/mumbai/divorce`
- Court pages: `/court/supreme-court`
- Acts and sections: `/acts/ipc`

### 5.6 Lawyer Tools
- Profile management with verification badges
- Article writing with rich text
- Q&A answer management
- Subscription plan management
- Earnings tracking
- Client communication
- Availability management

### 5.7 User Management
- Book consultations
- Save favorite lawyers
- View history & activity
- Notifications

---

## 6. API Endpoints (Mobile Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/cms` | Get public CMS data (practice areas, cities, site config, stats) |
| POST | `/api/v1/auth/login` | Client login |
| POST | `/api/v1/auth/signup` | Client signup |
| POST | `/api/v1/auth/lawyer-signup` | Lawyer registration |
| GET | `/api/v1/auth/me` | Get current user session |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/lawyer/profile` | Get lawyer profile (auth'd) |
| PUT | `/api/v1/lawyer/profile` | Update lawyer profile |
| GET/POST/PUT/DELETE | `/api/v1/lawyer/articles` | Lawyer article CRUD |
| GET/POST/PUT/DELETE | `/api/v1/lawyer/qa` | Lawyer Q&A CRUD |
| GET/PUT | `/api/v1/lawyer/subscription` | Subscription management |
| POST | `/api/v1/lawyer/change-password` | Change password |
| POST | `/api/v1/lawyer/upload` | File upload |
| POST | `/api/v1/bookings` | Create booking |

---

## 7. Animations & Transitions

| Pattern | Style | When |
|---------|-------|------|
| Fade-in up | `translateY(12px) → 0`, opacity `0 → 1` | Section entrance, cards appearing |
| Hover lift | `translateY(-4px)`, shadow increase | Cards, buttons |
| Scale on hover | `scale(1.05)` | Article cover images |
| Accordion | `rotate(180°)` chevron | FAQ items |
| Tab switch | Color + border transition | Profile tabs |

---

## 8. Mobile-Specific Recommendations

1. **Bottom tab bar** with 5 tabs: Home, Lawyers, Q&A, Articles, Account
2. **Persistent search bar** in Lawyers tab
3. **Calendar booking** as a bottom sheet (not a modal) for better mobile UX
4. **Floating "Ask Question" FAB** on Q&A screen
5. **Lawyer card** should use horizontal layout on mobile (image left, info right)
6. **Filter drawer** (bottom sheet) instead of dropdowns on mobile
7. **Dark mode** support using the navy palette above
8. **Push notifications** for booking confirmations, Q&A answers, messages
9. **Offline support** for articles and acts/sections
10. **Biometric auth** (fingerprint / face ID) for quick login
