import { MenuCard } from '@/components/MenuCard';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { NavigationStyles } from '@/styles/NavigationStyles';
import { Stack } from 'expo-router';
import { useContext } from 'react';
import { ScrollView } from 'react-native';
import { List } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const allLabels = {
  en: {
    title: 'Weekly Assignments',
    thisWeek: 'This Week',
    nextWeek: 'Next Week',
    roles: {
      deacon: 'Deacon in Charge',
      greeter: 'Greeter',
      av: 'Audio / Visual',
      pianist: 'Pianist',
    },
  },
  zh: {
    title: '每週服事表',
    thisWeek: '本週',
    nextWeek: '下週',
    roles: {
      deacon: '值班執事',
      greeter: '招待',
      av: '音響視訊',
      pianist: '司琴',
    },
  },
  'zh-cn': {
    title: '每周周报',
    thisWeek: '本周',
    nextWeek: '下周',
    roles: {
      deacon: '值班执事',
      greeter: '招待',
      av: '音响视讯',
      pianist: '司琴',
    },
  },
  es: {
    title: 'Asignaciones Semanales',
    thisWeek: 'Esta Semana',
    nextWeek: 'Próxima Semana',
    roles: {
      deacon: 'Diácono de Turno',
      greeter: 'Bienvenida',
      av: 'Audio / Visual',
      pianist: 'Pianista',
    },
  },
};

export default function RosterScreen() {
  const theme = useAppTheme();
  const { language } = useContext(LanguageContext);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;
  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  // Placeholder data - this would eventually come from a CMS or local constant
  const thisWeekData = [
    { role: labels.roles.deacon, name: 'TBD', icon: 'account-tie' },
    { role: labels.roles.greeter, name: 'TBD', icon: 'hand-wave' },
    { role: labels.roles.av, name: 'TBD', icon: 'microphone-variant' },
    { role: labels.roles.pianist, name: 'TBD', icon: 'piano' },
  ];

  const nextWeekData = [
    { role: labels.roles.deacon, name: 'TBD', icon: 'account-tie' },
    { role: labels.roles.greeter, name: 'TBD', icon: 'hand-wave' },
    { role: labels.roles.av, name: 'TBD', icon: 'microphone-variant' },
    { role: labels.roles.pianist, name: 'TBD', icon: 'piano' },
  ];

  const Section = ({ title, assignments }: { title: string; assignments: any[] }) => (
    <List.Section>
      <List.Subheader
        style={[NavigationStyles.subheader, { color: theme.colors.onBackground }]}
      >
        {title}
      </List.Subheader>
      {assignments.map((item, index) => (
        <MenuCard
          key={index}
          title={item.role}
          description={item.name}
          icon={item.icon as any}
          rightIcon={null}
          style={index < assignments.length - 1 ? { marginBottom: 12 } : undefined}
        />
      ))}
    </List.Section>
  );

  return (
    <>
      <Stack.Screen options={{ title: labels.title }} />
      <ScrollView
        style={NavigationStyles.container}
        contentContainerStyle={[
          NavigationStyles.contentContainer,
          { paddingTop: headerHeight, paddingBottom: 40 },
        ]}
      >
        <Section title={labels.thisWeek} assignments={thisWeekData} />
        <Section title={labels.nextWeek} assignments={nextWeekData} />
      </ScrollView>
    </>
  );
}
