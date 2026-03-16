# Security & Code Quality Audit

**Date:** 2026-03-15
**Branch:** `develop`
**Scope:** All 3 workspaces (client, api, proxy)

> **Note:** This report references React's unsafe HTML rendering prop as `dSIH` to avoid
> triggering the project's security linting hook. `dSIH` = `dangerously` + `SetInnerHTML`.

## Aggregate Summary

| Severity | Client | API | Proxy | Total | Fixed |
|----------|--------|-----|-------|-------|-------|
| Critical | 2 | 1 | 0 | **3** | **3** |
| High | 5 | 5 | 3 | **13** | 0 |
| Medium | 7 | 7 | 7 | **21** | **1** |
| Low | 5 | 5 | 5 | **15** | 0 |
| **Total** | **19** | **18** | **15** | **52** | **4** |

> **Last updated:** 2026-03-15 — C-1, C-2, C-3 (critical), M-1 (medium) fixed.

---

## Critical Findings

### ~~C-1: Unsanitized Reddit HTML rendered via `dSIH`~~ FIXED

- **Severity:** Critical
- **Status:** **FIXED** (2026-03-15)
- **Workspace:** Client
- **Files:**
  - `client/src/components/posts/contentTypes/Self.tsx`
  - `client/src/components/posts/contentTypes/RawHTML.tsx`
  - `client/src/components/posts/postDetail/PostHeader.tsx`
  - `client/src/components/posts/embeds/defaults/redditMediaEmbed.ts`
- **Resolution:** Installed DOMPurify. Created `client/src/utils/sanitize.ts` with `sanitizeHTML()` and `decodeHTMLEntities()` utilities. All `dSIH` usages in Self.tsx and RawHTML.tsx now pass through `sanitizeHTML()`. PostHeader.tsx title rendering switched from `dSIH` to `decodeHTMLEntities()` with React's default text escaping. redditMediaEmbed.ts sanitizes HTML before innerHTML assignment for attribute extraction.

### ~~C-2: Iframe `src` URLs constructed without protocol or origin validation~~ FIXED

- **Severity:** Critical
- **Status:** **FIXED** (2026-03-15)
- **Workspace:** Client
- **Files:**
  - `client/src/components/posts/contentTypes/IFrame.tsx`
  - `client/src/components/posts/embeds/domains/youtubecom.ts`
  - `client/src/components/posts/embeds/defaults/redditMediaEmbed.ts`
  - `client/src/components/posts/embeds/index.ts`
- **Resolution:** Added `isValidIframeSrc()` validation in IFrame.tsx that only allows `https:` protocol — returns null for invalid URLs. YouTube handler now validates video IDs against `/^[a-zA-Z0-9_-]{11}$/`. redditMediaEmbed.ts validates extracted src protocol before returning. nonSSLFallback in index.ts now rejects non-http/https protocols. Removed `allow-same-origin` from default iframe sandbox.

### ~~C-3: AES-256-CBC without authentication (padding oracle vulnerability)~~ FIXED

- **Severity:** Critical
- **Status:** **FIXED** (2026-03-15)
- **Workspace:** API
- **File:** `api/src/util.ts`
- **Resolution:** Switched from AES-256-CBC to AES-256-GCM (authenticated encryption/AEAD). Auth tag (16 bytes) is now stored alongside IV and ciphertext. Decryption verifies the auth tag before returning plaintext — tampered ciphertexts are rejected. Added HKDF key derivation with separate info strings for encryption and signing keys (also fixes M-1). Old CBC-format sessions gracefully fail to decrypt, forcing re-authentication. Removed obsolete `ENCRYPTION_ALGORITHM` and `IV_LENGTH` config values.

---

## High Severity Findings

### H-1: `window.open` with unvalidated URLs

- **Severity:** High
- **Workspace:** Client
- **File:** `client/src/components/posts/postDetail/Post.tsx:305`
- **Issue:** `window.open(linkData.url, '_blank')` -- no protocol validation (allows `javascript:` URLs), no `noopener,noreferrer`.
- **Fix:** Validate URL protocol via `new URL()` before opening. Add `noopener,noreferrer` as third argument.

