import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, router, useSegments } from "expo-router";
import React, { useContext } from "react";
import { Appbar, Searchbar, useTheme } from "react-native-paper";
import { LanguageContext } from "../_layout";

export const GlobalHeader = (props: any) => {
  const segments = useSegments();
  const isMoreSubPage = segments.includes("more") && segments.length > 2;
  // Get the title from the current screen's options
  const title = props.options?.title;
  const backTo = props.options?.backTo;

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
        <Searchbar
          placeholder="Search"
          value=""
          style={{ flex: 1, backgroundColor: "transparent", elevation: 0 }}
        />
      )}
    </Appbar.Header>
  );
};

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
