# SelfChronicle native wrapper (Capacitor)

Android project lives beside the PWA:

`examples/web/android/`

## Debug APK

```bash
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"   # JDK 21
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
cd examples/web
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

APK output: `examples/web/android/app/build/outputs/apk/debug/app-debug.apk`

First launch opens the Welcome source hub on an empty vault. Nothing is pre-seeded; the user chooses imports (GitHub username, site URL pointer, Drive pack, paste, etc.).
