const { withProjectBuildGradle } = require("@expo/config-plugins");

const withAndroidSDKOverride = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addAndroidOverride(
        config.modResults.contents,
      );
    }
    return config;
  });
};

function addAndroidOverride(buildGradle) {
  const overrideBlock = `
allprojects {
  ext {
    kotlinVersion = "2.1.20"
  }
  tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).all {
    kotlinOptions {
      jvmTarget = "17"
    }
  }
}

subprojects {
  def configureAndroid = { p ->
    if (p.hasProperty('android')) {
      p.android {
        compileSdkVersion 36
        buildToolsVersion "36.0.0"
        defaultConfig {
          minSdkVersion 24
          targetSdkVersion 36
        }
      }
    }
  }
  if (it.state.executed) configureAndroid(it) else it.afterEvaluate { configureAndroid(it) }
}
`;

  // Check for the specific version to prevent duplicate injections
  if (!buildGradle.includes("compileSdkVersion 36")) {
    return buildGradle + overrideBlock;
  }
  return buildGradle;
}

module.exports = withAndroidSDKOverride;
