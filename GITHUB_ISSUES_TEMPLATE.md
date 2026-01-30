# GitHub Issues Template

Copy và paste các issues dưới đây vào GitHub Issues manually, hoặc sử dụng GitHub CLI.

## Cách sử dụng với GitHub CLI:

1. Cài đặt GitHub CLI: https://cli.github.com/
2. Authenticate: `gh auth login`
3. Chạy script: `node create-github-issues.js`

## Hoặc tạo thủ công:

Mỗi issue dưới đây có format:
- **Title**: Tiêu đề issue
- **Labels**: Các labels cần gán
- **Body**: Nội dung chi tiết

---

## 🐛 BUGS & ISSUES (10 issues)

### Issue #1: Missing Error Handling in Upload Controller

**Title:** `🐛 [Backend] Missing Error Handling in Upload Controller`

**Labels:** `bug`, `security`, `backend`

**Body:**
```markdown
## Description
Upload controller thiếu validation cho file size, file type

## Impact
Có thể upload file độc hại hoặc quá lớn

## Files Affected
- `backend/src/common/upload/upload.controller.ts`

## Suggested Solution
- Add file size validation (max 10MB)
- Add file type whitelist (only images)
- Add virus scanning
- Add proper error messages

## Priority
Medium
```

---

### Issue #2: No Rate Limiting on Auth Endpoints

**Title:** `🔒 [Backend] No Rate Limiting on Auth Endpoints`

**Labels:** `bug`, `security`, `backend`, `high-priority`

**Body:**
```markdown
## Description
Thiếu rate limiting cho login/register endpoints

## Impact
Dễ bị brute force attack

## Files Affected
- `backend/src/auth/auth.controller.ts`

## Suggested Solution
- Implement rate limiting middleware
- Use `@nestjs/throttler`
- Limit: 5 attempts per 15 minutes for login
- Limit: 3 attempts per hour for register

## Priority
High
```

---

### Issue #3: Missing Pagination Validation

**Title:** `🐛 [Backend] Missing Pagination Validation`

**Labels:** `bug`, `backend`, `performance`

**Body:**
```markdown
## Description
Không validate page/limit parameters

## Impact
Có thể query quá nhiều data, gây performance issue

## Files Affected
- `backend/src/comics/infrastructure/controllers/comics.controller.ts`

## Suggested Solution
- Add DTO validation for pagination
- Max limit: 100 items
- Default limit: 20 items
- Validate page >= 1

## Priority
Low
```

---

### Issue #4: No Database Transaction for Complex Operations

**Title:** `🐛 [Backend] No Database Transaction for Complex Operations`

**Labels:** `bug`, `backend`, `database`

**Body:**
```markdown
## Description
Các operations phức tạp (create comic với chapters) không dùng transaction

## Impact
Data inconsistency nếu operation fails giữa chừng

## Files Affected
- `backend/src/comics/application/comics.service.ts`

## Suggested Solution
- Wrap complex operations in Prisma transactions
- Use `prisma.$transaction()`
- Add rollback handling
- Add proper error logging

## Priority
Medium
```

---

### Issue #5: Missing Input Sanitization

**Title:** `🔒 [Backend] Missing Input Sanitization`

**Labels:** `bug`, `security`, `backend`, `high-priority`

**Body:**
```markdown
## Description
Không sanitize user input trước khi lưu vào database

## Impact
XSS, SQL injection risks

## Files Affected
- Multiple controllers

## Suggested Solution
- Install `class-validator` and `class-sanitizer`
- Add sanitization decorators to DTOs
- Sanitize HTML content
- Escape special characters

## Priority
High
```

---

### Issue #6: No Loading States for Data Fetching

**Title:** `🎨 [Frontend] No Loading States for Data Fetching`

**Labels:** `bug`, `frontend`, `ux`

**Body:**
```markdown
## Description
Một số pages thiếu loading skeleton

## Impact
Poor UX khi loading data

## Files Affected
- `frontend/src/app/comic/[slug]/page.tsx`

## Suggested Solution
- Add loading.tsx files
- Implement skeleton components
- Use Suspense boundaries
- Add loading spinners

## Priority
Low
```

---

### Issue #7: Missing Error Boundaries

**Title:** `🐛 [Frontend] Missing Error Boundaries`

**Labels:** `bug`, `frontend`, `stability`

**Body:**
```markdown
## Description
Không có error boundary để catch runtime errors

## Impact
Whole app crashes khi có error

## Files Affected
- `frontend/src/app/layout.tsx`

## Suggested Solution
- Create ErrorBoundary component
- Add error.tsx files
- Implement fallback UI
- Add error logging

## Priority
Medium
```

---

### Issue #8: No Image Optimization

**Title:** `⚡ [Frontend] No Image Optimization`

**Labels:** `bug`, `frontend`, `performance`

