const fs = require("fs");
const path = require("path");

// 1. Read the source of truth
const pkgPath = path.join(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version;

console.log(`Syncing version ${version} across configuration files...`);

// 2. Update app.json (Expo config)
const appJsonPath = path.join(__dirname, "../app.json");
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
  appJson.expo.version = version;
  // For Android/iOS specifically if you want to sync build numbers too:
  // appJson.expo.android.versionCode = parseInt(version.replace(/\./g, ''));
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");
  console.log("Successfully updated app.json");
}

// 3. Update sw.js (Service Worker)
const swPath = path.join(__dirname, "sw.js");
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, "utf8");
  // Regex targets the VERSION constant
  swContent = swContent.replace(
    /const VERSION = ".*";/,
    `const VERSION = "${version}";`,
  );
  fs.writeFileSync(swPath, swContent);
  console.log("Successfully updated sw.js");
}