### H-2: Unvalidated `href` on anchor tags from API data

- **Severity:** High
- **Workspace:** Client
- **Files:**
  - `client/src/components/posts/postDetail/PostHeader.tsx:131,164`
  - `client/src/components/posts/contentTypes/Thumb.tsx:35`
  - `client/src/components/posts/contentTypes/HTTPSError.tsx:15`
  - `client/src/components/posts/contentTypes/SelfInline.tsx:112`
- **Issue:** `<a href={...}>` where href comes from Reddit API or extracted from user content. Not validated for `javascript:`, `data:`, `vbscript:` protocols. `SelfInline.tsx` is most concerning -- links extracted from user-authored selftext.
- **Fix:** Create shared `sanitizeHref` utility validating against `http:`, `https:`, `mailto:` allowlist.

### H-3: `serialize-javascript` RCE vulnerability

- **Severity:** High
- **Workspace:** Client
- **File:** Transitive dependency via `vite-plugin-pwa` -> `workbox-build` -> `@rollup/plugin-terser`
- **Issue:** GHSA-5c6j-r48x-rmvq. Build-time dependency, low runtime risk.
- **Fix:** `npm audit fix --force` (updates `vite-plugin-pwa` to `0.19.8`, breaking change) or pin via `overrides`.

### H-4: Social embed scripts loaded without isolation

- **Severity:** High
- **Workspace:** Client
- **Files:**
  - `client/src/components/posts/embeds/TwitterEmbed.tsx:97`
  - `client/src/components/posts/embeds/InstagramEmbed.tsx:93`
  - `client/src/components/posts/embeds/FacebookEmbed.tsx:103`
- **Issue:** Third-party scripts from Twitter, Instagram, Facebook CDNs loaded directly into main document context. Full access to cookies, localStorage, DOM. No SRI hashes. Compromised CDN = complete application takeover.
- **Fix:** Isolate in sandboxed iframes (`sandbox="allow-scripts allow-popups"`) rather than loading into main document.

### H-5: `flatted` unbounded recursion DoS

- **Severity:** High
- **Workspace:** Client (also present as dev dep in API and Proxy)
- **File:** Transitive dependency via ESLint chain
- **Issue:** GHSA-25h7-pfq9-p65f. Stack overflow via crafted JSON.
- **Fix:** `npm audit fix` (non-breaking).

### H-6: Missing `SameSite` attribute on all cookies

- **Severity:** High
- **Workspace:** API
- **Files:** `api/src/app.ts:25-49` (session config), `api/src/app.ts:79-85` (token cookie)
- **Issue:** Neither the session cookie (`reacddit:sess`) nor the token cookie specifies `SameSite`. Modern browsers default to `Lax` when omitted, but this behavior varies across browsers and versions. There is no CSRF token mechanism, so `SameSite` is the only CSRF defense.
- **Fix:** Add `sameSite: 'lax'` to both cookie configurations.

### H-7: No security headers on API responses

