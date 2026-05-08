import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, router, useSegments } from "expo-router";
import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, List, Portal, Searchbar, useTheme } from "react-native-paper";
import { LanguageContext } from "../_layout";

export const GlobalHeader = (props: any) => {
  const { language } = useContext(LanguageContext);
  const segments = useSegments();
  const theme = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const isMoreSubPage = segments.includes("more") && segments.length > 2;
  const title = props.options?.title;
  const backTo = props.options?.backTo;

  const allSearchLabels = {
    en: {
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
        keywords: ["contact", "email", "phone", "location"],
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
        keywords: ["聯絡", "電子郵件", "電話", "地點", "connect", "contact"],
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
        keywords: ["联络", "电子邮件", "电话", "地点", "connect", "contact"],
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
          "connect",
          "contact",
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
      onPress: () => router.navigate("/"),
    },
    {
      ...searchLabels.sermons,
      icon: "book-open-variant",
      onPress: () => router.navigate("/sermons"),
    },
    {
      ...searchLabels.calendar,
      icon: "calendar",
      onPress: () => router.navigate("/calendar"),
    },
    {
      ...searchLabels.about,
      icon: "information",
      onPress: () =>
        router.navigate({ pathname: "/more", params: { highlight: "about" } }),
    },
    {
      ...searchLabels.connect,
      icon: "email",
      onPress: () =>
        router.navigate({
          pathname: "/more",
          params: { highlight: "contact" },
        }),
    },
    {
      ...searchLabels.give,
      icon: "gift",
      onPress: () =>
        router.navigate({ pathname: "/more", params: { highlight: "give" } }),
    },
    {
      ...searchLabels.language,
      icon: "translate",
      onPress: () =>
        router.navigate({
          pathname: "/more",
          params: { highlight: "language" },
        }),
    },
    {
      ...searchLabels.darkMode,
      icon: "theme-light-dark",
      onPress: () =>
        router.navigate({
          pathname: "/more",
          params: { highlight: "darkMode" },
        }),
    },
  ];

  const results = searchableItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.includes(searchQuery.toLowerCase())),
  );

  return (
    <Appbar.Header elevated>
      {isMoreSubPage && (
        <Appbar.BackAction
          onPress={() => (backTo ? router.navigate(backTo) : router.back())}
        />
      )}
      {isMoreSubPage ? (
        <Appbar.Content title={title} />
      ) : (
        <View style={{ flex: 1 }}>
          <Searchbar
            placeholder="Search app..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 200)} // Delay to allow onPress to fire
            style={{ backgroundColor: "transparent", elevation: 0 }}
          />
          {searchQuery.length > 0 && (
            <Portal>
              <View
                style={[
                  styles.resultsOverlay,
                  { backgroundColor: theme.colors.surface, top: 100 },
                ]}
              >
                {results.map((item, index) => (
                  <List.Item
                    key={index}
                    title={item.title}
                    left={(p) => <List.Icon {...p} icon={item.icon} />}
                    onPress={() => {
                      setSearchQuery("");
                      setIsSearching(false);
                      item.onPress();
                    }}
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
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
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
            <TabBarIcon name="book-open-variant" color={color} />
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
            <TabBarIcon name="calendar" color={color} />
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
        options={{
          title: labels.more,
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="dots-horizontal" color={color} />
          ),
        }}
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
