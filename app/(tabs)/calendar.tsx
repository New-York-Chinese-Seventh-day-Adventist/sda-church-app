import React, { useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, List, useTheme } from "react-native-paper";
import { LanguageContext } from "../_layout";

export default function CalendarScreen() {
  const theme = useTheme();
  const { language } = useContext(LanguageContext);

  const allLabels = {
    en: {
      header: "Calendar",
      elmhurstTitle: "Elmhurst",
      brooklynTitle: "Brooklyn (Bay Ridge)",
      flushingFellowshipTitle: "Flushing Fellowship (Mandarin)",
      saturday: "Saturday",
      thursday: "Thursday",
      locations: {
        f1: "1st Floor",
        f2: "2nd Floor",
        f3: "3rd Floor",
        basement: "Basement",
      },
      eventNames: {
        song: "Song Service",
        ss: "Sabbath School / Small Groups",
        worship: "Worship Service",
        lunch: "Fellowship Lunch",
        youth: "Youth Ministry (Ages 8-18)",
        choir: "Choir Practice",
        closing: "Free Time & Closing",
        brooklynSS: "Song Service & Sabbath School",
        brooklynWorship: "Worship Service & Sermon",
        brooklynLunch: "Fellowship Lunch",
        dinner: "Dinner & Devotion",
      },
    },
    zh: {
      header: "教會日曆",
      elmhurstTitle: "艾姆赫斯特",
      brooklynTitle: "布魯克林 (Bay Ridge)",
      flushingFellowshipTitle: "法拉盛團契 (國語)",
      saturday: "星期六",
      thursday: "星期四",
      locations: {
        f1: "1 樓",
        f2: "2 樓",
        f3: "3 樓",
        basement: "地下室",
      },
      eventNames: {
        song: "讚美詩歌",
        ss: "安息日學 / 小組聚會",
        worship: "崇拜聚會",
        lunch: "教會午餐 (愛筵)",
        youth: "青年事工 (8-18 歲)",
        choir: "詩班練習",
        closing: "自由交流與結束",
        brooklynSS: "詩歌崇拜 & 安息日學",
        brooklynWorship: "崇拜聚會 & 證道",
        brooklynLunch: "團契午餐",
        dinner: "晚餐與靈修",
      },
    },
    "zh-cn": {
      header: "教会日历",
      elmhurstTitle: "艾姆赫斯特",
      brooklynTitle: "布鲁克林 (Bay Ridge)",
      flushingFellowshipTitle: "法拉盛团契 (国语)",
      saturday: "星期六",
      thursday: "星期四",
      locations: {
        f1: "1 楼",
        f2: "2 楼",
        f3: "3 楼",
        basement: "地下室",
      },
      eventNames: {
        song: "赞美诗歌",
        ss: "安息日学 / 小组聚会",
        worship: "崇拜聚会",
        lunch: "教会午餐 (爱筵)",
        youth: "青年事工 (8-18 岁)",
        choir: "诗班练习",
        closing: "自由交流与结束",
        brooklynSS: "诗歌崇拜 & 安息日学",
        brooklynWorship: "崇拜聚会 & 证道",
        brooklynLunch: "团契午餐",
        dinner: "晚餐与灵修",
      },
    },
    es: {
      header: "Calendario",
      elmhurstTitle: "Elmhurst",
      brooklynTitle: "Brooklyn (Bay Ridge)",
      flushingFellowshipTitle: "Compañerismo en Flushing (Mandarín)",
      saturday: "Sábado",
      thursday: "Jueves",
      locations: {
        f1: "1er Piso",
        f2: "2do Piso",
        f3: "3er Piso",
        basement: "Sótano",
      },
      eventNames: {
        song: "Servicio de Canto",
        ss: "Escuela Sabática / Grupos Pequeños",
        worship: "Servicio de Adoración",
        lunch: "Almuerzo de Compañerismo",
        youth: "Ministerio Juvenil (Ages 8-18)",
        choir: "Práctica del Coro",
        closing: "Tiempo Libre y Cierre",
        brooklynSS: "Canto y Escuela Sabática",
        brooklynWorship: "Adoración y Sermón",
        brooklynLunch: "Almuerzo de Compañerismo",
        dinner: "Cena y Devoción",
      },
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  const elmhurstEvents = [
    {
      title: labels.eventNames.song,
      time: `${labels.saturday}, 10:00 AM`,
      loc: labels.locations.f3,
      icon: "music-note",
    },
    {
      title: labels.eventNames.ss,
      time: `${labels.saturday}, 10:30 AM`,
      loc: `${labels.locations.f2} / ${labels.locations.f3}`,
      icon: "book-open-variant",
    },
    {
      title: labels.eventNames.youth,
      time: `${labels.saturday}, 10:30 AM`,
      loc: labels.locations.f2,
      icon: "account-group",
    },
    {
      title: labels.eventNames.worship,
      time: `${labels.saturday}, 11:30 AM`,
      loc: labels.locations.f3,
      icon: "church",
    },
    {
      title: labels.eventNames.lunch,
      time: `${labels.saturday}, 1:00 PM`,
      loc: labels.locations.basement,
      icon: "silverware-fork-knife",
    },
    {
      title: labels.eventNames.choir,
      time: `${labels.saturday}, 2:00 PM`,
      loc: labels.locations.f2,
      icon: "microphone",
    },
    {
      title: labels.eventNames.closing,
      time: `${labels.saturday}, 3:00 PM`,
      loc: labels.locations.basement,
      icon: "clock-outline",
    },
  ];

  const brooklynEvents = [
    {
      title: labels.eventNames.brooklynSS,
      time: `${labels.saturday}, 10:00 - 11:30 AM`,
      loc: labels.locations.f3,
      icon: "music-note",
    },
    {
      title: labels.eventNames.brooklynWorship,
      time: `${labels.saturday}, 11:45 AM - 12:30 PM`,
      loc: labels.locations.f3,
      icon: "church",
    },
    {
      title: labels.eventNames.brooklynLunch,
      time: `${labels.saturday}, 12:30 - 1:00 PM`,
      loc: labels.locations.f3,
      icon: "silverware-fork-knife",
    },
  ];

  const otherEvents = [
    {
      title: labels.eventNames.dinner,
      time: `${labels.thursday}, 6:30 - 8:00 PM`,
      loc: labels.locations.basement,
      icon: "silverware-fork-knife",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <List.Section>
        <List.Subheader style={styles.subheader}>
          {labels.elmhurstTitle}
        </List.Subheader>
        {elmhurstEvents.map((event, index) => (
          <View key={`elm-${index}`}>
            <List.Item
              title={event.title}
              description={`${event.time} • ${event.loc}`}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={event.icon}
                  color={theme.colors.primary}
                />
              )}
            />
            {index < elmhurstEvents.length - 1 && <Divider inset />}
          </View>
        ))}
      </List.Section>

      <List.Section>
        <List.Subheader style={styles.subheader}>
          {labels.brooklynTitle}
        </List.Subheader>
        {brooklynEvents.map((event, index) => (
          <View key={`brk-${index}`}>
            <List.Item
              title={event.title}
              description={`${event.time} • ${event.loc}`}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={event.icon}
                  color={theme.colors.primary}
                />
              )}
            />
            {index < brooklynEvents.length - 1 && <Divider inset />}
          </View>
        ))}
      </List.Section>

      <List.Section>
        <List.Subheader style={styles.subheader}>
          {labels.flushingFellowshipTitle}
        </List.Subheader>
        {otherEvents.map((event, index) => (
          <View key={`oth-${index}`}>
            <List.Item
              title={event.title}
              description={`${event.time} • ${event.loc}`}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={event.icon}
                  color={theme.colors.primary}
                />
              )}
            />
            {index < otherEvents.length - 1 && <Divider inset />}
          </View>
        ))}
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  subheader: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#0061A4",
  },
});