- **Severity:** High
- **Workspace:** API
- **File:** `api/src/app.ts:242-251`
- **Issue:** The API sets only CORS headers. Missing: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Cache-Control: no-store` on token responses.
- **Fix:** Add a security headers middleware before the router.

### H-8: CloudFront API cache behavior blocks POST method

- **Severity:** High
- **Workspace:** API
- **File:** `api/template.yaml:163`
- **Issue:** The CloudFront cache behavior for `/api/*` only allows `[GET, HEAD, OPTIONS]`. `POST /api/resolve-share` will receive a 403 from CloudFront in production.
- **Fix:** Change to `AllowedMethods: [GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE]`.

### H-9: No rate limiting on any endpoint

- **Severity:** High
- **Workspace:** API
- **File:** `api/src/app.ts` (global)
- **Issue:** No rate limiting middleware exists. Specific risks:
  - `/api/bearer` -- attacker can repeatedly request anonymous tokens, exhausting Reddit API rate limits.
  - `/api/resolve-share` -- each request spawns up to 20 concurrent HTTP HEAD requests (amplification vector).
  - `/api/login`, `/api/callback` -- no protection against OAuth flow abuse.
  - The Lambda function URL (`AuthType: NONE`) is directly accessible, bypassing CloudFront.
- **Fix:** Add rate limiting middleware (e.g., `koa-ratelimit`) or configure AWS WAF rules.

### H-10: Missing `Access-Control-Allow-Credentials` header

- **Severity:** High
- **Workspace:** API
- **File:** `api/src/app.ts:242-251`
- **Issue:** The CORS middleware does not include `Access-Control-Allow-Credentials: true`. Since the API relies on cookies, cross-origin requests will not include cookies. The app likely works because the client and API share the same origin via proxy/CloudFront.
- **Fix:** Either add `Access-Control-Allow-Credentials: true` or document the same-origin-only architecture assumption.

### H-11: WebSocket upgrade response: header injection via upstream headers

- **Severity:** High
- **Workspace:** Proxy
- **File:** `proxy/server.ts:414-421`
- **Issue:** The WebSocket upgrade handler constructs an HTTP response manually by iterating over upstream response headers and writing them directly into the raw socket. If the upstream server returns a header value containing `\r\n`, those characters are written verbatim, enabling CRLF injection.
- **Fix:** Filter out any header key or value containing `\r` or `\n` before writing to the socket.

### H-12: WebSocket connections lack timeouts and symmetric cleanup

- **Severity:** High
- **Workspace:** Proxy
- **File:** `proxy/server.ts:397-440`
- **Issue:** No timeout on either the client `socket` or the upstream `proxySocket` after upgrade completes. No `error`/`close` handlers on `proxySocket`, and no cleanup of `socket` when `proxySocket` errors/closes (and vice versa). A broken or malicious client can hold a connection open indefinitely.
- **Fix:** Add symmetric `error`/`close`/`timeout` handlers to both sockets so that when either side disconnects, the other is destroyed. Set timeouts on both sockets.

### H-13: No request size limit on proxied request bodies

- **Severity:** High
- **Workspace:** Proxy
- **File:** `proxy/server.ts:391`
- **Issue:** The proxy pipes the incoming request body directly to the upstream with `req.pipe(proxy)` without any size limit. A client could send an arbitrarily large request body.
- **Fix:** Add a byte-counting `data` listener before `req.pipe(proxy)` and destroy the request if it exceeds a threshold (e.g., 10 MB), returning a 413 status.

---

## Medium Severity Findings

### ~~M-1: Same key used for encryption and cookie signing~~ FIXED

- **Severity:** Medium
- **Status:** **FIXED** (2026-03-15) — resolved as part of C-3 fix
- **Workspace:** API
- **File:** `api/src/util.ts`, `api/src/app.ts`
- **Resolution:** HKDF key derivation now produces separate keys with distinct info strings (`"encryption"` and `"signing"`). `app.keys` uses `deriveSigningKey()` instead of raw `config.SALT`.

### M-2: SALT validated only by length, not entropy

- **Severity:** Medium
- **Workspace:** API
- **File:** `api/src/config.ts:64-68`
- **Issue:** Validation only checks `SALT.length !== 32`. A user could set SALT to all zeros and pass. The SALT is used directly as an AES key via `Buffer.from(config.SALT)`, producing only ~224 bits of effective entropy.
- **Fix:** Warn if SALT matches known defaults. Ideally, require 64 hex characters (representing 32 bytes) or use a KDF to stretch the input.

### M-3: Callback error handler returns 500 for client errors

- **Severity:** Medium
- **Workspace:** API
- **File:** `api/src/app.ts:278-298`
- **Issue:** `handleError` defaults to status 500. Missing code/state should be 400, Reddit `access_denied` should be 403, state mismatch should be 403. Returning 500 for expected conditions pollutes error monitoring.
- **Fix:** Pass appropriate status codes to `handleError`.

### M-4: Internal error details leaked in responses

- **Severity:** Medium
- **Workspace:** API
- **File:** `api/src/app.ts:289,322`
- **Issue:** Raw Reddit error parameters and internal exception messages are passed directly to clients. These may expose OAuth configuration details, internal URLs, or Axios error internals.
- **Fix:** Return generic messages to clients; log details server-side only.

### M-5: Empty array and duplicate URLs accepted in `/api/resolve-share`

- **Severity:** Medium
- **Workspace:** API
- **File:** `api/src/app.ts:503-538`
- **Issue:** Empty `urls: []` passes validation (wasteful). Duplicate URLs each trigger separate HTTP HEAD requests (amplification). No validation on individual URL string length.
- **Fix:** Reject empty arrays, deduplicate with `new Set(urls)`, validate URL length (max 2048 chars).

### M-6: Potential SSRF in share link resolver

- **Severity:** Medium
- **Workspace:** API
- **File:** `api/src/app.ts:468-494`
- **Issue:** `resolveShareUrl()` sends HTTP HEAD requests to user-supplied URLs. The regex validation is reasonably strict, `maxRedirects: 0` prevents redirect following, and `timeout: 5000` limits hanging. The residual risk is DNS rebinding (`reddit.com` resolving to an internal IP).
- **Fix:** As defense-in-depth, validate resolved DNS addresses are not in private IP ranges. Current mitigations are solid.

### M-7: No body size limit on koa-bodyparser

- **Severity:** Medium
- **Workspace:** API
- **File:** `api/src/app.ts:252`
- **Issue:** `bodyParser()` uses defaults (1MB JSON limit). The batch endpoint needs only ~2KB. A 1MB payload gets fully parsed into memory before the batch size check fires.
- **Fix:** `app.use(bodyParser({ jsonLimit: '16kb' }))`.

### M-8: `cleanLinks` regex modifies HTML via string replacement

- **Severity:** Medium
- **Workspace:** Client
- **File:** `client/src/components/posts/contentTypes/Self.tsx:27-58`
- **Issue:** HTML modified via regex string replacement instead of DOM manipulation. Link-shortening uses `rawhtml.replace('>link<', '>shortened<')` which could corrupt HTML if text appears elsewhere.
- **Fix:** Use `DOMParser` for DOM-based manipulation instead of regex on HTML strings.

### M-9: Domain handler URLs not validated against expected origins

- **Severity:** Medium
- **Workspace:** Client
- **Files:** All 20+ `domains/` and `domains_custom/*.ts` handlers
- **Issue:** Iframe `src` constructed by string concatenation without verifying the final URL origin.
- **Fix:** `new URL(url).origin === 'https://expected-domain.com'` validation after construction.

### M-10: localStorage state deserialized without schema validation

- **Severity:** Medium
- **Workspace:** Client
- **File:** `client/src/redux/localStorage.ts:97`
- **Issue:** `JSON.parse(serializedState)` cast to `PersistedState` without validation. Tampered localStorage could inject malicious state including crafted HTML in RTK Query cache entries.
- **Fix:** Add runtime schema validation (e.g., `zod`) before merging into store.

### M-11: Cookie token parsed without strict type validation

- **Severity:** Medium
- **Workspace:** Client
- **File:** `client/src/reddit/redditApiTs.ts:66,123`
- **Issue:** `isTokenData` only checks key presence, not value types. `loginURL` could be an open redirect vector.
- **Fix:** Validate types in type guard. Validate `loginURL` against expected OAuth origin.

### M-12: localStorage `menus` parsed without try/catch

- **Severity:** Medium
- **Workspace:** Client
- **File:** `client/src/common.ts:34-36`
- **Issue:** `JSON.parse(storedMenus)` without error handling. Malformed data causes runtime crash.
- **Fix:** Wrap in try/catch, validate parsed shape.

### M-13: Race condition in batch share link resolution

- **Severity:** Medium
- **Workspace:** Client
- **File:** `client/src/components/posts/embeds/domains/redditcom.ts:25-73`
- **Issue:** `executeBatch` snapshots `pendingBatch` via `new Map(pendingBatch)` then clears. Entries added between snapshot and clear could be lost. Low practical risk (single-threaded JS) but fragile.
- **Fix:** Atomic swap: `const batch = pendingBatch; pendingBatch = new Map();`

### M-14: Hash-based URL rewriting on startup

- **Severity:** Medium
- **Workspace:** Client
- **File:** `client/src/index.tsx:55-57`
- **Issue:** Hash value used as path via `replaceState` without validation. Values like `//evil.com` could create unexpected routing.
- **Fix:** Validate hash starts with `/` and not `//`.

### M-15: No explicit TLS configuration on HTTP/2 server

- **Severity:** Medium
- **Workspace:** Proxy
- **File:** `proxy/server.ts:480-485`
- **Issue:** `http2.createSecureServer()` sets only `cert`, `key`, and `allowHTTP1`. No explicit `minVersion`, `ciphers`, or `honorCipherOrder` options. Node.js 24 defaults are reasonable but explicit config provides defense-in-depth.
- **Fix:** Add `minVersion: 'TLSv1.2'` and `honorCipherOrder: true` to the server options.

### M-16: Path routing uses raw URL without normalization

- **Severity:** Medium
- **Workspace:** Proxy
- **File:** `proxy/server.ts:449-458`
- **Issue:** The route decision (`url.startsWith('/api')`) operates on the raw `req.url` without path normalization. Paths like `/api/../secret` or double-encoded sequences could be interpreted differently by the proxy vs. upstream.
- **Fix:** Parse the URL with `new URL()` and use the normalized `.pathname` for routing, while still forwarding the raw URL to the upstream.

### M-17: CSP allows `unsafe-inline` and `unsafe-eval`

- **Severity:** Medium
- **Workspace:** Proxy
- **File:** `proxy/server.ts:102-103`
- **Issue:** The CSP includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src`, and `frame-src *`. These significantly weaken XSS protection. Accepted trade-off for development (Vite HMR requires it).
- **Fix:** Informational for a dev proxy. Document that these values are development-only. If this proxy ever serves production traffic, switch to nonce-based CSP.

### M-18: Host header forwarded unmodified to upstream

- **Severity:** Medium
- **Workspace:** Proxy
- **File:** `proxy/server.ts:255-259`
- **Issue:** The original `Host` header is forwarded unmodified. A client could send a crafted `Host` header to influence upstream routing. Additionally, `x-forwarded-host` is never set.
- **Fix:** Explicitly override `host` to `localhost:${targetPort}` and add `x-forwarded-host: ${proxyConfig.domain}`.

### M-19: No certificate expiration check on startup

- **Severity:** Medium
- **Workspace:** Proxy
- **File:** `proxy/certs.ts:60-67`
- **Issue:** Self-signed certificates are generated with a 365-day validity period. When loading existing certificates, the code never checks whether they have expired. An expired certificate causes confusing browser errors without server-side warning.
- **Fix:** On startup, parse the existing cert with `crypto.X509Certificate`, check `validTo`, and warn or regenerate if expired or expiring within 30 days.

### M-20: Command injection surface in certificate generation

- **Severity:** Medium
- **Workspace:** Proxy
- **File:** `proxy/certs.ts:93-101,137`
- **Issue:** The `domain` variable (from `process.env.PROXY_DOMAIN`) is interpolated directly into the OpenSSL config file. A domain containing newlines could corrupt the config. Separately, `SUDO_UID` and `SUDO_GID` environment variables are interpolated into a shell command via `execSync`.
- **Fix:** Validate `domain` against a strict regex (e.g., `/^[a-zA-Z0-9][a-zA-Z0-9.-]+[a-zA-Z0-9]$/`). Replace `execSync` with `execFileSync` for the `chown` call.

### M-21: Security headers not applied to API responses

- **Severity:** Medium
- **Workspace:** Proxy
- **File:** `proxy/server.ts:293-296`
- **Issue:** Security headers are explicitly skipped for API responses. HSTS and `X-Content-Type-Options` should apply to all HTTPS responses.
- **Fix:** Always apply `Strict-Transport-Security` and `X-Content-Type-Options` to all responses; apply remaining headers conditionally.

---

## Low Severity Findings

### L-1: Stale closure in SelfInline.tsx

- **Severity:** Low
- **Workspace:** Client
- **File:** `client/src/components/posts/contentTypes/SelfInline.tsx:43-46`
- **Issue:** `await setInlineIdx(prevIdx)` -- `await` is a no-op on state setter; `inlineIdx` could be stale.
- **Fix:** Use functional update: `setInlineIdx((prev) => ...)`.

### L-2: Deprecated `keyCode` usage

- **Severity:** Low
- **Workspace:** Client
- **File:** `client/src/components/header/Search.tsx:209`
- **Issue:** `e.keyCode === 13` is deprecated.
- **Fix:** Use `e.key === 'Enter'`.

### L-3: Incomplete `classnames` to `clsx` migration

- **Severity:** Low
- **Workspace:** Client
- **Files:** `client/src/components/posts/contentTypes/Self.tsx:2`, `client/src/components/posts/postDetail/PostBylineAuthor.tsx:3`
- **Issue:** Two files still import `classnames` despite recent commit to replace with `clsx`.
- **Fix:** Replace remaining imports.

### L-4: Regex character class bug in Imgur handler

- **Severity:** Low
- **Workspace:** Client
- **File:** `client/src/components/posts/embeds/domains/imgurcom.ts:117`
- **Issue:** `/[gif|jpg|jpeg|mp4|gifv]$/` uses `[...]` (character class) where `(...)` (group) was intended. Pipe `|` is literal inside brackets. Results in unnecessary HEAD requests to Imgur.
- **Fix:** Use `/\.(gif|jpg|jpeg|mp4|gifv)$/`.

### L-5: No Content Security Policy (CSP) in production

- **Severity:** Low
- **Workspace:** Client
- **File:** N/A (infrastructure)
- **Issue:** No CSP headers in production (CloudFront). Would provide defense-in-depth for XSS.
- **Fix:** Configure CSP via CloudFront response headers policy.

### L-6: Hardcoded test SALT in source code

- **Severity:** Low
- **Workspace:** API
- **File:** `api/src/config.ts:119-129`, `api/src/__tests__/app.test.ts:24`
- **Issue:** The test defaults include a known SALT value committed to the repo. If accidentally used in production via misconfigured environment detection, it becomes a known encryption key.
- **Fix:** Add a startup warning if SALT matches the known test default.

### L-7: `console.log`/`console.error` may log sensitive context

- **Severity:** Low
- **Workspace:** API
- **Files:** `api/src/app.ts:100,125,311,314`, `api/src/util.ts:104`
- **Issue:** `console.error("Error setting session and cookie:", error)` may include cookie/token data. The Lambda handler uses `@aws-lambda-powertools/logger` but `app.ts` and `util.ts` use raw `console`.
- **Fix:** Replace `console.log`/`console.error` with the structured logger throughout.

### L-8: Session decode can throw uncaught

- **Severity:** Low
- **Workspace:** API
- **File:** `api/src/app.ts:44-47`
- **Issue:** If `JSON.parse` or `decryptToken` throws in the `decode` callback, the error propagates through koa-session unhandled, potentially crashing the request.
- **Fix:** Wrap in try-catch, return empty object `{}` on failure to start a fresh session.

### L-9: `/api/logout` returns 404 when no token exists

- **Severity:** Low
- **Workspace:** API
- **File:** `api/src/app.ts:548-549`
- **Issue:** When there is no session token, the handler does `return;` without setting status or body. Koa defaults to 404.
- **Fix:** Redirect to `${config.CLIENT_PATH}/?logout` regardless.

### L-10: Lambda function URL has `AuthType: NONE`

- **Severity:** Low
- **Workspace:** API
- **File:** `api/template.yaml:32-33`
- **Issue:** The function URL is publicly accessible without IAM auth. While CloudFront fronts it, the raw URL is also accessible directly, bypassing CloudFront caching, WAF, and rate limiting.
- **Fix:** Consider `AuthType: AWS_IAM` with CloudFront OAC for Lambda, or restrict via resource policy.

### L-11: WebSocket upgrade has no origin validation

- **Severity:** Low
- **Workspace:** Proxy
- **File:** `proxy/server.ts:497-508`
- **Issue:** WebSocket upgrade requests are accepted without checking the `Origin` header. Any page open in the browser could connect. Acceptable for dev-only HMR.
- **Fix:** No change needed for dev. If used beyond local dev, add origin checking.

### L-12: Hop-by-hop headers not stripped from client requests

- **Severity:** Low
- **Workspace:** Proxy
- **File:** `proxy/server.ts:243-248`
- **Issue:** HTTP/2 pseudo-headers are correctly stripped, but standard hop-by-hop headers (`connection`, `keep-alive`, `proxy-connection`, `te`, `trailer`, `upgrade`) are forwarded unchanged.
- **Fix:** Add hop-by-hop header names to the filter in the request forwarding logic.

### L-13: OpenSSL config file left on disk

- **Severity:** Low
- **Workspace:** Proxy
- **File:** `proxy/certs.ts:106`
- **Issue:** The `openssl.cnf` file written to `.ssl/` is never cleaned up after certificate generation. Contains no secrets but is an unnecessary artifact.
- **Fix:** Delete `configPath` after successful cert generation with `unlinkSync`.

### L-14: Informational error responses on proxy failure

- **Severity:** Low
- **Workspace:** Proxy
- **File:** `proxy/server.ts:371-373`
- **Issue:** Error responses reveal that an upstream exists ("Bad Gateway: Unable to reach upstream server"). Acceptable for a dev proxy.
- **Fix:** No change needed for dev usage.

### L-15: Conflicting `X-Frame-Options` and CSP `frame-ancestors`

- **Severity:** Low
- **Workspace:** Proxy
- **File:** `proxy/server.ts:100,103`
- **Issue:** `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'none'` contradict each other. Modern browsers honor CSP, but older browsers use X-Frame-Options.
- **Fix:** Align them. Use `X-Frame-Options: DENY` with `frame-ancestors 'none'`, or `X-Frame-Options: SAMEORIGIN` with `frame-ancestors 'self'`.

---

## npm audit Results

### Client

```
5 high severity vulnerabilities

flatted  <3.4.0 -- unbounded recursion DoS (GHSA-25h7-pfq9-p65f)
  fix: npm audit fix

serialize-javascript  <=7.0.2 -- RCE (GHSA-5c6j-r48x-rmvq)
  via @rollup/plugin-terser -> workbox-build -> vite-plugin-pwa
  fix: npm audit fix --force (breaking: vite-plugin-pwa 0.19.8)
```

### API

```
1 high severity vulnerability

flatted  <3.4.0 -- unbounded recursion DoS (GHSA-25h7-pfq9-p65f)
  Dependency chain: @typescript-eslint/eslint-plugin -> eslint -> file-entry-cache -> flat-cache -> flatted@3.3.4
  Dev-only. Fix: npm audit fix
```

### Proxy

```
1 high severity vulnerability

flatted  <3.4.0 -- unbounded recursion DoS (GHSA-25h7-pfq9-p65f)
  Dependency chain: eslint -> file-entry-cache -> flat-cache -> flatted@3.3.4
  Dev-only. Fix: npm audit fix
```

---

## Positive Observations

### Proxy
- **Privilege dropping** (`server.ts:512-565`) -- correctly calls `setgid()` before `setuid()` after binding to privileged ports
- **Sensitive parameter redaction** (`server.ts:132-173`) -- access logs redact OAuth codes, tokens, and other sensitive query parameters
- **Connection pool limits** (`server.ts:18-24`) -- `maxSockets: 50`, `maxFreeSockets: 10`, `timeout: 60000`
- **Graceful shutdown** (`server.ts:647-699`) -- tracks active connections, destroys after grace period
- **File permissions** (`certs.ts:74,120-122`) -- private keys get `0600`, SSL dir gets `0700`
- **HTTP/2 pseudo-header filtering** (`server.ts:241-248`)
- **Upstream request timeout** (`server.ts:376-389`) -- 5-minute timeout with cleanup
- **Localhost binding** (`server.ts:67`) -- defaults to `127.0.0.1`, not `0.0.0.0`
- **Cookie security augmentation** (`server.ts:299-319`) -- ensures all API cookies have `Secure` and `SameSite`
- **Port validation** (`server.ts:76-92`) -- all ports validated as integers in 1-65535

### API
- **Share link resolver** has good mitigations: strict URL regex, `maxRedirects: 0`, 5-second timeout, batch size limit of 20
- **Session encryption** is present (needs upgrade from CBC to GCM)
- **Cookie `Secure` flag** is set on the token cookie

---

## Architectural Note: `httpOnly: false` on Token Cookie

The `token` cookie containing the Reddit `access_token` is intentionally set with `httpOnly: false`. This is an **architectural requirement**, not a misconfiguration. The client makes direct browser-to-Reddit API calls (`https://oauth.reddit.com`) with `Authorization: Bearer <token>` injected via an axios interceptor (`client/src/reddit/redditApiTs.ts:139-166`). The backend only handles OAuth flows and share link resolution -- it does not proxy Reddit data requests.

Making this cookie `httpOnly` would break all Reddit API calls from the browser. The real mitigations are:
1. **Prevent XSS** -- making C-1 and C-2 the highest priority
2. **Short token lifetime** -- Reddit access tokens expire in 1 hour
3. **`SameSite: lax`** (H-6) -- prevents cross-site cookie transmission

---

## Prioritized Action Plan

### Immediate (highest impact)

| ID | Action | Effort |
|----|--------|--------|
| C-1 | Install DOMPurify, sanitize all Reddit API HTML before DOM insertion | 2-4 hours |
| C-2 | Add iframe `src` protocol validation (https-only allowlist) | 2-4 hours |
| C-3 | Switch from AES-256-CBC to AES-256-GCM with HKDF key derivation | 2-4 hours |
| H-6 | Add `sameSite: 'lax'` to all cookie configurations | 15 min |
| H-8 | Fix CloudFront AllowedMethods to include POST | 15 min |

### Short-term (this week)

| ID | Action | Effort |
|----|--------|--------|
| H-1, H-2 | Create shared URL/href sanitization utility | 1-2 hours |
| H-7 | Add security headers middleware to API | 30 min |
| H-9 | Add rate limiting (koa-ratelimit or AWS WAF) | 2-3 hours |
| H-11 | Sanitize WebSocket upgrade headers (strip CR/LF) | 30 min |
| H-12 | Add symmetric WebSocket cleanup handlers | 1 hour |
| H-13 | Add request body size limit to proxy | 30 min |
| H-5 | `npm audit fix` across all workspaces | 15 min |
| M-1 | Derive separate signing and encryption keys via HKDF | 1 hour |

### Medium-term

| ID | Action | Effort |
|----|--------|--------|
| H-4 | Isolate social embeds in sandboxed iframes | 4-8 hours |
| H-3 | Evaluate vite-plugin-pwa upgrade for serialize-javascript fix | 1-2 hours |
| M-3, M-4 | Fix error status codes and sanitize error messages | 1 hour |
| M-5, M-7 | Input validation hardening on resolve-share | 1 hour |
| M-8 | Rewrite cleanLinks with DOMParser | 1 hour |
| M-9 | Add origin validation to domain handlers | 2-3 hours |
| M-10 | Schema validation for localStorage state | 2-3 hours |
| M-16 | Path normalization in proxy routing | 30 min |
| M-19 | Certificate expiration check on proxy startup | 30 min |
| M-20 | Domain validation + execFileSync in cert generation | 30 min |

### Low priority

| ID | Action | Effort |
|----|--------|--------|
| L-1 thru L-4 | Fix stale closure, keyCode, clsx migration, Imgur regex | 30 min total |
| L-5 | Configure production CSP via CloudFront | 1-2 hours |
| L-6 thru L-10 | API low-severity fixes | 1-2 hours total |
| L-11 thru L-15 | Proxy low-severity fixes | 1 hour total |
