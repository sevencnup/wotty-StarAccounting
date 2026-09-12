# Web-shell App update checks

## Goal

The Capacitor Android app checks for a newer APK after launch. Browser Web builds do not request APK update metadata or show update prompts.

The update service is fixed at StarAccounting.wotty.app/api/app/version and is independent of the user cloud data URL.

## Implementation

- [x] Keep the backend /api/app/version endpoint.
- [x] Compare native app versions by versionCode.
- [x] Show an update prompt with changelog and APK download action.
- [x] Add a visible Check for updates entry in account settings.
- [x] Keep browser Web builds out of the APK update flow.
- [x] Use current Android version 0.0.84 / 84 as the client baseline.
- [x] Run Web tests, type checking, and production build.
- [x] Commit the implementation locally.
- [ ] Rebuild the APK when explicitly requested.

## Acceptance criteria

1. Android requests the fixed update service endpoint after launch.
2. An update prompt appears only when the server versionCode is greater than 84.
3. Browser Web builds do not request the version endpoint.
4. An apkUrl opens from the update prompt; a missing URL is reported clearly.
5. Update checks never block normal app usage.

## Version history

### 0.0.1

Created the APK update-check record.

### 0.0.2

Added native update checking, a manual settings entry, and the fixed StarAccounting update service.
