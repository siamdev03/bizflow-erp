# BizFlow Flutter mobile app (planned integration)

The local ZIP includes this mobile-app workspace marker and integration notes. The first runnable deliverable is the React web dashboard + Node API. A complete Flutter application is a separate build target and is not falsely represented as implemented in this MVP.

Suggested next commands:

```bash
flutter create bizflow_mobile
cd bizflow_mobile
flutter pub add dio flutter_riverpod go_router shared_preferences
```

Configure Dio's base URL to `http://10.0.2.2:4000/api` for Android Emulator, or your Mac's LAN IP for a physical Android device. Use the same JWT login endpoint (`POST /auth/login`).
