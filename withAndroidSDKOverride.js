const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
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
  tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
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
        defaultConfig { targetSdkVersion 36 }
      }
    }
  }
  if (it.state.executed) configureAndroid(it) else it.afterEvaluate { configureAndroid(it) }
}
`;
  if (!buildGradle.includes("subprojects {")) {
    return buildGradle + overrideBlock;
  }
  return buildGradle;
}