**Body:**
```markdown
## Description
Images không được optimize (lazy loading, responsive images)

## Impact
Slow page load, poor performance

## Files Affected
- Multiple pages

## Suggested Solution
- Use Next.js Image component
- Implement lazy loading
- Add responsive images
- Use WebP format
- Add blur placeholder

## Priority
Medium
```

---

### Issue #9: Accessibility Issues

**Title:** `♿ [Frontend] Accessibility Issues`

**Labels:** `bug`, `frontend`, `accessibility`

**Body:**
```markdown
## Description
Thiếu ARIA labels, keyboard navigation

## Impact
Không accessible cho người khuyết tật

## Files Affected
- Multiple components

## Suggested Solution
- Add ARIA labels
- Implement keyboard navigation
- Add focus indicators
- Test with screen readers
- Follow WCAG 2.1 guidelines

## Priority
Medium
```

---

### Issue #10: No Offline Support

**Title:** `📱 [Frontend] No Offline Support`

**Labels:** `enhancement`, `frontend`, `pwa`

**Body:**
```markdown
## Description
Không có service worker, offline mode

## Impact
App không hoạt động khi offline

## Files Affected
- `frontend/src/app/layout.tsx`

## Suggested Solution
- Implement service worker
- Add offline page
- Cache static assets
- Add PWA manifest

## Priority
Low
```

---

## ✨ HIGH PRIORITY FEATURES (5 issues)

### Issue #11: User Comments System

**Title:** `✨ [Feature] User Comments System`

**Labels:** `feature`, `high-priority`, `full-stack`

**Body:**
```markdown
## Description
Cho phép users comment trên chapters

## Components
- Backend API (comments CRUD)
- Frontend UI (comment form, list)
- CMS moderation (approve/delete comments)

## Technical Details
- Database schema: Comment model
- Relations: User -> Comment -> Chapter
- Features: Reply, like, report
- Moderation: Auto-filter spam

## Estimate
2 weeks

## Priority
High
```

---

### Issue #12: Reading History & Progress Tracking

**Title:** `✨ [Feature] Reading History & Progress Tracking`

**Labels:** `feature`, `high-priority`, `full-stack`

**Body:**
```markdown
## Description
Track reading progress, continue reading

## Components
- Backend API (history CRUD)
- Frontend UI (continue reading section)
- Database schema (ReadingHistory model)

## Technical Details
- Track: last chapter read, page number
- Auto-save progress
- Sync across devices
- Privacy: user can clear history

## Estimate
1 week

## Priority
High
```

---

### Issue #13: Advanced Search with Filters

**Title:** `✨ [Feature] Advanced Search with Filters`

**Labels:** `feature`, `high-priority`, `full-stack`

**Body:**
```markdown
## Description
Search by genre, author, status, year

## Components
- Backend search API (Elasticsearch/Algolia)
- Frontend search UI (filters, facets)

## Technical Details
- Full-text search
- Filters: genre, status, year, author
- Sort: relevance, date, views
- Autocomplete suggestions

## Estimate
1 week

## Priority
High
```

---

### Issue #14: Notification System

**Title:** `✨ [Feature] Notification System`

**Labels:** `feature`, `high-priority`, `full-stack`

**Body:**
```markdown
## Description
Notify users về new chapters, replies

## Components
- Backend notification service
- Frontend UI (notification bell)
- WebSocket for real-time

## Technical Details
- Types: new chapter, reply, like
- Delivery: in-app, email (optional)
- Mark as read
- Notification preferences

## Estimate
2 weeks

## Priority
High
```

---

### Issue #15: Rating & Review System

**Title:** `✨ [Feature] Rating & Review System`

**Labels:** `feature`, `high-priority`, `full-stack`

**Body:**
```markdown
## Description
Users có thể rate và review comics

## Components
- Backend API (ratings, reviews)
- Frontend UI (star rating, review form)
- CMS moderation

## Technical Details
- 5-star rating
- Written reviews
- Helpful votes
- Moderation tools

## Estimate
1.5 weeks

## Priority
High
```

---

## 🎨 MEDIUM PRIORITY FEATURES (4 issues)

### Issue #16: Social Sharing

**Title:** `✨ [Feature] Social Sharing`

**Labels:** `feature`, `medium-priority`, `frontend`

**Body:**
```markdown
## Description
Share comics lên social media

## Components
- Frontend share buttons
- OG meta tags

## Technical Details
- Platforms: Facebook, Twitter, Pinterest
- Dynamic OG images
- Share count tracking

## Estimate
3 days

## Priority
Medium
```

---

### Issue #17: Dark/Light Theme Toggle

**Title:** `✨ [Feature] Dark/Light Theme Toggle`

**Labels:** `feature`, `medium-priority`, `frontend`

**Body:**
```markdown
## Description
User có thể switch theme

## Components
- Frontend theme system

## Technical Details
- Use CSS variables
- Persist preference
- Smooth transition
- System preference detection

## Estimate
2 days

## Priority
Medium
```

---

### Issue #18: Reading Modes (Vertical/Horizontal)

**Title:** `✨ [Feature] Reading Modes (Vertical/Horizontal)`

