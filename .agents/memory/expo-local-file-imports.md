---
name: Expo local file imports
description: Android document-picker URI handling and Expo web bundling constraints for local text imports.
---

Use `copyToCacheDirectory: true` when selecting local files with Expo DocumentPicker, and explicitly copy any returned Android `content://` URI into `Paths.cache` before reading it. Read the cached file with the current `expo-file-system` `File` API.

**Why:** Provider-backed Android URIs are not guaranteed to be directly readable by `File.text()`. A static import of `expo-file-system/legacy` also caused Metro to return a 500 for the web import route, so the shared route should use the current API rather than the legacy subpath.

**How to apply:** Keep the import route platform-safe, log only filename/MIME/size/URI scheme/read counts, and report copy, read, decode, and parse failures separately.