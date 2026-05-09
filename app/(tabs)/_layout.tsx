import { LanguageContext } from "@/constants/Contexts";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, router, useSegments } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
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

  const isMoreSubPage = segments.includes("more") && segments.length > 2;
  const title = props.options?.title;
  const backTo = props.options?.backTo;

  const allSearchLabels = {
    en: {
      searchPlaceholder: "Search app...",
      home: { title: "Home", keywords: ["welcome", "start"] },
      sermons: {
        title: "Sermons",
        keywords: ["video", "preach", "message", "spotify", "youtube"],
      },
      calendar: {
        title: "Calendar",
        keywords: ["events", "schedule", "sabbath"],
      },
      about: { title: "About Us", keywords: ["history", "beliefs", "church"] },
      connect: {
        title: "Connect",
        keywords: [
          "contact",
          "email",
          "phone",
          "location",
          "call",
          "map",
          "directions",
          "directions",
          "address",
        ],
      },
      give: { title: "Give", keywords: ["tithe", "offering", "donation"] },
      language: {
        title: "Language",
        keywords: ["chinese", "spanish", "english", "translate"],
      },
      darkMode: {
        title: "Dark Mode",
        keywords: ["theme", "appearance", "night", "settings"],
      },
    },
    zh: {
      searchPlaceholder: "搜尋...",
      home: { title: "首頁", keywords: ["歡迎", "開始", "home"] },
      sermons: {
        title: "講道播客",
        keywords: ["視頻", "證道", "信息", "spotify", "youtube", "sermons"],
      },
      calendar: {
        title: "教會日曆",
        keywords: ["活動", "時間表", "安息日", "calendar"],
      },
      about: { title: "關於我們", keywords: ["歷史", "信仰", "教會", "about"] },
      connect: {
        title: "聯繫我們",
        keywords: [
          "聯絡",
          "電子郵件",
          "電話",
          "地點",
          "電郵",
          "地圖",
          "導航",
          "地址",
          "路線",
          "connect",
          "contact",
          "email",
          "phone",
          "call",
          "map",
        ],
      },
      give: {
        title: "捐獻",
        keywords: ["什一", "奉獻", "捐款", "give", "tithe"],
      },
      language: {
        title: "語言設定",
        keywords: ["中文", "英文", "西班牙文", "翻譯", "language"],
      },
      darkMode: {
        title: "深色模式",
        keywords: ["theme", "dark mode", "主題", "外觀", "settings"],
      },
    },
    "zh-cn": {
      searchPlaceholder: "搜索...",
      home: { title: "首页", keywords: ["欢迎", "开始", "home"] },
      sermons: {
        title: "讲道播客",
        keywords: ["视频", "证道", "信息", "spotify", "youtube", "sermons"],
      },
      calendar: {
        title: "教会日历",
        keywords: ["活动", "时间表", "安息日", "calendar"],
      },
      about: { title: "关于我们", keywords: ["历史", "信仰", "教会", "about"] },
      connect: {
        title: "联系我们",
        keywords: [
          "联络",
          "电子邮件",
          "电话",
          "地点",
          "电邮",
          "地图",
          "导航",
          "地址",
          "路线",
          "connect",
          "contact",
          "email",
          "phone",
          "call",
          "map",
        ],
      },
      give: {
        title: "捐献",
        keywords: ["什一", "奉献", "捐款", "give", "tithe"],
      },
      language: {
        title: "语言设置",
        keywords: ["中文", "英文", "西班牙文", "翻译", "language"],
      },
      darkMode: {
        title: "深色模式",
        keywords: ["theme", "dark mode", "主题", "外观", "settings"],
      },
    },
    es: {
      searchPlaceholder: "Buscar...",
      home: { title: "Inicio", keywords: ["bienvenido", "comenzar", "home"] },
      sermons: {
        title: "Sermones",
        keywords: [
          "video",
          "predicación",
          "mensaje",
          "spotify",
          "youtube",
          "sermons",
        ],
      },
      calendar: {
        title: "Calendario",
        keywords: ["eventos", "horario", "sábado", "calendar"],
      },
      about: {
        title: "Sobre Nosotros",
        keywords: ["historia", "creencias", "iglesia", "about"],
      },
      connect: {
        title: "Conéctate",
        keywords: [
          "contacto",
          "correo",
          "teléfono",
          "ubicación",
          "llamar",
          "mapa",
          "direcciones",
          "dirección",
          "connect",
          "contact",
          "email",
          "phone",
        ],
      },
      give: {
        title: "Dar",
        keywords: ["diezmo", "ofrenda", "donación", "give", "tithe"],
      },
      language: {
        title: "Idioma",
        keywords: ["chino", "español", "inglés", "traducir", "language"],
      },
      darkMode: {
        title: "Modo oscuro",
        keywords: ["theme", "dark mode", "apariencia", "ajustes"],
      },
    },
  };

  const searchLabels =
    allSearchLabels[language as keyof typeof allSearchLabels] ||
    allSearchLabels.en;

  // Centralized list of everything searchable in the app
  const searchableItems = [
    {
      ...searchLabels.home,
      icon: "home",
      route: "/",
      isPage: true,
    },
    {
      ...searchLabels.sermons,
      icon: "book-open-variant",
      route: "/sermons",
      isPage: true,
    },
    {
      ...searchLabels.calendar,
      icon: "calendar",
      route: "/calendar",
      isPage: true,
    },
    {
      ...searchLabels.about,
      icon: "information",
      route: "/more/about",
      isPage: true,
    },
    {
      ...searchLabels.connect,
      icon: "email",
      route: "/more/contact",
      isPage: true,
    },
    {
      ...searchLabels.give,
      icon: "gift",
      route: "/more",
      isPage: false,
      highlightKey: "give",
    },
    {
      ...searchLabels.language,
      icon: "translate",
      route: "/more/language",
      isPage: true,
    },
    {
      ...searchLabels.darkMode,
      icon: "theme-light-dark",
      route: "/more",
      isPage: false,
      highlightKey: "darkMode",
    },
  ];

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
      highlight: item.isPage
        ? item.title.toLowerCase().includes(q)
          ? undefined
          : q
        : (item as any).highlightKey,
    };

    // If already on a subpage, replace to avoid history loops.
    // Otherwise, navigate normally into the stack.
    const navFn = isMoreSubPage ? router.replace : router.navigate;

    navFn({
      pathname: item.route as any,
      params: targetParams,
    });
  };

  return (
    <Appbar.Header
      ref={headerRef}
      elevated
      onLayout={(e) => {
        const { y, height } = e.nativeEvent.layout;
        // iOS headers often report y=0 in onLayout despite the status bar offset.
        // Android headers (especially with Edge-to-Edge) provide the offset in 'y' or height.
        setHeaderHeight(
          Platform.OS === "ios" ? height + insets.top : y + height,
        );
      }}
    >
      {isMoreSubPage && (
        <Appbar.BackAction
          onPress={() => {
            if (backTo) {
              router.navigate(backTo as any);
            } else if (isMoreSubPage) {
              router.navigate("/more");
            } else {
              router.back();
            }
          }}
        />
      )}
      {isMoreSubPage ? (
        <Appbar.Content title={title} />
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
            style={{ backgroundColor: "transparent", elevation: 0 }}
          />
          {isSearching && searchQuery.length > 0 && results.length > 0 && (
            <Portal>
              <View
                style={[
                  styles.resultsOverlay,
                  { backgroundColor: theme.colors.surface, top: headerHeight },
                ]}
              >
                {results.map((item, index) => (
                  <List.Item
                    key={index}
                    title={item.title}
                    left={(p) => <List.Icon {...p} icon={item.icon} />}
                    onPress={() => handleSelectResult(item)}
                  />
                ))}
              </View>
            </Portal>
          )}
        </View>
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  resultsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}) {
  return (
    <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const { language } = useContext(LanguageContext);

  const allLabels = {
    en: {
      home: "Home",
      calendar: "Calendar",
      sermons: "Sermons",
      more: "More",
    },
    zh: { home: "首頁", calendar: "日曆", sermons: "講道", more: "更多" },
    "zh-cn": { home: "首页", calendar: "日历", sermons: "讲道", more: "更多" },
    es: {
      home: "Inicio",
      calendar: "Calendario",
      sermons: "Sermones",
      more: "Más",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        header: (props) => <GlobalHeader {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: labels.home,
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate("/");
          },
        }}
      />
      <Tabs.Screen
        name="sermons"
        options={{
          title: labels.sermons,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="book-open-variant" color={color as string} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate("/sermons");
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: labels.calendar,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color as string} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate("/calendar");
          },
        }}
      />
      <Tabs.Screen
        name="more"
        options={
          {
            title: labels.more,
            headerShown: false,
            unmountOnBlur: true as any, // Ensures the stack resets when leaving the tab
            tabBarIcon: ({ color }: { color: string }) => (
              <TabBarIcon name="dots-horizontal" color={color} />
            ),
          } as any
        }
        listeners={{
          tabPress: (e) => {
            // Ensure the More stack resets to its root whenever the tab is pressed.
            // This solves the "stuck" state after navigating to sub-pages from Home.
            e.preventDefault();
            router.navigate("/more");
          },
        }}
      />
    </Tabs>
  );
}