**Labels:** `feature`, `medium-priority`, `frontend`

**Body:**
```markdown
## Description
Different reading modes cho chapters

## Components
- Frontend reader component

## Technical Details
- Modes: vertical scroll, horizontal swipe
- Persist preference
- Touch gestures
- Keyboard shortcuts

## Estimate
1 week

## Priority
Medium
```

---

### Issue #19: Analytics Dashboard

**Title:** `✨ [Feature] Analytics Dashboard`

**Labels:** `feature`, `medium-priority`, `cms`

**Body:**
```markdown
## Description
View stats về views, users, popular comics

## Components
- Backend analytics service
- CMS dashboard

## Technical Details
- Metrics: views, users, popular comics
- Charts: line, bar, pie
- Date range filter
- Export to CSV

## Estimate
1 week

## Priority
Medium
```

---

## 🔧 TECHNICAL DEBT (3 issues)

### Issue #20: Add Unit Tests Coverage

**Title:** `🔧 [Tech Debt] Add Unit Tests Coverage`

**Labels:** `tech-debt`, `testing`, `all`

**Body:**
```markdown
## Description
Test coverage < 30%

## Tasks
- [ ] Backend unit tests (services)
- [ ] Backend integration tests (controllers)
- [ ] Frontend component tests
- [ ] E2E tests

## Target
- Unit tests: 80%
- Integration tests: 60%
- E2E tests: Critical paths

## Priority
Ongoing
```

---

### Issue #21: Implement Proper Logging System

**Title:** `🔧 [Tech Debt] Implement Proper Logging System`

**Labels:** `tech-debt`, `backend`, `monitoring`

**Body:**
```markdown
## Description
Thiếu structured logging

## Tasks
- [ ] Install Winston/Pino
- [ ] Add log levels
- [ ] Add request ID tracking
- [ ] Add log rotation
- [ ] Add error tracking (Sentry)

## Estimate
3 days

## Priority
Medium
```

---

### Issue #22: API Documentation (Swagger)

**Title:** `🔧 [Tech Debt] API Documentation (Swagger)`

**Labels:** `tech-debt`, `backend`, `documentation`

**Body:**
```markdown
## Description
API docs chưa đầy đủ

## Tasks
- [ ] Add Swagger decorators
- [ ] Document all endpoints
- [ ] Add examples
- [ ] Add authentication docs
- [ ] Host on /api/docs

## Estimate
1 week

## Priority
Medium
```

---

## ⚡ PERFORMANCE (2 issues)

### Issue #23: Implement Redis Caching

**Title:** `⚡ [Performance] Implement Redis Caching`

**Labels:** `performance`, `backend`

**Body:**
```markdown
## Description
Cache frequently accessed data

## Tasks
- [ ] Install Redis
- [ ] Cache comics list
- [ ] Cache chapters
- [ ] Cache user data
- [ ] Add cache invalidation

## Estimate
1 week

## Priority
High
```

---

### Issue #24: Image CDN Integration

**Title:** `⚡ [Performance] Image CDN Integration`

**Labels:** `performance`, `infrastructure`

**Body:**
```markdown
## Description
Serve images qua CDN

## Tasks
- [ ] Choose CDN (Cloudflare, AWS CloudFront)
- [ ] Configure CDN
- [ ] Update image URLs
- [ ] Add image optimization

## Estimate
3 days

## Priority
Medium
```

---

## 🔒 SECURITY (2 issues)

### Issue #25: Implement CSRF Protection

**Title:** `🔒 [Security] Implement CSRF Protection`

**Labels:** `security`, `backend`, `high-priority`

**Body:**
```markdown
## Description
Add CSRF tokens

## Tasks
- [ ] Install csurf middleware
- [ ] Add CSRF tokens to forms
- [ ] Update API calls
- [ ] Test protection

## Estimate
2 days

## Priority
High
```

---

### Issue #26: Implement Rate Limiting

**Title:** `🔒 [Security] Implement Rate Limiting`

**Labels:** `security`, `backend`, `high-priority`

**Body:**
```markdown
## Description
Rate limit all endpoints

## Tasks
- [ ] Install @nestjs/throttler
- [ ] Configure rate limits
- [ ] Add custom limits per endpoint
- [ ] Add IP-based limiting
- [ ] Add monitoring

## Estimate
3 days

## Priority
High
```

---

## 📊 Summary

**Total Issues: 26**

- 🐛 Bugs: 10
- ✨ Features: 9
- 🔧 Tech Debt: 3
- ⚡ Performance: 2
- 🔒 Security: 2

**By Priority:**
- High: 10 issues
- Medium: 12 issues
- Low: 4 issues

**By Component:**
- Backend: 12 issues
- Frontend: 8 issues
- Full-stack: 5 issues
- CMS: 1 issue

---

## Next Steps

1. Review và prioritize các issues
2. Assign issues cho team members
3. Create milestones cho từng sprint
4. Start working on high-priority items first
5. Track progress trên GitHub Projects
