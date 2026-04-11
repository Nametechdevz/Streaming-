#!/usr/bin/env bash
# =============================================================================
# build-apk.sh  –  Build IPTV Stream APK
# =============================================================================
# Usage:
#   ./build-apk.sh                  # cloud build (EAS) – production APK
#   ./build-apk.sh --preview        # cloud build (EAS) – preview APK (no store)
#   ./build-apk.sh --local          # local build (requires Android SDK + JDK)
# =============================================================================

set -e
cd "$(dirname "$0")"

PROFILE="production"
LOCAL=false

for arg in "$@"; do
  case $arg in
    --preview) PROFILE="preview" ;;
    --local)   LOCAL=true ;;
  esac
done

echo "========================================"
echo " IPTV Stream – APK Builder"
echo "========================================"

# 1. Install dependencies
echo ""
echo "[1/4] Installing npm dependencies..."
npm install

# 2. Generate assets
echo ""
echo "[2/4] Generating assets (icons, splash)..."
node generate-assets.js

# 3. Build
echo ""
if [ "$LOCAL" = true ]; then
  echo "[3/4] Running LOCAL build (expo prebuild + Gradle)..."
  echo "      Requires: Android SDK, JAVA_HOME set correctly."
  npx expo prebuild --platform android --clean
  cd android
  ./gradlew assembleRelease
  cd ..
  APK_PATH=$(find android/app/build/outputs/apk/release -name "*.apk" | head -1)
  echo ""
  echo "========================================"
  echo " APK ready: $APK_PATH"
  echo "========================================"
else
  echo "[3/4] Running CLOUD build via EAS (profile: $PROFILE)..."
  echo ""
  echo "      If not logged in, you will be prompted:"
  echo "      npx eas-cli login"
  echo ""
  npx eas-cli build --platform android --profile "$PROFILE" --non-interactive || {
    echo ""
    echo "  EAS build failed. Make sure you are logged in:"
    echo "    npx eas-cli login"
    echo "  Then update extra.eas.projectId in app.json:"
    echo "    npx eas-cli project:init"
    echo ""
    exit 1
  }
fi

echo ""
echo "[4/4] Done."
