# Changelog

All notable changes to JAKUTEN STORE project.

## [2.2.0] - 2026-06-25

### Changed
- **Updated all npm packages to latest versions**
  - body-parser: 1.20.5 → 2.3.0 (major update)
  - ejs: 3.1.10 → 6.0.1 (major update)
  - finalhandler: 1.3.2 → 2.1.1 (major update)
  - cookie-parser: 1.4.7 (already latest)
  - md5: 2.3.0 (already latest)
  - router: 2.2.0 (already latest)

### Security
- ✅ **0 vulnerabilities** maintained
- All packages on latest stable versions
- Reduced total dependencies from 67 to 57 packages

### Testing
- ✓ Server startup
- ✓ EJS template rendering
- ✓ Static file serving
- ✓ body-parser JSON/urlencoded parsing
- ✓ Database operations

## [2.1.0] - 2026-06-25

### Changed
- **router v1.3.8 → v2.2.0**
  - Updated wildcard syntax: `/*` → `/{*path}`
  - Fixed path-to-regexp ReDoS vulnerabilities
  - Breaking change: requires path pattern updates

### Security
- ✅ **0 vulnerabilities** (was 2 high severity)
- Eliminated path-to-regexp ReDoS issues (GHSA-9wv6-86v2-598j, GHSA-rhx6-c78j-4q9w, GHSA-37ch-88jc-xwx2)

### Files Modified
- `bin/server.js` - Updated route patterns to router v2 syntax
- `package.json` - Updated router dependency

## [2.0.0] - 2026-06-25

### Changed
- **Node.js v18 → v26.4.0**
- **sqlite3 package → node:sqlite module**
  - Removed external sqlite3 dependency
  - Using Node.js built-in SQLite support
  - No more native module compilation required

### Added
- `.node-version` and `.nvmrc` files for version management
- Comprehensive documentation (README.md, SETUP.md)
- Test scripts for server validation

### Removed
- sqlite3 package dependency
- postinstall script for binary setup
- Visual Studio Build Tools requirement

### Security
- Updated all dependencies to latest stable versions
- ✅ Reduced from 9 to 2 vulnerabilities (before router v2 update)

### Files Modified
- `bin/common/db.js` - Migrated to node:sqlite API
- `package.json` - Updated dependencies, removed sqlite3
- `.node-version`, `.nvmrc` - Set to Node.js v26.4.0

## [1.0.0] - Previous versions

Legacy version using:
- Node.js v14/v18
- sqlite3 v5.x with prebuilt binaries
- router v1.x
