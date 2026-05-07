import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { LanguageContext } from "../_layout";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { language } = useContext(LanguageContext);

  const labels = {
    home:
      { en: "Home", zh: "首頁", "zh-cn": "首页", es: "Inicio" }[
        language as "en" | "zh" | "zh-cn" | "es"
      ] || "Home",
    sermons:
      { en: "Sermons", zh: "講道回顧", "zh-cn": "讲道回顾", es: "Sermones" }[
        language as "en" | "zh" | "zh-cn" | "es"
      ] || "Sermons",
    calendar:
      { en: "Calendar", zh: "教會日曆", "zh-cn": "教会日历", es: "Calendario" }[
        language as "en" | "zh" | "zh-cn" | "es"
      ] || "Calendar",
    more:
      { en: "More", zh: "更多", "zh-cn": "更多", es: "Más" }[
        language as "en" | "zh" | "zh-cn" | "es"
      ] || "More",
  };

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: labels.home,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sermons"
        options={{
          title: labels.sermons,
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
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
      />
      <Tabs.Screen
        name="more"
        options={{
          title: labels.more,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="ellipsis-h" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
