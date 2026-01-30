#!/usr/bin/env node

/**
 * Script to create GitHub issues from ISSUES_ANALYSIS.md
 * Usage: node create-github-issues.js
 * 
 * Prerequisites:
 * 1. Install GitHub CLI: https://cli.github.com/
 * 2. Authenticate: gh auth login
 * 3. Run: node create-github-issues.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPO = 'Kim-Thu/site-comics'; // Change to your repo
const DRY_RUN = false; // Set to true to preview without creating issues

// Issue templates
const issues = [
  // BUGS & ISSUES
  {
    title: '🐛 [Backend] Missing Error Handling in Upload Controller',
    body: `## Description
Upload controller thiếu validation cho file size, file type

## Impact
Có thể upload file độc hại hoặc quá lớn

## Files Affected
- \`backend/src/common/upload/upload.controller.ts\`

## Suggested Solution
- Add file size validation (max 10MB)
- Add file type whitelist (only images)
- Add virus scanning
- Add proper error messages

## Priority
Medium`,
    labels: ['bug', 'security', 'backend'],
    assignees: []
  },
  {
    title: '🔒 [Backend] No Rate Limiting on Auth Endpoints',
    body: `## Description
Thiếu rate limiting cho login/register endpoints

## Impact
Dễ bị brute force attack

## Files Affected
- \`backend/src/auth/auth.controller.ts\`

## Suggested Solution
- Implement rate limiting middleware
- Use \`@nestjs/throttler\`
- Limit: 5 attempts per 15 minutes for login
- Limit: 3 attempts per hour for register

## Priority
High`,
    labels: ['bug', 'security', 'backend', 'high-priority'],
    assignees: []
  },
  {
    title: '🐛 [Backend] Missing Pagination Validation',
    body: `## Description
Không validate page/limit parameters

## Impact
Có thể query quá nhiều data, gây performance issue

## Files Affected
- \`backend/src/comics/infrastructure/controllers/comics.controller.ts\`

## Suggested Solution
- Add DTO validation for pagination
- Max limit: 100 items
- Default limit: 20 items
- Validate page >= 1

## Priority
Low`,
    labels: ['bug', 'backend', 'performance'],
    assignees: []
  },
  {
    title: '🐛 [Backend] No Database Transaction for Complex Operations',
    body: `## Description
Các operations phức tạp (create comic với chapters) không dùng transaction

## Impact
Data inconsistency nếu operation fails giữa chừng

## Files Affected
- \`backend/src/comics/application/comics.service.ts\`

## Suggested Solution
- Wrap complex operations in Prisma transactions
- Use \`prisma.$transaction()\`
- Add rollback handling
- Add proper error logging

## Priority
Medium`,
    labels: ['bug', 'backend', 'database'],
    assignees: []
  },
  {
    title: '🔒 [Backend] Missing Input Sanitization',
    body: `## Description
Không sanitize user input trước khi lưu vào database

## Impact
XSS, SQL injection risks

## Files Affected
- Multiple controllers

## Suggested Solution
- Install \`class-validator\` and \`class-sanitizer\`
- Add sanitization decorators to DTOs
- Sanitize HTML content
- Escape special characters

## Priority
High`,
    labels: ['bug', 'security', 'backend', 'high-priority'],
    assignees: []
  },
  {
    title: '🎨 [Frontend] No Loading States for Data Fetching',
    body: `## Description
Một số pages thiếu loading skeleton

## Impact
Poor UX khi loading data

## Files Affected
- \`frontend/src/app/comic/[slug]/page.tsx\`

## Suggested Solution
- Add loading.tsx files
- Implement skeleton components
- Use Suspense boundaries
- Add loading spinners

## Priority
Low`,
    labels: ['bug', 'frontend', 'ux'],
    assignees: []
  },
  {
    title: '🐛 [Frontend] Missing Error Boundaries',
    body: `## Description
Không có error boundary để catch runtime errors

## Impact
Whole app crashes khi có error

## Files Affected
- \`frontend/src/app/layout.tsx\`

## Suggested Solution
- Create ErrorBoundary component
- Add error.tsx files
- Implement fallback UI
- Add error logging

## Priority
Medium`,
    labels: ['bug', 'frontend', 'stability'],
    assignees: []
  },
  {
    title: '⚡ [Frontend] No Image Optimization',
    body: `## Description
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
Medium`,
    labels: ['bug', 'frontend', 'performance'],
    assignees: []
  },
  {
    title: '♿ [Frontend] Accessibility Issues',
    body: `## Description
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
Medium`,
    labels: ['bug', 'frontend', 'accessibility'],
    assignees: []
  },
  {
    title: '📱 [Frontend] No Offline Support',
    body: `## Description
Không có service worker, offline mode

## Impact
App không hoạt động khi offline

## Files Affected
- \`frontend/src/app/layout.tsx\`

## Suggested Solution
- Implement service worker
- Add offline page
- Cache static assets
- Add PWA manifest

## Priority
Low`,
    labels: ['enhancement', 'frontend', 'pwa'],
    assignees: []
  },

  // HIGH PRIORITY FEATURES
  {
    title: '✨ [Feature] User Comments System',
    body: `## Description
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
High`,
    labels: ['feature', 'high-priority', 'full-stack'],
    assignees: []
  },
  {
    title: '✨ [Feature] Reading History & Progress Tracking',
    body: `## Description
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
High`,
    labels: ['feature', 'high-priority', 'full-stack'],
    assignees: []
  },
  {
    title: '✨ [Feature] Advanced Search with Filters',
    body: `## Description
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
High`,
    labels: ['feature', 'high-priority', 'full-stack'],
    assignees: []
  },
  {
    title: '✨ [Feature] Notification System',
    body: `## Description
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
High`,
    labels: ['feature', 'high-priority', 'full-stack'],
    assignees: []
  },
  {
    title: '✨ [Feature] Rating & Review System',
    body: `## Description
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
High`,
    labels: ['feature', 'high-priority', 'full-stack'],
    assignees: []
  },

  // MEDIUM PRIORITY FEATURES
  {
    title: '✨ [Feature] Social Sharing',
    body: `## Description
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
Medium`,
    labels: ['feature', 'medium-priority', 'frontend'],
    assignees: []
  },
  {
    title: '✨ [Feature] Dark/Light Theme Toggle',
    body: `## Description
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
Medium`,
    labels: ['feature', 'medium-priority', 'frontend'],
    assignees: []
  },
  {
    title: '✨ [Feature] Reading Modes (Vertical/Horizontal)',
    body: `## Description
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
Medium`,
    labels: ['feature', 'medium-priority', 'frontend'],
    assignees: []
  },
  {
    title: '✨ [Feature] Analytics Dashboard',
    body: `## Description
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
Medium`,
    labels: ['feature', 'medium-priority', 'cms'],
    assignees: []
  },

  // TECHNICAL DEBT
  {
    title: '🔧 [Tech Debt] Add Unit Tests Coverage',
    body: `## Description
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
Ongoing`,
    labels: ['tech-debt', 'testing', 'all'],
    assignees: []
  },
  {
    title: '🔧 [Tech Debt] Implement Proper Logging System',
    body: `## Description
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
Medium`,
    labels: ['tech-debt', 'backend', 'monitoring'],
    assignees: []
  },
  {
    title: '🔧 [Tech Debt] API Documentation (Swagger)',
    body: `## Description
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
Medium`,
    labels: ['tech-debt', 'backend', 'documentation'],
    assignees: []
  },

  // PERFORMANCE
  {
    title: '⚡ [Performance] Implement Redis Caching',
    body: `## Description
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
High`,
    labels: ['performance', 'backend'],
    assignees: []
  },
  {
    title: '⚡ [Performance] Image CDN Integration',
    body: `## Description
Serve images qua CDN

## Tasks
- [ ] Choose CDN (Cloudflare, AWS CloudFront)
- [ ] Configure CDN
- [ ] Update image URLs
- [ ] Add image optimization

## Estimate
3 days

## Priority
Medium`,
    labels: ['performance', 'infrastructure'],
    assignees: []
  },

  // SECURITY
  {
    title: '🔒 [Security] Implement CSRF Protection',
    body: `## Description
Add CSRF tokens

## Tasks
- [ ] Install csurf middleware
- [ ] Add CSRF tokens to forms
- [ ] Update API calls
- [ ] Test protection

## Estimate
2 days

## Priority
High`,
    labels: ['security', 'backend', 'high-priority'],
    assignees: []
  },
  {
    title: '🔒 [Security] Implement Rate Limiting',
    body: `## Description
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
High`,
    labels: ['security', 'backend', 'high-priority'],
    assignees: []
  }
];

// Function to create a single issue
function createIssue(issue) {
  const { title, body, labels, assignees } = issue;
  
  const labelsArg = labels.map(l => `--label "${l}"`).join(' ');
  const assigneesArg = assignees.length > 0 ? assignees.map(a => `--assignee "${a}"`).join(' ') : '';
  
  const command = `gh issue create --repo ${REPO} --title "${title}" --body "${body}" ${labelsArg} ${assigneesArg}`;
  
  if (DRY_RUN) {
    console.log('\n' + '='.repeat(80));
    console.log('DRY RUN - Would create issue:');
    console.log('Title:', title);
    console.log('Labels:', labels.join(', '));
    console.log('='.repeat(80));
    return;
  }
  
  try {
    console.log(`Creating issue: ${title}`);
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Created successfully\n');
    
    // Sleep to avoid rate limiting
    execSync('timeout /t 2 /nobreak', { stdio: 'ignore' });
  } catch (error) {
    console.error(`❌ Failed to create issue: ${title}`);
    console.error(error.message);
  }
}

// Main function
function main() {
  console.log('🚀 Creating GitHub Issues...\n');
  console.log(`Repository: ${REPO}`);
  console.log(`Total issues: ${issues.length}`);
  console.log(`Dry run: ${DRY_RUN}\n`);
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No issues will be created\n');
  }
  
  // Check if gh CLI is installed
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ GitHub CLI (gh) is not installed!');
    console.error('Install it from: https://cli.github.com/');
    process.exit(1);
  }
  
  // Create issues
  issues.forEach((issue, index) => {
    console.log(`[${index + 1}/${issues.length}]`);
    createIssue(issue);
  });
  
  console.log('\n✅ Done!');
  console.log(`\nView issues at: https://github.com/${REPO}/issues`);
}

// Run
main();
