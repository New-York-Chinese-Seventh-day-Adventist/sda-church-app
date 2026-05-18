import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { DocumentStyles } from '@/styles/DocumentStyles';
import { Stack } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { Avatar, Card, Paragraph, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeetOurTeamScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      title: 'Meet Our Team',
      description:
        'Our leadership is dedicated to serving the community and sharing the message of hope.',
      pastorsHeader: 'Pastoral Staff',
    },
    zh: {
      title: '認識我們的團隊',
      description: '我們的領導團隊致力於服務社群並分享希望的信息。',
      pastorsHeader: '教牧團隊',
    },
    'zh-cn': {
      title: '认识我们的团队',
      description: '我们的领导团队致力于服务社区并分享希望的信息。',
      pastorsHeader: '教牧团队',
    },
    es: {
      title: 'Conoce a nuestro equipo',
      description:
        'Nuestro liderazgo está dedicado a servir a la comunidad y compartir el mensaje de esperanza.',
      pastorsHeader: 'Personal Pastoral',
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  // Placeholder team data - this should be moved to a service or constant later
  const teamMembers = [
    { name: 'Pastor Name', role: 'Senior Pastor', initials: 'PN' },
    { name: 'Elder Name', role: 'Head Elder', initials: 'EN' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: labels.title }} />
      <ScrollView
        style={DocumentStyles.container}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40 }}
      >
        <View style={DocumentStyles.section}>
          <Text
            variant="headlineSmall"
            style={[DocumentStyles.docTitle, { color: theme.colors.onSurface }]}
          >
            {labels.title}
          </Text>
          <Paragraph
            style={[DocumentStyles.description, { color: theme.colors.onSurface }]}
          >
            {labels.description}
          </Paragraph>
        </View>

        <View style={DocumentStyles.section}>
          <Text
            variant="titleLarge"
            style={[
              DocumentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.pastorsHeader}
          </Text>

          {teamMembers.map((member, index) => (
            <Card
              key={index}
              style={[DocumentStyles.card, { marginBottom: 12 }]}
              mode="outlined"
            >
              <Card.Title
                title={member.name}
                subtitle={member.role}
                left={(props) => (
                  <Avatar.Text
                    {...props}
                    label={member.initials}
                    style={{ backgroundColor: theme.colors.tertiary }}
                  />
                )}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
