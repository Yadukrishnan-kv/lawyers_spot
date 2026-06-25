# Lawyers Spot — Mobile App API Integration Guide

> **Version:** 1.0  
> **Backend:** Express.js (Node.js)  
> **Database:** PostgreSQL (shared with web app)  
> **Auth:** Cookie-based HMAC-signed sessions (forwarded via `Cookie` header)  
> **Note:** This API does **not** expose admin endpoints. The mobile app serves clients and lawyers only.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication](#2-authentication)
3. [Public APIs (No Auth)](#3-public-apis-no-auth)
4. [Auth APIs](#4-auth-apis)
5. [Bookings API](#5-bookings-api)
6. [User Dashboard APIs (Auth Required)](#6-user-dashboard-apis-auth-required)
7. [Lawyer APIs (Auth Required, role=lawyer)](#7-lawyer-apis-auth-required-rolelawyer)

---

## 1. Architecture Overview

```
Flutter App  ──►  Backend (Express on :4000)  ──►  PostgreSQL
                        │
                        └── Also proxied through Next.js at :3000/api/*
```

**Two ways to reach the API:**

| Method | Base URL | Use Case |
|--------|----------|----------|
| Direct | `http://<host>:4000/api/v1` | Mobile app calls Express directly |
| Via Web | `https://<domain>/api` | If app goes through Next.js proxy |

This document uses the **direct Express path** (`/api/v1/...`).

---

## 2. Authentication

### How it Works

1. **Signup/Login** — Server sets an `httpOnly` cookie named `lawyerspot_user_session` containing a signed HMAC token.
2. **Authenticated requests** — The Flutter app must send this cookie with every authenticated request in the `Cookie` header.
3. **Session expiry** — Configurable (default 7 days). Token is verified server-side.

### Header Format for Authenticated Requests

```
Cookie: lawyerspot_user_session=<token_value>
```

You must store the cookie value after login/signup and include it in all subsequent requests.

---

## 3. Public APIs (No Auth)

### 3.1 Get Public CMS Data

Fetches all public site data: lawyers, articles, Q&A posts, cities, practice areas, etc.

```
GET /api/v1/cms
```

**Response** `200 OK`

```json
{
  "siteConfig": {
    "name": "Lawyers Spot",
    "tagline": "Find the best lawyers in India",
    "url": "https://lawyerspot.com",
    "description": "..."
  },
  "stats": [{ "label": "Lawyers", "value": "500+" }],
  "practiceAreas": [{ "slug": "criminal", "name": "Criminal Law", "icon": "scale", "lawyers": 120 }],
  "states": [{ "slug": "kerala", "name": "Kerala", "code": "KL", "active": true }],
  "cities": [{ "slug": "kochi", "name": "Kochi", "state": "Kerala" }],
  "subscriptionPlans": [{ "id": "basic", "name": "Basic", "priceMonthly": 999, ... }],
  "lawyers": [{ "id": "...", "slug": "...", "name": "Adv. Priya Sharma", "image": "...", ... }],
  "qaPosts": [{ "id": "...", "title": "...", "category": "...", ... }],
  "articles": [{ "slug": "...", "title": "...", "category": "...", ... }],
  "trendingTopics": ["Divorce", "Property Dispute"],
  "defaultProfileReviews": [{ "author": "...", "rating": 5, "text": "...", ... }],
  "updatedAt": "2026-06-23T10:00:00.000Z"
}
```

### 3.2 Get Q&A Answers

```
GET /api/v1/qa/:slug/answers
```

**Response** `200 OK`

```json
{
  "question": { "id": "...", "slug": "...", "title": "...", "excerpt": "...", "category": "...", "content": "..." },
  "answers": [
    { "id": "...", "lawyerId": "...", "lawyerName": "Adv. X", "body": "...", "createdAt": "..." }
  ]
}
```

### 3.3 List Legal Sections (IPC/BNS)

```
GET /api/v1/sections?type=ipc
GET /api/v1/sections?type=bns
```

**Query Params:** `type` — `"ipc"` or `"bns"` (required)

**Response** `200 OK`

```json
[
  {
    "id": 1,
    "type": "ipc",
    "sectionNumber": "302",
    "title": "Punishment for murder",
    "slug": "ipc-302",
    "body": "...",
    "punishment": "Death or imprisonment for life",
    "category": "Offences affecting life",
    "displayOrder": 100,
    "createdAt": "..."
  }
]
```

### 3.4 Get Single Section

```
GET /api/v1/sections/:slug
```

**Response** `200 OK` — Same shape as above.

---

## 4. Auth APIs

### 4.1 Signup (Client)

```
POST /api/v1/auth/signup
```

**Request**

```json
{
  "name": "Yadu Krishnan",
  "email": "yadhumanoj123@gmail.com",
  "password": "123456"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "role": "client",
  "userId": "user-1719123456789"
}
```

**Note:** Sets `lawyerspot_user_session` cookie. Password min 6 chars.

### 4.2 Signup (Lawyer)

```
POST /api/v1/auth/lawyer-signup
```

**Request**

```json
{
  "name": "Adv. Priya Sharma",
  "email": "priya@example.com",
  "password": "lawyer123",
  "phone": "9876543210",
  "practice": "Criminal Law",
  "barId": "DEL/1234/2015",
  "citySlug": "delhi"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "role": "lawyer",
  "userId": "lawyer-user-...",
  "lawyerId": "lawyer-..."
}
```

### 4.3 Login

```
POST /api/v1/auth/login
```

**Request**

```json
{
  "email": "yadhumanoj123@gmail.com",
  "password": "123456",
  "role": "client"
}
```

`role` is optional — can be `"client"` or `"lawyer"`. When provided, server validates the account role matches.

**Response** `200 OK`

```json
{
  "success": true,
  "role": "client",
  "userId": "user-...",
  "name": "Yadu Krishnan"
}
```

For lawyers, also returns:

```json
{
  "success": true,
  "role": "lawyer",
  "userId": "lawyer-user-...",
  "lawyerId": "lawyer-...",
  "name": "Adv. Priya Sharma"
}
```

### 4.4 Logout

```
POST /api/v1/auth/logout
```

**Response** `200 OK`

```json
{ "success": true }
```

### 4.5 Get Current User

```
GET /api/v1/auth/me
```

**Auth:** Cookie required

**Response** `200 OK`

```json
{
  "id": "user-...",
  "email": "yadhumanoj123@gmail.com",
  "name": "Yadu Krishnan",
  "role": "client",
  "lawyerId": null
}
```

For lawyers, `lawyerId` contains the lawyer's CMS ID.

---

## 5. Bookings API

### 5.1 Create Booking

```
POST /api/v1/bookings
```

**Auth:** Optional — if cookie is present, booking is linked to user and a notification is created.

**Request**

```json
{
  "lawyerId": "lawyer-...",
  "lawyerName": "Adv. Priya Sharma",
  "clientName": "Yadu Krishnan",
  "clientEmail": "yadhumanoj123@gmail.com",
  "date": "2026-07-10",
  "time": "11:30 AM",
  "type": "Video Call (30 min)"
}
```

**Types:** `"Video Call (30 min)"`, `"Phone Call (30 min)"`, `"In-Person (60 min)"`

**Response** `200 OK`

```json
{
  "success": true,
  "booking": {
    "id": "b-1719123456789",
    "status": "pending"
  }
}
```

**Errors:**

| Code | Detail |
|------|--------|
| 400 | Invalid booking fields |
| 404 | Lawyer not found |
| 403 | Monthly booking limit reached |

---

## 6. User Dashboard APIs (Auth Required)

All endpoints in this section require the `lawyerspot_user_session` cookie.

### 6.1 Get Profile

```
GET /api/v1/user/profile
```

**Response** `200 OK`

```json
{
  "id": "user-...",
  "email": "yadhumanoj123@gmail.com",
  "name": "Yadu Krishnan",
  "role": "client",
  "phone": "9876543210",
  "profileImage": null,
  "address": "123, Main Street, Kochi"
}
```

### 6.2 Update Profile

```
PATCH /api/v1/user/profile
```

**Request**

```json
{
  "name": "Yadu Krishnan KV",
  "phone": "9876543210",
  "address": "456, New Address, Kerala"
}
```

All fields optional — send only what you want to change.

**Response** `200 OK`

```json
{
  "success": true,
  "profile": { "id": "...", "name": "...", "phone": "...", "address": "...", ... }
}
```

### 6.3 Get User Bookings

```
GET /api/v1/user/bookings
```

Returns bookings linked to the authenticated user's ID.

**Response** `200 OK`

```json
{
  "bookings": [
    {
      "id": "b-...",
      "lawyerId": "lawyer-...",
      "lawyerName": "Adv. Priya Sharma",
      "lawyerImage": "https://...",
      "clientName": "Yadu Krishnan",
      "clientEmail": "yadhumanoj123@gmail.com",
      "date": "2026-07-10",
      "time": "11:30 AM",
      "type": "Video Call (30 min)",
      "status": "pending"
    }
  ]
}
```

**Statuses:** `"pending"`, `"confirmed"`, `"completed"`, `"cancelled"`

### 6.4 Save a Lawyer

```
POST /api/v1/user/saved-lawyers
```

**Request**

```json
{
  "lawyerId": "lawyer-..."
}
```

**Response** `200 OK`

```json
{ "success": true, "saved": true }
```

Idempotent — saving an already-saved lawyer returns success.

### 6.5 Remove Saved Lawyer

```
DELETE /api/v1/user/saved-lawyers/:lawyerId
```

**Response** `200 OK`

```json
{ "success": true, "saved": false }
```

### 6.6 List Saved Lawyers (Full)

```
GET /api/v1/user/saved-lawyers
```

Returns full lawyer objects for saved entries.

**Response** `200 OK`

```json
{
  "savedLawyers": [
    {
      "id": "lawyer-...",
      "slug": "adv-priya-sharma",
      "name": "Adv. Priya Sharma",
      "image": "https://...",
      "rating": 4.5,
      "reviews": 120,
      "experience": 12,
      "fee": 2000,
      "currency": "INR",
      "location": "Delhi",
      "practice": "Criminal Law",
      "citySlug": "delhi",
      "specialization": ["Criminal Law", "Bail"],
      "online": true,
      "verified": true,
      "savedAt": "2026-06-23T10:00:00.000Z"
    }
  ]
}
```

### 6.7 Get Saved Lawyer IDs Only

Useful for showing red/hearted state on lawyer cards.

```
GET /api/v1/user/saved-lawyers/ids
```

**Response** `200 OK`

```json
{
  "ids": ["lawyer-1", "lawyer-2", "lawyer-3"]
}
```

### 6.8 List Notifications

```
GET /api/v1/user/notifications
```

**Response** `200 OK`

```json
{
  "notifications": [
    {
      "id": 1,
      "title": "Booking Confirmed",
      "message": "Your consultation with Adv. Priya Sharma on 2026-07-10 at 11:30 AM has been booked successfully.",
      "type": "booking_confirmed",
      "read": false,
      "createdAt": "2026-06-23T10:00:00.000Z"
    }
  ]
}
```

**Types:** `"booking_confirmed"`, `"booking_cancelled"`, `"lawyer_accepted"`, `"lawyer_rejected"`, `"system"`, `"info"`

### 6.9 Mark Notification as Read

```
PATCH /api/v1/user/notifications/:id/read
```

**Response** `200 OK`

```json
{ "success": true }
```

### 6.10 Mark All Notifications as Read

```
PATCH /api/v1/user/notifications/read-all
```

**Response** `200 OK`

```json
{ "success": true }
```

### 6.11 List Conversations

```
GET /api/v1/user/conversations
```

**Response** `200 OK`

```json
{
  "conversations": [
    {
      "id": 1,
      "lawyerId": "lawyer-...",
      "lawyerName": "Adv. Priya Sharma",
      "lawyerImage": "https://...",
      "lawyerPractice": "Criminal Law",
      "lastMessage": "Sure, I'll see you then.",
      "lastMessageAt": "2026-06-23T10:30:00.000Z"
    }
  ]
}
```

### 6.12 Start a Conversation

```
POST /api/v1/user/conversations
```

**Request**

```json
{
  "lawyerId": "lawyer-...",
  "initialMessage": "Hello, I'd like to discuss my case."
}
```

`initialMessage` is optional.

**Response** `200 OK`

```json
{
  "conversationId": 1,
  "existing": false
}
```

If a conversation already exists with this lawyer, returns `existing: true` with the existing conversation ID.

### 6.13 Get Messages in a Conversation

```
GET /api/v1/user/conversations/:id/messages
```

**Response** `200 OK`

```json
{
  "messages": [
    {
      "id": 1,
      "senderId": "user-...",
      "senderType": "user",
      "text": "Hello, I'd like to discuss my case.",
      "createdAt": "2026-06-23T10:00:00.000Z"
    },
    {
      "id": 2,
      "senderId": "lawyer-user-...",
      "senderType": "lawyer",
      "text": "Sure, tell me more about it.",
      "createdAt": "2026-06-23T10:05:00.000Z"
    }
  ]
}
```

`senderType`: `"user"` = current user, `"lawyer"` = lawyer.

### 6.14 Send a Message

```
POST /api/v1/user/conversations/:id/messages
```

**Request**

```json
{
  "text": "Thank you for your response."
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": {
    "id": 3,
    "senderId": "user-...",
    "senderType": "user",
    "text": "Thank you for your response.",
    "createdAt": "2026-06-23T10:10:00.000Z"
  }
}
```

### 6.15 List Documents

```
GET /api/v1/user/documents
```

**Response** `200 OK`

```json
{
  "documents": [
    {
      "id": 1,
      "fileUrl": "/uploads/1719123456789-abc123.pdf",
      "fileName": "case-document.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "createdAt": "2026-06-23T10:00:00.000Z"
    }
  ]
}
```

### 6.16 Upload Document

```
POST /api/v1/user/documents
```

**Request**

```json
{
  "fileName": "case-document.pdf",
  "fileData": "<base64-encoded-file-content>",
  "mimeType": "application/pdf"
}
```

The Flutter app should read the file, convert to base64, and send it.

**Response** `201 Created`

```json
{
  "success": true,
  "document": {
    "id": 2,
    "fileUrl": "/uploads/1719123456790-def456.pdf",
    "fileName": "case-document.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "createdAt": "2026-06-23T10:05:00.000Z"
  }
}
```

### 6.17 Delete Document

```
DELETE /api/v1/user/documents/:id
```

**Response** `200 OK`

```json
{ "success": true }
```

### 6.18 Download Document

```
GET /api/v1/user/documents/:id/download
```

Returns the file binary with appropriate `Content-Type` and `Content-Disposition` headers.

---

## 7. Lawyer APIs (Auth Required, role=lawyer)

These endpoints require authentication AND the user must have `role` = `"lawyer"`. They use the same `lawyerspot_user_session` cookie.

### 7.1 Get Lawyer Profile

```
GET /api/v1/lawyer/profile
```

**Response** `200 OK`

```json
{
  "lawyer": {
    "id": "lawyer-...",
    "slug": "adv-priya-sharma",
    "name": "Adv. Priya Sharma",
    "image": "https://...",
    "rating": 4.5,
    "reviews": 120,
    "experience": 12,
    "fee": 2000,
    "currency": "INR",
    "location": "Delhi",
    "address": "123, Court Road, Delhi",
    "practice": "Criminal Law",
    "citySlug": "delhi",
    "specialization": ["Criminal Law", "Bail"],
    "online": true,
    "verified": false,
    "email": "priya@example.com",
    "emailVerified": false,
    "phone": "9876543210",
    "phoneVerified": false,
    "languages": ["Hindi", "English"],
    "firm": "Sharma & Associates",
    "bio": "Experienced criminal lawyer...",
    "subscriptionPlanId": "basic",
    "subscriptionExpiresAt": null,
    "topRated": false
  },
  "user": {
    "id": "lawyer-user-...",
    "name": "Adv. Priya Sharma",
    "email": "priya@example.com"
  }
}
```

### 7.2 Update Lawyer Profile

```
PATCH /api/v1/lawyer/profile
```

**Request** (all fields optional)

```json
{
  "name": "Adv. Priya S.",
  "phone": "9876543210",
  "email": "priya@example.com",
  "bio": "Updated bio...",
  "firm": "Sharma Law Office",
  "address": "456, New Office, Delhi",
  "fee": 2500,
  "online": true,
  "practice": "Criminal Law",
  "citySlug": "delhi",
  "languages": ["Hindi", "English", "Punjabi"],
  "specialization": ["Criminal Law", "Bail", "Divorce"]
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "lawyer": { "id": "...", "name": "Adv. Priya S.", ... }
}
```

### 7.3 Change Password

```
POST /api/v1/lawyer/change-password
```

**Request**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response** `200 OK`

```json
{ "success": true }
```

### 7.4 Get Lawyer Articles

```
GET /api/v1/lawyer/articles
```

**Response** `200 OK`

```json
{
  "articles": [
    {
      "slug": "understanding-bail",
      "title": "Understanding Bail Process",
      "excerpt": "A comprehensive guide...",
      "category": "Criminal Law",
      "author": "Adv. Priya Sharma",
      "date": "2026-06-01",
      "readTime": "5 min",
      "image": "https://...",
      "trending": false,
      "status": "published",
      "content": "Full article content...",
      "lawyerId": "lawyer-..."
    }
  ]
}
```

### 7.5 Get Single Article

```
GET /api/v1/lawyer/articles/:slug
```

**Response** `200 OK` — Same shape as above, wrapped in `{ "article": { ... } }`.

### 7.6 Create Article

```
POST /api/v1/lawyer/articles
```

**Request**

```json
{
  "title": "Understanding Bail",
  "excerpt": "Short description...",
  "category": "Criminal Law",
  "content": "Full article content...",
  "image": "https://...",
  "status": "published"
}
```

`status`: `"published"` or `"draft"`. `image` and `slug` are optional.

**Response** `201 Created`

```json
{ "success": true, "article": { "slug": "understanding-bail", ... } }
```

### 7.7 Update Article

```
PATCH /api/v1/lawyer/articles/:slug
```

**Request** (partial update — send only fields to change)

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published"
}
```

**Response** `200 OK`

```json
{ "success": true, "article": { ... } }
```

### 7.8 Delete Article

```
DELETE /api/v1/lawyer/articles/:slug
```

**Response** `200 OK`

```json
{ "success": true }
```

### 7.9 List Q&A Questions

```
GET /api/v1/lawyer/qa/questions
```

Returns published questions with an `answeredByMe` flag.

**Response** `200 OK`

```json
{
  "questions": [
    {
      "id": "...",
      "slug": "what-is-bail",
      "title": "What is bail?",
      "excerpt": "I want to understand...",
      "category": "Criminal Law",
      "answers": 3,
      "views": 1200,
      "status": "published",
      "answeredByMe": true
    }
  ]
}
```

### 7.10 Get Question Details + My Answer

```
GET /api/v1/lawyer/qa/questions/:id
```

**Response** `200 OK`

```json
{
  "question": { "id": "...", "slug": "...", "title": "...", "excerpt": "...", "category": "...", "content": "..." },
  "myAnswer": { "id": "...", "qaPostId": "...", "lawyerId": "...", "lawyerName": "...", "body": "...", "status": "published", "createdAt": "...", "updatedAt": "..." }
}
```

`myAnswer` is `null` if the lawyer hasn't answered.

### 7.11 Submit/Update Answer

```
POST /api/v1/lawyer/qa/questions/:id/answers
```

Creates or updates the lawyer's answer to a question.

**Request**

```json
{
  "body": "Here is my detailed answer to the question..."
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "answer": { "id": "...", "qaPostId": "...", ... }
}
```

### 7.12 Delete Answer

```
DELETE /api/v1/lawyer/qa/answers/:id
```

**Response** `200 OK`

```json
{ "success": true }
```

### 7.13 List My Answers

```
GET /api/v1/lawyer/qa/answers
```

**Response** `200 OK`

```json
{
  "answers": [
    {
      "id": "...",
      "qaPostId": "...",
      "lawyerId": "...",
      "lawyerName": "Adv. Priya Sharma",
      "body": "...",
      "status": "published",
      "createdAt": "...",
      "updatedAt": "...",
      "questionTitle": "What is bail?",
      "questionSlug": "what-is-bail",
      "questionCategory": "Criminal Law"
    }
  ]
}
```

### 7.14 Get Subscription

```
GET /api/v1/lawyer/subscription
```

**Response** `200 OK`

```json
{
  "planId": "professional",
  "plan": { "id": "professional", "name": "Professional", "priceMonthly": 2499, "currency": "INR", "features": [...], ... },
  "expiresAt": "2026-07-23T10:00:00.000Z",
  "status": "active",
  "availablePlans": [ { "id": "basic", ... }, { "id": "professional", ... }, { "id": "premium", ... } ]
}
```

**Status values:** `"active"`, `"expiring_soon"` (< 7 days), `"expired"`

### 7.15 Renew / Change Subscription

```
POST /api/v1/lawyer/subscription/renew
```

**Request**

```json
{
  "planId": "professional"
}
```

If `planId` is omitted, renews the current plan for another 30 days.

**Response** `200 OK`

```json
{
  "success": true,
  "planId": "professional",
  "expiresAt": "2026-07-23T10:00:00.000Z",
  "status": "active",
  "message": "Subscription renewed for 30 days. Payment integration can be connected in admin settings."
}
```

---

## Common Error Response Format

All endpoints return errors in the same shape:

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (articles, documents) |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid session) |
| 403 | Forbidden (wrong role or booking limit) |
| 404 | Resource not found |
| 409 | Conflict (email already exists) |
| 429 | Rate limited (too many requests) |
| 500 | Internal server error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Auth (signup, login) | 30 requests per 15 min |
| Bookings | 10 requests per 60 sec |

---

## Base URL Configuration

**Development:**
```
http://localhost:4000/api/v1
```

**Production (example):**
```
https://api.lawyerspot.com/api/v1
```

In the Flutter app, configure the base URL as an environment variable so it can switch between dev and production.
