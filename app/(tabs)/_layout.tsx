import { LanguageContext } from "@/constants/LanguageContext";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { ALL_SEARCH_LABELS, getSearchableItems } from "@/constants/SearchTerms";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { Tabs, router, useSegments } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, List, Portal, Searchbar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const GlobalHeader = (props: any) => {
  const { language } = useContext(LanguageContext);
  const segments = useSegments();
  const theme = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<any>(null);
  const headerRef = useRef<View>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const insets = useSafeAreaInsets();

  // Clear search state whenever the navigation path changes (switching tabs or views)
  useEffect(() => {
    setSearchQuery("");
    setIsSearching(false);
  }, [segments.join("/")]);

  // A pillar root is the entry-point for one of our four main tabs (Tenet 5 & 7).
  // We use route segments to identify the root index files of the pillar folders.
  // In Expo Router, the (tabs) group and the tab names form the first 1-2 segments.
  const isPillarRoot = segments.length <= 2;

  const isSubPage = !isPillarRoot;

  const title = props.options?.title;
  const backTo = props.options?.backTo;

  const searchLabels =
    ALL_SEARCH_LABELS[language as keyof typeof ALL_SEARCH_LABELS] ||
    ALL_SEARCH_LABELS.en;

  // Centralized list of everything searchable in the app
  const searchableItems = getSearchableItems(language);

  const results = searchableItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.includes(searchQuery.toLowerCase())),
  );

  const handleSelectResult = (item: (typeof searchableItems)[0]) => {
    const q = searchQuery.toLowerCase();
    setSearchQuery("");
    setIsSearching(false);
    searchRef.current?.blur();

    const targetParams = {
      highlight: q,
    };

    // If already on a subpage, replace to avoid history loops.
    // Otherwise, navigate normally into the stack.
    const navFn = isSubPage ? router.replace : router.navigate;

    navFn({
      pathname: item.route as any,
      params: targetParams,
    });
  };

  const glassBorder = theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <View
      style={[
        styles.headerWrapper,
        {
          borderBottomWidth: 0.5,
          borderBottomColor: glassBorder,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <Appbar.Header
        ref={headerRef}
        style={{ backgroundColor: "transparent", elevation: 0 }}
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          // In a PWA, we use the combined height of the inset (status bar) and the Appbar
          setHeaderHeight(height + insets.top);
        }}
      >
        {isSubPage && (
          <Appbar.BackAction
            onPress={() => {
              if (backTo) {
                router.navigate(backTo as any);
              } else if (segments.includes("you")) {
                router.navigate("/you" as any);
              } else if (segments.includes("resources")) {
                router.navigate("/resources" as any);
              } else if (segments.includes("community")) {
                router.navigate("/community" as any);
              } else {
                router.back();
              }
            }}
          />
        )}
        {isSubPage ? (
          <Appbar.Content
            title={title}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <Searchbar
              ref={searchRef}
              placeholder={searchLabels.searchPlaceholder}
              onChangeText={setSearchQuery}
              value={searchQuery}
              onFocus={() => setIsSearching(true)}
              blurOnSubmit={false}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (results.length > 0) {
                  handleSelectResult(results[0]);
                }
              }}
              onBlur={() => setTimeout(() => setIsSearching(false), 200)} // Delay to allow onPress to fire
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                elevation: 0,
                borderRadius: 24,
                height: 44,
                marginHorizontal: 12,
              }}
              inputStyle={{
                minHeight: 0,
                paddingBottom: 0,
                paddingTop: 0,
                fontSize: 16,
              }}
              iconColor={theme.colors.onSurfaceVariant}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
            {isSearching && searchQuery.length > 0 && results.length > 0 && (
              <Portal>
                <View
                  style={[
                    styles.resultsOverlay,
                    {
                      top: headerHeight,
                      backgroundColor: "transparent",
                      borderWidth: 0.5,
                      borderColor: glassBorder,
                    },
                  ]}
                >
                  <BlurView
                    intensity={50}
                    tint={theme.dark ? "dark" : "light"}
                    style={StyleSheet.absoluteFill}
                  />
                  {results.map((item, index) => (
                    <List.Item
                      key={index}
                      title={item.title}
                      left={(p) => (
                        <List.Icon
                          {...p}
                          icon={item.icon}
                          color={theme.colors.tertiary}
                        />
                      )}
                      onPress={() => handleSelectResult(item)}
                    />
                  ))}
                </View>
              </Portal>
            )}
          </View>
        )}
      </Appbar.Header>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  resultsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
});

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  focused: boolean;
}) {
  let iconName = props.name;

  // Logic to switch between solid and outline variants
  if (!props.focused) {
    iconName = `${props.name}-outline` as any;
  }

  return (
    <MaterialCommunityIcons
      name={iconName}
      size={DESIGN_TOKENS.ICON_SIZE_TAB}
      style={{ marginBottom: -3 }}
      color={props.color}
    />
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const { language } = useContext(LanguageContext);

  const allLabels = {
    en: {
      home: "Home",
      community: "Community",
      resources: "Resources",
      you: "You",
    },
    zh: {
      home: "首頁",
      community: "教會社群",
      resources: "資源庫",
      you: "您",
    },
    "zh-cn": {
      home: "首页",
      community: "教会社区",
      resources: "资源库",
      you: "您",
    },
    es: {
      home: "Inicio",
      community: "Comunidad",
      resources: "Recursos",
      you: "Tú",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.onBackground,
        tabBarInactiveTintColor: theme.colors.onBackground,
        headerTransparent: true,
        header: (props) => <GlobalHeader {...props} />,
        tabBarStyle: {
          position: "absolute",
          elevation: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              tint={theme.dark ? "dark" : "light"}
              intensity={50}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: labels.home,
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => <TabBarIcon name="home" color={color} focused={focused} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate("/");
          },
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: labels.community,
          headerShown: false, // Internal Stack handles header for consistency
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <TabBarIcon name="account-group" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate("/community");
          },
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: labels.resources,
          headerShown: false, // Internal Stack handles header for consistency
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <TabBarIcon
              name="bookmark-multiple"
              color={color}
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate("/resources");
          },
        }}
      />
      <Tabs.Screen
        name="you"
        options={
          {
            title: labels.you,
            headerShown: false, // Internal Stack handles header for consistency
            unmountOnBlur: true as any, // Ensures the stack resets when leaving the tab
            tabBarIcon: ({
              color,
              focused,
            }: {
              color: string;
              focused: boolean;
            }) => (
              <TabBarIcon
                name="account-circle"
                color={color}
                focused={focused}
              />
            ),
          } as any
        }
        listeners={{
          tabPress: (e) => {
            // Ensure the You stack resets to its root whenever the tab is pressed.
            // This solves the "stuck" state after navigating to sub-pages from Home.
            e.preventDefault();
            router.navigate("/you");
          },
        }}
      />
    </Tabs>
  );
}
