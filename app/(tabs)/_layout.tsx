import { LanguageContext } from "@/constants/Contexts";
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

  const isMoreSubPage = segments.includes("more") && segments.length > 2;
  const title = props.options?.title;
  const backTo = props.options?.backTo;

  const allSearchLabels = {
    en: {
      searchPlaceholder: "Search app...",
      home: {
        title: "Home",
        keywords: ["welcome", "start", "pulse", "livestream", "happening"],
      },
      community: {
        title: "Community",
        keywords: [
          "events",
          "schedule",
          "sabbath",
          "groups",
          "volunteer",
          "in-person",
          "hub",
          "service",
          "roles",
        ],
      },
      resources: {
        title: "Resources",
        keywords: [
          "video",
          "preach",
          "message",
          "bible",
          "hymnal",
          "spiritual",
          "library",
          "pdf",
          "devotional",
          "reader",
        ],
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
          "address",
          "staff",
        ],
      },
      give: {
        title: "Give",
        keywords: ["tithe", "offering", "donation", "tithing"],
      },
      language: {
        title: "Language",
        keywords: ["chinese", "spanish", "english", "translate", "settings"],
      },
      darkMode: {
        title: "Dark Mode",
        keywords: ["theme", "appearance", "night", "settings", "dark"],
      },
    },
    zh: {
      searchPlaceholder: "搜尋...",
      home: {
        title: "首頁",
        keywords: ["歡迎", "開始", "home", "脈搏", "直播"],
      },
      community: {
        title: "教會社群",
        keywords: [
          "活動",
          "時間表",
          "安息日",
          "小組",
          "義工",
          "calendar",
          "community",
          "中心",
          "服事",
        ],
      },
      resources: {
        title: "資源庫",
        keywords: [
          "視頻",
          "證道",
          "信息",
          "聖經",
          "詩歌",
          "sermons",
          "resources",
          "圖書館",
          "靈修",
        ],
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
          "同工",
        ],
      },
      give: {
        title: "捐獻",
        keywords: ["什一", "奉獻", "捐款", "give", "tithe", "tithing"],
      },
      language: {
        title: "語言設定",
        keywords: ["中文", "英文", "西班牙文", "翻譯", "language", "設定"],
      },
      darkMode: {
        title: "深色模式",
        keywords: ["theme", "dark mode", "主題", "外觀", "settings", "深色"],
      },
    },
    "zh-cn": {
      searchPlaceholder: "搜索...",
      home: {
        title: "首页",
        keywords: ["欢迎", "开始", "home", "脉搏", "直播"],
      },
      community: {
        title: "教会社区",
        keywords: [
          "活动",
          "时间表",
          "安息日",
          "小组",
          "义工",
          "calendar",
          "community",
          "中心",
          "服事",
        ],
      },
      resources: {
        title: "资源库",
        keywords: [
          "视频",
          "证道",
          "信息",
          "圣经",
          "诗歌",
          "sermons",
          "resources",
          "图书馆",
          "灵修",
        ],
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
          "同工",
        ],
      },
      give: {
        title: "捐献",
        keywords: ["什一", "奉献", "捐款", "give", "tithe", "tithing"],
      },
      language: {
        title: "语言设置",
        keywords: ["中文", "英文", "西班牙文", "翻译", "language", "设置"],
      },
      darkMode: {
        title: "深色模式",
        keywords: ["theme", "dark mode", "主题", "外观", "settings", "深色"],
      },
    },
    es: {
      searchPlaceholder: "Buscar...",
      home: {
        title: "Inicio",
        keywords: ["bienvenido", "comenzar", "home", "pulso", "en vivo"],
      },
      community: {
        title: "Comunidad",
        keywords: [
          "eventos",
          "horario",
          "sábado",
          "grupos",
          "voluntario",
          "calendar",
          "community",
          "centro",
          "servicio",
        ],
      },
      resources: {
        title: "Recursos",
        keywords: [
          "video",
          "predicación",
          "mensaje",
          "biblia",
          "himnario",
          "sermons",
          "resources",
          "biblioteca",
          "devocional",
        ],
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
          "personal",
        ],
      },
      give: {
        title: "Dar",
        keywords: ["diezmo", "ofrenda", "donación", "give", "tithe", "diezmos"],
      },
      language: {
        title: "Idioma",
        keywords: [
          "chino",
          "español",
          "inglés",
          "traducir",
          "language",
          "ajustes",
        ],
      },
      darkMode: {
        title: "Modo oscuro",
        keywords: ["theme", "dark mode", "apariencia", "ajustes", "oscuro"],
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
      ...searchLabels.community,
      icon: "account-group",
      route: "/community",
      isPage: true,
    },
    {
      ...searchLabels.resources,
      icon: "book-open-variant",
      route: "/resources",
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
      ...searchLabels.darkMode,
      icon: "theme-light-dark",
      route: "/more",
      isPage: false,
      highlightKey: "darkMode",
    },
    {
      ...searchLabels.language,
      icon: "translate",
      route: "/more/language",
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
          <Appbar.Content
            title={title}
            titleStyle={{ color: theme.colors.primary, fontWeight: "bold" }}
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
              style={{ backgroundColor: "transparent", elevation: 0 }}
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
}) {
  return (
    <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const { language } = useContext(LanguageContext);
  const glassBorder = theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const allLabels = {
    en: {
      home: "Home",
      community: "Community",
      resources: "Resources",
      more: "More",
    },
    zh: {
      home: "首頁",
      community: "教會社群",
      resources: "資源庫",
      more: "更多",
    },
    "zh-cn": {
      home: "首页",
      community: "教会社区",
      resources: "资源库",
      more: "更多",
    },
    es: {
      home: "Inicio",
      community: "Comunidad",
      resources: "Recursos",
      more: "Más",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerTransparent: true,
        header: (props) => <GlobalHeader {...props} />,
        tabBarStyle: {
          position: "absolute",
          elevation: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderTopWidth: 0.5,
                borderTopColor: glassBorder,
              },
            ]}
          >
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
        name="community"
        options={{
          title: labels.community,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="account-group" color={color as string} />
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
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="book-open-variant" color={color as string} />
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
