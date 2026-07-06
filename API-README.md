# LawyerSpot API — Mobile App Developer Reference

> **API documentation for the main website and lawyer dashboard.**
> Covers all public page APIs and lawyer-side endpoints.

```
Base URL: https://lawyerspot.in
```

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Public API — CMS Data](#1-public-api--cms-data)
5. [Public API — Q&A Answers](#2-public-api--qa-answers)
6. [Public API — Legal Sections (IPC/BNS)](#3-public-api--legal-sections-ivcbns)
7. [Auth API](#4-auth-api)
8. [Lawyer Profile & Subscription](#5-lawyer-profile--subscription)
9. [Lawyer Articles (CRUD)](#6-lawyer-articles-crud)
10. [Lawyer Q&A (CRUD)](#7-lawyer-qa-crud)
11. [Lawyer Messaging](#8-lawyer-messaging)
12. [CMS Data & Site Content](#9-cms-data--site-content)
13. [Lawyer Search & Filtering](#10-lawyer-search--filtering)
14. [Site Search](#11-site-search)
15. [Data Models](#12-data-models)
16. [Quick Reference](#quick-reference--all-endpoints)
17. [Flutter Data Flow](#flutter-app-data-flow)

---

## Overview

| Detail | Value |
|--------|-------|
| Base URL | `https://lawyerspot.in` |
| Protocol | HTTPS |
| Request Body | `application/json` |
| Auth Mechanism | Cookie-based session (`lawyerspot_user_session`) |
| Content-Type | All `POST`/`PUT`/`PATCH`/`DELETE` requests must send `Content-Type: application/json` |

### Rate Limits

| Endpoint Group | Limit |
|----------------|-------|
| Auth (signup/login) | 30 requests / 15 minutes |
| Bookings | 10 requests / minute |

---

## Authentication

Cookie-based sessions. On login, server sets `lawyerspot_user_session` cookie. All authenticated requests include this cookie.

### Flutter Integration

```dart
final dio = Dio();
(dio.httpClientAdapter as HttpClientAdapter).onHttpClientCreate = (client) {
  client.badCertificateCallback = (cert, host, port) => true;
  return client;
};
dio.interceptors.add(CookieManager(PersistCookieJar()));
```

### Session Object (from `GET https://lawyerspot.in/api/auth/me`)

```json
{
  "id": "user-1234567890",
  "email": "lawyer@example.com",
  "name": "Adv. Priya Sharma",
  "role": "lawyer",
  "lawyerId": "lawyer-1234567890"
}
```

---

## Error Handling

All errors return JSON with a `detail` field:

```json
{ "detail": "Error message here" }
```

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request — invalid fields |
| `401` | Unauthorized — not logged in |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found |
| `409` | Conflict — duplicate email |
| `429` | Too Many Requests — rate limit |
| `500` | Internal Server Error |

---

## 1. Public API — CMS Data

### Get All CMS Data

```
GET https://lawyerspot.in/api/cms
```

Returns the **entire app dataset** — lawyers, articles, Q&A, practice areas, cities, courts, acts, site content. This is the primary endpoint for populating all website pages.

**Response:**

```json
{
  "siteConfig": {
    "name": "LawyerSpot",
    "tagline": "...",
    "url": "https://lawyerspot.in",
    "description": "..."
  },
  "siteContent": { /* See Section 9 for full structure */ },
  "subscriptionPlans": [
    {
      "id": "basic",
      "name": "Basic",
      "priceMonthly": 0,
      "currency": "INR",
      "description": "...",
      "features": ["..."],
      "highlight": false,
      "sortOrder": 0,
      "active": true
    }
  ],
  "stats": [
    { "label": "Lawyers Listed", "value": "500+" }
  ],
  "practiceAreas": [
    { "slug": "divorce", "name": "Divorce", "icon": "...", "lawyers": 120 }
  ],
  "states": [
    { "slug": "maharashtra", "name": "Maharashtra", "code": "MH", "active": true }
  ],
  "cities": [
    { "slug": "mumbai", "name": "Mumbai", "state": "Maharashtra" }
  ],
  "lawyers": [
    {
      "id": "lawyer-123",
      "slug": "adv-priya-sharma",
      "name": "Adv. Priya Sharma",
      "image": "https://...",
      "rating": 4.5,
      "reviews": 12,
      "experience": 10,
      "fee": 2000,
      "currency": "INR",
      "location": "Mumbai",
      "address": "456 Law Lane, Mumbai",
      "practice": "Divorce",
      "citySlug": "mumbai",
      "specialization": ["Divorce", "Family Law"],
      "online": true,
      "verified": true,
      "phone": "+919876543210",
      "languages": ["English", "Hindi"],
      "firm": "Sharma Law Associates",
      "bio": "...",
      "education": [
        { "degree": "LLB", "institution": "...", "year": "2015" }
      ],
      "timeline": [
        { "year": "2020", "title": "...", "org": "..." }
      ],
      "practiceGroups": [
        { "title": "...", "areas": ["Family Law"] }
      ],
      "courts": ["Supreme Court of India", "Delhi High Court"],
      "awards": [
        { "title": "...", "year": "2023" }
      ],
      "clientReviews": [
        {
          "author": "Client A",
          "rating": 5.0,
          "text": "Excellent lawyer...",
          "date": "2024-01-15",
          "verified": true,
          "avatar": "https://..."
        }
      ],
      "profileFaq": [
        { "id": "faq-1", "question": "...", "answer": "..." }
      ],
      "email": "priya@example.com",
      "emailVerified": true,
      "phoneVerified": true,
      "subscriptionPlanId": "basic",
      "subscriptionExpiresAt": null,
      "topRated": false
    }
  ],
  "qaPosts": [
    {
      "id": "qa-1",
      "title": "How to file for divorce?",
      "excerpt": "...",
      "category": "Family Law",
      "answers": 5,
      "views": 120,
      "slug": "how-to-file-for-divorce",
      "status": "published",
      "content": "Full content..."
    }
  ],
  "articles": [
    {
      "slug": "article-slug",
      "title": "Article Title",
      "excerpt": "...",
      "category": "Legal News",
      "author": "Adv. Priya Sharma",
      "date": "2024-01-15",
      "readTime": "5 min read",
      "image": "https://...",
      "trending": true,
      "status": "published",
      "content": "Full content...",
      "lawyerId": "lawyer-123"
    }
  ],
  "trendingTopics": ["Divorce Law", "Property Dispute"],
  "defaultProfileReviews": [
    {
      "author": "Client A",
      "rating": 5.0,
      "text": "...",
      "date": "2024-01-15",
      "verified": true,
      "avatar": "https://..."
    }
  ],
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Caching:** Response has `Cache-Control: public, max-age=60, stale-while-revalidate=120`. Cache locally.

### Health Check

```
GET https://lawyerspot.in/health
```

```json
{ "status": "ok" }
```

---

## 2. Public API — Q&A Answers

### Get Q&A Post with Answers

```
GET https://lawyerspot.in/api/qa/:slug/answers
```

Returns a single Q&A post with all published answers.

**Path Parameter:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Q&A post slug |

**Response:**
```json
{
  "question": {
    "id": "qa-1",
    "slug": "how-to-file-for-divorce",
    "title": "How to file for divorce?",
    "excerpt": "...",
    "category": "Family Law",
    "content": "Full article content..."
  },
  "answers": [
    {
      "id": "ans-1",
      "lawyerId": "lawyer-123",
      "lawyerName": "Adv. Priya Sharma",
      "body": "To file for divorce in India...",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

## 3. Public API — Legal Sections (IPC/BNS)

### Get All Sections by Type

```
GET https://lawyerspot.in/api/sections?type=ipc
GET https://lawyerspot.in/api/sections?type=bns
```

**Query Parameter:**

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| `type` | string | Yes | `ipc` or `bns` |

**Response:**
```json
[
  {
    "id": 1,
    "type": "ipc",
    "sectionNumber": "Section 302",
    "title": "Punishment for murder",
    "slug": "ipc-section-302",
    "body": "Whoever commits murder shall be punished with death...",
    "punishment": "Death, or imprisonment for life...",
    "category": "Offences Against the Human Body",
    "status": "active",
    "displayOrder": 302,
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
]
```

### Get Single Section by Slug

```
GET https://lawyerspot.in/api/sections/:slug
```

**Response:** Single section object (same structure as above).

---

## 4. Auth API

### Lawyer Signup

```
POST https://lawyerspot.in/api/auth/lawyer-signup
```

**Request Body:**
```json
{
  "name": "Adv. Priya Sharma",
  "email": "priya@example.com",
  "password": "securePassword123",
  "phone": "+919876543210",
  "practice": "Divorce",
  "barId": "MH/1234/2020",
  "citySlug": "mumbai"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | 1-120 chars, sanitized |
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Min 6 characters |
| `phone` | string | No | 1-20 chars |
| `practice` | string | Yes | Max 64 chars |
| `barId` | string | No | Max 64 chars |
| `citySlug` | string | No | Must match valid city from CMS |

**Response:**
```json
{
  "success": true,
  "role": "lawyer",
  "userId": "lawyer-user-1234567890",
  "lawyerId": "lawyer-1234567890"
}
```

**Errors:**
- `400` — Invalid fields
- `409` — Email already registered
- `429` — Rate limit exceeded

---

### Client Signup

```
POST https://lawyerspot.in/api/auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "role": "client",
  "userId": "user-1234567890"
}
```

---

### Login

```
POST https://lawyerspot.in/api/auth/login
```

Works for both client and lawyer accounts.

**Request Body:**
```json
{
  "email": "priya@example.com",
  "password": "securePassword123",
  "role": "lawyer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email |
| `password` | string | Yes | Account password |
| `role` | string | No | `"client"` or `"lawyer"` — restricts login to this role |

**Response:**
```json
{
  "success": true,
  "role": "lawyer",
  "userId": "lawyer-user-1234567890",
  "lawyerId": "lawyer-1234567890",
  "name": "Adv. Priya Sharma"
}
```

**Errors:**
- `400` — Missing email or password
- `401` — Invalid credentials or wrong role
- `403` — Account not active
- `429` — Rate limit exceeded

---

### Logout

```
POST https://lawyerspot.in/api/auth/logout
```

```json
{ "success": true }
```

---

### Get Current User

```
GET https://lawyerspot.in/api/auth/me
```

**Auth Required:** Yes

**Response:**
```json
{
  "id": "lawyer-user-1234567890",
  "email": "priya@example.com",
  "name": "Adv. Priya Sharma",
  "role": "lawyer",
  "lawyerId": "lawyer-1234567890"
}
```

---

## 5. Lawyer Profile & Subscription

All endpoints require **lawyer role** authentication.

### Get Lawyer Profile

```
GET https://lawyerspot.in/api/lawyer/profile
```

**Response:**
```json
{
  "lawyer": {
    "id": "lawyer-123",
    "slug": "adv-priya-sharma",
    "name": "Adv. Priya Sharma",
    "image": "https://...",
    "rating": 4.5,
    "reviews": 12,
    "experience": 10,
    "fee": 2000,
    "currency": "INR",
    "location": "Mumbai",
    "address": "...",
    "practice": "Divorce",
    "citySlug": "mumbai",
    "specialization": ["Divorce", "Family Law"],
    "online": true,
    "verified": true,
    "email": "priya@example.com",
    "emailVerified": true,
    "phone": "+919876543210",
    "phoneVerified": true,
    "languages": ["English", "Hindi"],
    "firm": "...",
    "bio": "...",
    "subscriptionPlanId": "basic",
    "subscriptionExpiresAt": null,
    "topRated": false
  },
  "user": {
    "id": "lawyer-user-123",
    "name": "Adv. Priya Sharma",
    "email": "priya@example.com"
  }
}
```

---

### Update Lawyer Profile

```
PATCH https://lawyerspot.in/api/lawyer/profile
```

**Request Body (all fields optional):**
```json
{
  "name": "Adv. Priya Sharma",
  "phone": "+919876543211",
  "email": "newemail@example.com",
  "bio": "Updated bio...",
  "firm": "Sharma Law Associates",
  "address": "456 Law Lane, Mumbai",
  "fee": 3000,
  "online": true,
  "practice": "Divorce",
  "citySlug": "mumbai",
  "languages": ["English", "Hindi", "Marathi"],
  "specialization": ["Divorce", "Family Law", "Property"]
}
```

| Field | Type | Validation |
|-------|------|------------|
| `name` | string | 1-120 chars |
| `phone` | string | 1-20 chars |
| `email` | string | Valid email, sets `emailVerified: false` |
| `bio` | string | Max 4000 chars |
| `firm` | string | Max 255 chars |
| `address` | string | Max 512 chars |
| `fee` | integer | >= 0 |
| `online` | boolean | — |
| `practice` | string | Max 64 chars |
| `citySlug` | string | Must match valid city |
| `languages` | array of strings | Max 12 items, 32 chars each |
| `specialization` | array of strings | Max 12 items, 64 chars each |

**Response:**
```json
{
  "success": true,
  "lawyer": { /* updated lawyer object */ }
}
```

---

### Change Password

```
POST https://lawyerspot.in/api/lawyer/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

```json
{ "success": true }
```

**Errors:**
- `400` — Invalid password format (min 6 chars)
- `401` — Current password incorrect

---

### Get Subscription

```
GET https://lawyerspot.in/api/lawyer/subscription
```

**Response:**
```json
{
  "planId": "basic",
  "plan": {
    "id": "basic",
    "name": "Basic",
    "priceMonthly": 0,
    "currency": "INR",
    "description": "...",
    "features": ["..."],
    "highlight": false,
    "sortOrder": 0,
    "active": true
  },
  "expiresAt": "2024-03-15T00:00:00Z",
  "status": "active",
  "availablePlans": [
    { /* plan objects */ }
  ]
}
```

`status` values: `"active"`, `"expiring_soon"` (within 7 days), `"expired"`

---

### Renew Subscription

```
POST https://lawyerspot.in/api/lawyer/subscription/renew
```

**Request Body (optional):**
```json
{
  "planId": "premium"
}
```

Renews for 30 days from current expiry.

**Response:**
```json
{
  "success": true,
  "planId": "premium",
  "expiresAt": "2024-04-15T00:00:00Z",
  "status": "active",
  "message": "Subscription renewed for 30 days."
}
```

---

## 6. Lawyer Articles (CRUD)

All endpoints require **lawyer role** authentication. Lawyers manage only their own articles.

### List Articles

```
GET https://lawyerspot.in/api/lawyer/articles
```

**Response:**
```json
{
  "articles": [
    {
      "slug": "my-article",
      "title": "Article Title",
      "excerpt": "...",
      "category": "Legal News",
      "author": "Adv. Priya Sharma",
      "date": "2024-01-15",
      "readTime": "5 min read",
      "image": "https://...",
      "trending": false,
      "status": "published",
      "content": "Full content...",
      "lawyerId": "lawyer-123"
    }
  ]
}
```

---

### Get Single Article

```
GET https://lawyerspot.in/api/lawyer/articles/:slug
```

```json
{ "article": { /* article object */ } }
```

---

### Create Article

```
POST https://lawyerspot.in/api/lawyer/articles
```

**Request Body:**
```json
{
  "title": "Article Title",
  "excerpt": "Short summary...",
  "category": "Legal News",
  "content": "Full article content...",
  "image": "https://...",
  "status": "published"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | Max 512 chars |
| `excerpt` | string | Yes | Max 2000 chars |
| `category` | string | Yes | Max 128 chars |
| `content` | string | No | Max 50000 chars, read time auto-calculated |
| `image` | string | No | Default provided |
| `status` | string | No | `"published"` (default) or `"draft"` |
| `slug` | string | No | Auto-generated if not provided |

**Response:**
```json
{
  "success": true,
  "article": { /* created article object */ }
}
```

---

### Update Article

```
PATCH https://lawyerspot.in/api/lawyer/articles/:slug
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "excerpt": "Updated excerpt...",
  "category": "Updated Category",
  "content": "Updated content...",
  "image": "https://new-image.com",
  "status": "draft"
}
```

```json
{
  "success": true,
  "article": { /* updated article object */ }
}
```

---

### Delete Article

```
DELETE https://lawyerspot.in/api/lawyer/articles/:slug
```

```json
{ "success": true }
```

---

## 7. Lawyer Q&A (CRUD)

All endpoints require **lawyer role** authentication.

### List All Questions

```
GET https://lawyerspot.in/api/lawyer/qa/questions
```

Returns all published questions with an `answeredByMe` flag.

**Response:**
```json
{
  "questions": [
    {
      "id": "qa-1",
      "slug": "how-to-file-divorce",
      "title": "How to file for divorce?",
      "excerpt": "...",
      "category": "Family Law",
      "answers": 5,
      "views": 120,
      "status": "published",
      "answeredByMe": true
    }
  ]
}
```

---

### List Lawyer's Answers

```
GET https://lawyerspot.in/api/lawyer/qa/answers
```

**Response:**
```json
{
  "answers": [
    {
      "id": "ans-1",
      "qaPostId": "qa-1",
      "lawyerId": "lawyer-123",
      "lawyerName": "Adv. Priya Sharma",
      "body": "To file for divorce...",
      "status": "published",
      "createdAt": "2024-01-15T12:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z",
      "questionTitle": "How to file for divorce?",
      "questionSlug": "how-to-file-divorce",
      "questionCategory": "Family Law"
    }
  ]
}
```

---

### Get Question Detail

```
GET https://lawyerspot.in/api/lawyer/qa/questions/:id
```

Returns the question and the lawyer's existing answer (if any).

**Response:**
```json
{
  "question": {
    "id": "qa-1",
    "slug": "how-to-file-divorce",
    "title": "How to file for divorce?",
    "excerpt": "...",
    "category": "Family Law",
    "answers": 5,
    "views": 120,
    "status": "published",
    "content": "..."
  },
  "myAnswer": {
    "id": "ans-1",
    "qaPostId": "qa-1",
    "lawyerId": "lawyer-123",
    "lawyerName": "Adv. Priya Sharma",
    "body": "To file for divorce...",
    "status": "published",
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

---

### Submit / Update Answer

```
POST https://lawyerspot.in/api/lawyer/qa/questions/:id/answers
```

If the lawyer already has an answer for this question, it is **updated**. Otherwise, a new answer is created.

**Request Body:**
```json
{
  "body": "To file for divorce in India, you need to..."
}
```

**Response:**
```json
{
  "success": true,
  "answer": {
    "id": "ans-1",
    "qaPostId": "qa-1",
    "lawyerId": "lawyer-123",
    "lawyerName": "Adv. Priya Sharma",
    "body": "To file for divorce in India, you need to...",
    "status": "published",
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:05:00Z"
  }
}
```

---

### Delete Answer

```
DELETE https://lawyerspot.in/api/lawyer/qa/answers/:id
```

```json
{ "success": true }
```

---

## 8. Lawyer Messaging

All messaging endpoints require **lawyer role** authentication.

### List Conversations

```
GET https://lawyerspot.in/api/lawyer/conversations
```

**Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "userId": "user-123",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "lastMessage": "Thank you for the advice!",
      "lastMessageAt": "2024-01-15T12:00:00Z",
      "unreadCount": 0
    }
  ]
}
```

---

### Get Messages

```
GET https://lawyerspot.in/api/lawyer/conversations/:id/messages
```

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "senderId": "user-123",
      "senderType": "user",
      "text": "Hello, I need legal advice.",
      "createdAt": "2024-01-15T12:00:00Z",
      "isRead": true
    }
  ]
}
```

---

### Send Message

```
POST https://lawyerspot.in/api/lawyer/conversations/:id/messages
```

**Request Body:**
```json
{
  "text": "Hello! I can help you with that."
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": 2,
    "senderId": "lawyer-user-123",
    "senderType": "lawyer",
    "text": "Hello! I can help you with that.",
    "createdAt": "2024-01-15T12:05:00Z",
    "isRead": false
  }
}
```

---

### Mark Conversation as Read

```
POST https://lawyerspot.in/api/lawyer/conversations/:id/read
```

Marks all unread messages from the user as read.

```json
{ "success": true }
```

---

## 9. CMS Data & Site Content

The `siteContent` field in `GET https://lawyerspot.in/api/cms` contains all static/site-wide content.

### siteContent Structure

```json
{
  "siteContent": {
    "hero": {
      "title": "Find the Best Lawyers in India",
      "subtitle": "Connect with verified advocates...",
      "badges": ["500+ Lawyers", "100+ Cities"]
    },
    "courts": [
      {
        "slug": "supreme-court-of-india",
        "name": "Supreme Court of India",
        "city": "New Delhi",
        "body": "Description of the court...",
        "metaTitle": "Supreme Court Lawyers",
        "metaDescription": "Find lawyers at the Supreme Court..."
      }
    ],
    "acts": [
      {
        "slug": "indian-penal-code",
        "title": "Indian Penal Code",
        "act": "IPC, 1860",
        "body": "Description of the act..."
      }
    ],
    "legalGuides": [
      {
        "slug": "guide-slug",
        "title": "Guide Title",
        "category": "Family Law"
      }
    ],
    "ipcSections": [
      {
        "slug": "ipc-section-302",
        "title": "Punishment for murder",
        "code": "Section 302",
        "body": "Explanation of the section..."
      }
    ],
    "bnsSections": [
      {
        "slug": "bns-section-100",
        "title": "Murder",
        "code": "Section 100",
        "body": "Explanation of the section..."
      }
    ],
    "qaCategories": [
      { "slug": "family-law", "name": "Family Law", "count": 25 }
    ],
    "popularSearches": [
      { "label": "Divorce Lawyer in Mumbai", "href": "/lawyers?q=divorce&city=mumbai" }
    ],
    "about": {
      "title": "About LawyerSpot",
      "body": "HTML content...",
      "metaTitle": "About LawyerSpot",
      "metaDescription": "..."
    },
    "termsPage": {
      "title": "Terms of Use",
      "body": "HTML content...",
      "lastUpdated": "June 2026",
      "metaTitle": "Terms of Use",
      "metaDescription": "..."
    },
    "privacyPage": {
      "title": "Privacy Policy",
      "body": "HTML content...",
      "lastUpdated": "June 2026",
      "metaTitle": "Privacy Policy",
      "metaDescription": "..."
    },
    "ipcPage": {
      "title": "IPC Sections",
      "subtitle": "Indian Penal Code...",
      "footerNote": "Also see BNS Sections...",
      "metaTitle": "IPC Sections",
      "metaDescription": "..."
    },
    "bnsPage": {
      "title": "BNS Sections",
      "subtitle": "Bharatiya Nyaya Sanhita...",
      "footerNote": "Legacy code: IPC Sections...",
      "metaTitle": "BNS Sections",
      "metaDescription": "..."
    },
    "courtsPage": {
      "title": "Courts in India",
      "subtitle": "...",
      "metaTitle": "Courts in India",
      "metaDescription": "..."
    },
    "footer": {
      "brandTagline": "...",
      "sectionTitles": {
        "findByCity": "Find Lawyers by City",
        "practiceAreas": "Practice Areas",
        "courts": "Courts",
        "quickLinks": "Quick Links",
        "legalResources": "Legal Resources",
        "qaTopics": "Q&A Topics",
        "cityPractice": "City + Practice",
        "popularSearches": "Popular Searches",
        "featuredGuides": "Featured Guides"
      },
      "findByCityAll": { "label": "All Cities", "href": "/cities" },
      "courtsAll": { "label": "All Courts", "href": "/courts" },
      "courtsListLimit": 6,
      "qaTopicsLimit": 6,
      "legalResources": [
        { "label": "IPC Sections", "href": "/ipc" },
        { "label": "BNS Sections", "href": "/bns" },
        { "label": "Acts", "href": "/acts" },
        { "label": "Guides", "href": "/guides" }
      ],
      "bottomLinks": [
        { "label": "About", "href": "/about" },
        { "label": "Privacy", "href": "/privacy" },
        { "label": "Terms", "href": "/terms" }
      ],
      "cityPracticeLinks": []
    },
    "languages": [
      { "code": "en", "label": "English" },
      { "code": "hi", "label": "Hindi" }
    ],
    "utilityNav": [
      { "label": "About", "href": "/about" },
      { "label": "Privacy", "href": "/privacy" }
    ],
    "mainNav": [
      { "label": "Home", "href": "/" },
      { "label": "Lawyers", "href": "/lawyers", "mega": "lawyers" },
      { "label": "Q&A", "href": "/qa" },
      { "label": "Articles", "href": "/articles" }
    ],
    "customCmsPages": [],
    "integrations": {
      "email": { "enabled": false, "host": "", "port": 587, "secure": true, "username": "", "password": "", "fromEmail": "", "fromName": "" },
      "payment": { "enabled": false, "provider": "razorpay", "currency": "INR", "razorpayKeyId": "", "razorpayKeySecret": "", "stripePublishableKey": "", "stripeSecretKey": "", "testMode": true },
      "twilio": { "enabled": false, "accountSid": "", "authToken": "", "fromNumber": "", "messagingServiceSid": "" }
    }
  }
}
```

### Page-to-Data Mapping

| Page | Data Source | Filtering |
|------|-------------|-----------|
| Home (`/`) | `siteConfig`, `stats`, `practiceAreas`, `lawyers` (top 4), `qaPosts`, `articles` | Top-rated lawyers sorted by rating |
| Lawyers (`/lawyers`) | `lawyers`, `practiceAreas`, `cities`, `stats` | Filter by `?q=`, `?city=`, `?practice=`, `?sort=` |
| Lawyer Profile (`/lawyers/[slug]`) | `lawyers` (by slug) | Single lawyer lookup |
| Articles (`/articles`) | `articles` | Only `status: "published"` |
| Article Detail (`/articles/[slug]`) | `articles` (by slug) | Single article lookup |
| Q&A (`/qa`) | `qaPosts`, `trendingTopics` | Only `status: "published"` |
| Q&A Detail (`/qa/[slug]`) | `qaPosts` (by slug) + `GET https://lawyerspot.in/api/qa/:slug/answers` | Single Q&A + answers |
| IPC (`/ipc`) | `siteContent.ipcSections`, `siteContent.ipcPage` | All IPC sections |
| BNS (`/bns`) | `siteContent.bnsSections`, `siteContent.bnsPage` | All BNS sections |
| Courts (`/courts`) | `siteContent.courts` | Court listing |
| Court Detail (`/court/[slug]`) | `siteContent.courts` (by slug) | Single court lookup |
| Acts (`/acts`) | `siteContent.acts` | Act listing |
| Act Detail (`/acts/[slug]`) | `siteContent.acts` (by slug) | Single act lookup |
| Guides (`/guides`) | `siteContent.legalGuides` | Guide listing |
| Search (`/search`) | All CMS data | Full-text search (see Section 11) |
| About (`/about`) | `siteContent.about` | Static page |
| Terms (`/terms`) | `siteContent.termsPage` | Static page |
| Privacy (`/privacy`) | `siteContent.privacyPage` | Static page |
| Cities (`/cities`) | `cities` | City listing |
| City Detail (`/city/[slug]`) | `cities` (by slug), `lawyers` | Lawyers in that city |
| Practice (`/practice/[slug]`) | `practiceAreas` (by slug), `lawyers` | Lawyers in that practice |

---

## 10. Lawyer Search & Filtering

The web platform filters lawyers **client-side** from CMS data. The mobile app should do the same after fetching `GET https://lawyerspot.in/api/cms`.

### Filter Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Free-text search across name, location, practice, firm, bio, specializations |
| `city` | string | City slug (e.g. `mumbai`, `delhi`) |
| `practice` | string | Practice area slug (e.g. `divorce`, `family-law`) |
| `sort` | string | Sort order: `rating` (default), `experience`, `fee` |

### Filtering Logic (Pseudo-code)

```dart
List<Lawyer> filterLawyers(List<Lawyer> lawyers, {
  String? query,
  String? city,
  String? practice,
  String? sort,
}) {
  var list = List<Lawyer>.from(lawyers);

  // Filter by city
  if (city != null && city.isNotEmpty) {
    final cityLower = city.toLowerCase();
    list = list.where((l) =>
      l.citySlug == cityLower ||
      l.location.toLowerCase().contains(cityLower) ||
      l.location.toLowerCase().contains(cityLower.replaceAll('-', ' '))
    ).toList();
  }

  // Filter by practice area
  if (practice != null && practice.isNotEmpty) {
    final practiceKey = practice.toLowerCase().replaceAll('-law', '');
    list = list.where((l) =>
      l.practice.toLowerCase() == practiceKey ||
      l.practice.toLowerCase().contains(practiceKey) ||
      (l.specialization ?? []).any((s) => s.toLowerCase().contains(practiceKey))
    ).toList();
  }

  // Free-text search
  if (query != null && query.isNotEmpty) {
    final q = query.toLowerCase();
    list = list.where((l) {
      final haystack = [
        l.name, l.location, l.practice, l.firm ?? '',
        l.bio ?? '', ...(l.specialization ?? []),
      ].join(' ').toLowerCase();
      return haystack.contains(q);
    }).toList();
  }

  // Sort
  switch (sort) {
    case 'experience':
      list.sort((a, b) => b.experience.compareTo(a.experience));
      break;
    case 'fee':
      list.sort((a, b) => (a.fee ?? 999999).compareTo(b.fee ?? 999999));
      break;
    default: // rating
      list.sort((a, b) {
        final cmp = b.rating.compareTo(a.rating);
        return cmp != 0 ? cmp : b.reviews.compareTo(a.reviews);
      });
  }

  return list;
}
```

### Priority Boost

Lawyers with higher subscription plans (`professional`, `premium`) get a priority boost in search results — they appear above lower-tier lawyers when sorted by rating.

---

## 11. Site Search

Full-text search across all CMS content. Client-side after fetching `GET https://lawyerspot.in/api/cms`.

### Search Logic (Pseudo-code)

```dart
List<SearchResult> searchSite(CmsData cms, String query, {int limit = 40}) {
  final q = query.toLowerCase().trim();
  if (q.isEmpty) return [];
  final results = <SearchResult>[];

  void push(SearchResult r) {
    if (results.length < limit) results.add(r);
  }

  // Search lawyers
  for (final l in cms.lawyers) {
    final hay = [l.name, l.location, l.practice, l.firm ?? '',
        l.bio ?? '', ...l.specialization].join(' ').toLowerCase();
    if (hay.contains(q)) {
      push(SearchResult(type: 'lawyer', title: l.name,
          excerpt: '${l.practice} · ${l.location}', href: '/lawyers/${l.slug}'));
    }
  }

  // Search articles
  for (final a in cms.articles.where((x) => x.status != 'draft')) {
    final hay = [a.title, a.excerpt, a.category, a.content ?? ''].join(' ').toLowerCase();
    if (hay.contains(q)) {
      push(SearchResult(type: 'article', title: a.title,
          excerpt: a.excerpt, href: '/articles/${a.slug}'));
    }
  }

  // Search Q&A posts
  for (final p in cms.qaPosts.where((x) => x.status != 'draft')) {
    final hay = [p.title, p.excerpt, p.category, p.content ?? ''].join(' ').toLowerCase();
    if (hay.contains(q)) {
      push(SearchResult(type: 'qa', title: p.title,
          excerpt: p.excerpt, href: '/qa/${p.slug}'));
    }
  }

  // Search acts
  for (final a in cms.siteContent.acts) {
    if ([a.title, a.act, a.body ?? ''].join(' ').toLowerCase().contains(q)) {
      push(SearchResult(type: 'act', title: a.title,
          excerpt: a.act, href: '/acts/${a.slug}'));
    }
  }

  // Search courts
  for (final c in cms.siteContent.courts) {
    if ([c.name, c.city, c.body ?? ''].join(' ').toLowerCase().contains(q)) {
      push(SearchResult(type: 'court', title: c.name,
          excerpt: c.city, href: '/court/${c.slug}'));
    }
  }

  // Search guides
  for (final g in cms.siteContent.legalGuides) {
    if ([g.title, g.category].join(' ').toLowerCase().contains(q)) {
      push(SearchResult(type: 'guide', title: g.title,
          excerpt: g.category, href: '/articles/${g.slug}'));
    }
  }

  return results;
}
```

### Search Result Types

| Type | Description | URL Pattern |
|------|-------------|-------------|
| `lawyer` | Lawyer profile | `/lawyers/[slug]` |
| `article` | Legal article | `/articles/[slug]` |
| `qa` | Q&A post | `/qa/[slug]` |
| `act` | Legal act | `/acts/[slug]` |
| `court` | Court listing | `/court/[slug]` |
| `guide` | Legal guide | `/articles/[slug]` |

---

## 12. Data Models

### Lawyer Object

```json
{
  "id": "lawyer-123",
  "slug": "adv-priya-sharma",
  "name": "Adv. Priya Sharma",
  "image": "https://...",
  "rating": 4.5,
  "reviews": 12,
  "experience": 10,
  "fee": 2000,
  "currency": "INR",
  "location": "Mumbai",
  "address": "456 Law Lane, Mumbai",
  "practice": "Divorce",
  "citySlug": "mumbai",
  "specialization": ["Divorce", "Family Law"],
  "online": true,
  "verified": true,
  "phone": "+919876543210",
  "languages": ["English", "Hindi"],
  "firm": "Sharma Law Associates",
  "bio": "...",
  "education": [
    { "degree": "LLB", "institution": "...", "year": "2015" }
  ],
  "timeline": [
    { "year": "2020", "title": "...", "org": "..." }
  ],
  "practiceGroups": [
    { "title": "...", "areas": ["Family Law"] }
  ],
  "courts": ["Supreme Court of India"],
  "awards": [
    { "title": "...", "year": "2023" }
  ],
  "clientReviews": [
    {
      "author": "Client A",
      "rating": 5.0,
      "text": "Excellent lawyer...",
      "date": "2024-01-15",
      "verified": true,
      "avatar": "https://..."
    }
  ],
  "profileFaq": [
    { "id": "faq-1", "question": "...", "answer": "..." }
  ],
  "email": "priya@example.com",
  "emailVerified": true,
  "phoneVerified": true,
  "subscriptionPlanId": "basic",
  "subscriptionExpiresAt": null,
  "topRated": false
}
```

### Article Object

```json
{
  "slug": "article-slug",
  "title": "Article Title",
  "excerpt": "...",
  "category": "Legal News",
  "author": "Adv. Priya Sharma",
  "date": "2024-01-15",
  "readTime": "5 min read",
  "image": "https://...",
  "trending": true,
  "status": "published",
  "content": "Full content...",
  "lawyerId": "lawyer-123"
}
```

### Q&A Post Object

```json
{
  "id": "qa-1",
  "title": "How to file for divorce?",
  "excerpt": "...",
  "category": "Family Law",
  "answers": 5,
  "views": 120,
  "slug": "how-to-file-for-divorce",
  "status": "published",
  "content": "Full content..."
}
```

### Subscription Plan

```json
{
  "id": "basic",
  "name": "Basic",
  "priceMonthly": 0,
  "currency": "INR",
  "description": "Basic plan for new lawyers",
  "features": ["Profile listing", "Up to 10 bookings/month"],
  "highlight": false,
  "sortOrder": 0,
  "active": true
}
```

### Legal Section

```json
{
  "id": 1,
  "type": "ipc",
  "sectionNumber": "Section 302",
  "title": "Punishment for murder",
  "slug": "ipc-section-302",
  "body": "Whoever commits murder shall be punished...",
  "punishment": "Death, or imprisonment for life...",
  "category": "Offences Against the Human Body",
  "status": "active",
  "displayOrder": 302
}
```

### Court Entry

```json
{
  "slug": "supreme-court-of-india",
  "name": "Supreme Court of India",
  "city": "New Delhi",
  "body": "Description of the court...",
  "metaTitle": "Supreme Court Lawyers",
  "metaDescription": "..."
}
```

### Act Entry

```json
{
  "slug": "indian-penal-code",
  "title": "Indian Penal Code",
  "act": "IPC, 1860",
  "body": "Description of the act..."
}
```

---

## Quick Reference — All Endpoints

### Public (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `https://lawyerspot.in/health` | Health check |
| `GET` | `https://lawyerspot.in/api/cms` | All CMS data (lawyers, articles, Q&A, site content) |
| `GET` | `https://lawyerspot.in/api/qa/:slug/answers` | Q&A post with all answers |
| `GET` | `https://lawyerspot.in/api/sections?type=ipc\|bns` | IPC/BNS legal sections |
| `GET` | `https://lawyerspot.in/api/sections/:slug` | Single legal section |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `https://lawyerspot.in/api/auth/signup` | Client signup |
| `POST` | `https://lawyerspot.in/api/auth/lawyer-signup` | Lawyer signup |
| `POST` | `https://lawyerspot.in/api/auth/login` | Login (client/lawyer) |
| `POST` | `https://lawyerspot.in/api/auth/logout` | Logout |
| `GET` | `https://lawyerspot.in/api/auth/me` | Current user info |

### Lawyer (Lawyer Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `https://lawyerspot.in/api/lawyer/profile` | Get lawyer profile |
| `PATCH` | `https://lawyerspot.in/api/lawyer/profile` | Update lawyer profile |
| `POST` | `https://lawyerspot.in/api/lawyer/change-password` | Change password |
| `GET` | `https://lawyerspot.in/api/lawyer/subscription` | Get subscription info |
| `POST` | `https://lawyerspot.in/api/lawyer/subscription/renew` | Renew subscription |
| `GET` | `https://lawyerspot.in/api/lawyer/articles` | List my articles |
| `GET` | `https://lawyerspot.in/api/lawyer/articles/:slug` | Get article |
| `POST` | `https://lawyerspot.in/api/lawyer/articles` | Create article |
| `PATCH` | `https://lawyerspot.in/api/lawyer/articles/:slug` | Update article |
| `DELETE` | `https://lawyerspot.in/api/lawyer/articles/:slug` | Delete article |
| `GET` | `https://lawyerspot.in/api/lawyer/qa/questions` | List all questions |
| `GET` | `https://lawyerspot.in/api/lawyer/qa/answers` | List my answers |
| `GET` | `https://lawyerspot.in/api/lawyer/qa/questions/:id` | Get question + my answer |
| `POST` | `https://lawyerspot.in/api/lawyer/qa/questions/:id/answers` | Submit/update answer |
| `DELETE` | `https://lawyerspot.in/api/lawyer/qa/answers/:id` | Delete answer |
| `GET` | `https://lawyerspot.in/api/lawyer/conversations` | List conversations |
| `GET` | `https://lawyerspot.in/api/lawyer/conversations/:id/messages` | Get messages |
| `POST` | `https://lawyerspot.in/api/lawyer/conversations/:id/messages` | Send message |
| `POST` | `https://lawyerspot.in/api/lawyer/conversations/:id/read` | Mark messages read |

---

## Flutter App Data Flow

### Recommended Architecture

```
1. App Launch / Pull-to-Refresh
   └── GET https://lawyerspot.in/api/cms → Cache full CMS data locally

2. Home Screen
   └── siteConfig → App title/description
   └── stats → Stats bar
   └── practiceAreas → Practice grid
   └── lawyers (top 4 by rating) → Top lawyers carousel
   └── qaPosts → Latest Q&A feed
   └── articles → Latest articles grid

3. Lawyer Directory
   └── lawyers → Full list
   └── practiceAreas → Filter dropdown
   └── cities → Filter dropdown
   └── Filter client-side (Section 10)

4. Lawyer Profile
   └── lawyers[slug] → Full profile
   └── defaultProfileReviews → Fallback reviews

5. Articles / Q&A
   └── articles → Article list
   └── qaPosts → Q&A list
   └── trendingTopics → Trending pills
   └── GET https://lawyerspot.in/api/qa/:slug/answers → Q&A detail + answers

6. IPC / BNS / Courts / Acts
   └── siteContent.ipcSections → IPC list
   └── siteContent.bnsSections → BNS list
   └── siteContent.courts → Courts list
   └── siteContent.acts → Acts list
   └── siteContent.legalGuides → Guides list

7. Search
   └── All CMS data → Client-side full-text search (Section 11)

8. Lawyer Auth
   └── POST https://lawyerspot.in/api/auth/lawyer-signup → Register
   └── POST https://lawyerspot.in/api/auth/login → Store session cookie
   └── GET https://lawyerspot.in/api/auth/me → Validate session

9. Lawyer Dashboard
   └── GET https://lawyerspot.in/api/lawyer/profile → My profile
   └── GET https://lawyerspot.in/api/lawyer/articles → My articles
   └── GET https://lawyerspot.in/api/lawyer/qa/questions → Q&A questions
   └── GET https://lawyerspot.in/api/lawyer/qa/answers → My answers
   └── GET https://lawyerspot.in/api/lawyer/subscription → Subscription
   └── GET https://lawyerspot.in/api/lawyer/conversations → Client messages
```

### Caching Strategy

| Data | Cache Duration | Refresh Trigger |
|------|---------------|-----------------|
| CMS Data (`https://lawyerspot.in/api/cms`) | 60 seconds (server) + local cache | Pull-to-refresh, app resume |
| Lawyer Profile | Session lifetime | On profile update |
| Articles | 30 seconds | On create/update/delete |
| Q&A | 30 seconds | On answer submit/delete |
| Conversations | 30 seconds | On new message |
