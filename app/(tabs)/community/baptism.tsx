import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { DocumentStyles } from '@/styles/DocumentStyles';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BaptismScreen() {
  const { language } = useContext(LanguageContext);
  const { backTo } = useLocalSearchParams();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      title: 'Joining the Church',
      baptismHeader: 'Baptism',
      baptismQuote: '“Whoever believes and is baptized will be saved.”',
      baptismRef: 'Mark 16:16',
      processTitle: 'The Path to Baptism',
      processDesc:
        'To join through baptism, we invite you to study our biblical doctrines first. Afterward, you will make a public declaration of faith and submit an application for the church to arrange your baptismal service.',
      professionTitle: 'Profession of Faith',
      professionDesc:
        'Brothers and sisters who have already been baptized in another Christian denomination may join our community through a public profession of faith.',
      transferTitle: 'Membership Transfer',
      transferDesc:
        'If you are currently a member of another Seventh-day Adventist congregation, you can become a part of our local church through a formal membership transfer.',
    },
    zh: {
      title: '加入教會',
      baptismHeader: '受洗事項',
      baptismQuote: '「信而受洗的必然得救。」',
      baptismRef: '馬可福音 16:16',
      processTitle: '受洗程序',
      processDesc:
        '受洗前需要先學習我們的信仰教義，然後公開宣告信仰，申請加入教會，我們將為您安排受洗。',
      professionTitle: '宣告認信',
      professionDesc:
        '已經在其他的教會受洗的弟兄姐妹，可以通過宣告信仰的方式，加入教會。',
      transferTitle: '會籍轉移',
      transferDesc: '其他教會的 SDA 教友，可以通過教友的會籍轉移，轉移到我們的教會。',
    },
    'zh-cn': {
      title: '加入教会',
      baptismHeader: '受洗事项',
      baptismQuote: '“信而受洗的必然得救。”',
      baptismRef: '马可福音 16:16',
      processTitle: '受洗程序',
      processDesc:
        '受洗前需要先学习我们的信仰教义，然后公开宣告信仰，申请加入教会，我们将为您安排受洗。',
      professionTitle: '宣告认信',
      professionDesc:
        '已经在其他的教会受洗的弟兄姐妹，可以通过宣告信仰的方式，加入教会。',
      transferTitle: '会籍转移',
      transferDesc: '其他教会的 SDA 教友，可以通过教友的会籍转移，转移到我们的教会。',
    },
    es: {
      title: 'Unirse a la Iglesia',
      baptismHeader: 'Bautismo',
      baptismQuote: '“El que creyere y fuere bautizado, será salvo.”',
      baptismRef: 'Marcos 16:16',
      processTitle: 'El Camino al Bautismo',
      processDesc:
        'Para unirse a través del bautismo, le invitamos a estudiar primero nuestras doctrinas bíblicas. Después, hará una declaración pública de fe y presentará una solicitud para que la iglesia organice su servicio bautismal.',
      professionTitle: 'Profesión de Fe',
      professionDesc:
        'Los hermanos y hermanas que ya han sido bautizados en otra denominación cristiana pueden unirse a nuestra comunidad a través de una profesión pública de fe.',
      transferTitle: 'Traslado de Membresía',
      transferDesc:
        'Si actualmente es miembro de otra congregación Adventista del Séptimo Día, puede formar parte de nuestra iglesia local mediante un traslado formal de membresía.',
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <Stack.Screen options={{ title: labels.title, backTo } as any} />
      <ScrollView
        style={DocumentStyles.container}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: insets.bottom + 50,
        }}
      >
        <View style={DocumentStyles.section}>
          <Text
            variant="headlineSmall"
            style={[DocumentStyles.docTitle, { color: theme.colors.onSurface }]}
          >
            {labels.baptismHeader}
          </Text>
          <Card
            style={[
              DocumentStyles.card,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary,
              },
            ]}
            mode="contained"
          >
            <Card.Content>
              <Text
                variant="bodyLarge"
                style={{
                  fontStyle: 'italic',
                  color: theme.colors.onSurfaceVariant,
                  textAlign: 'center',
                }}
              >
                {labels.baptismQuote}
              </Text>
              <Text
                variant="labelMedium"
                style={{
                  textAlign: 'right',
                  marginTop: 8,
                  fontWeight: 'bold',
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                — {labels.baptismRef}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={DocumentStyles.section}>
          <Card style={DocumentStyles.card} mode="outlined">
            <Card.Content>
              <Text
                variant="titleLarge"
                style={[DocumentStyles.orgName, { color: theme.colors.primary }]}
              >
                {labels.processTitle}
              </Text>
              <Text
                style={[
                  DocumentStyles.description,
                  { color: theme.colors.onSurface, marginTop: 8 },
                ]}
                variant="bodyMedium"
              >
                {labels.processDesc}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={DocumentStyles.section}>
          <Card style={DocumentStyles.card} mode="outlined">
            <Card.Content>
              <Text
                variant="titleLarge"
                style={[
                  DocumentStyles.orgName,
                  { color: theme.colors.onSurface, fontWeight: 'bold' },
                ]}
              >
                {labels.professionTitle}
              </Text>
              <Text
                style={[
                  DocumentStyles.description,
                  { color: theme.colors.onSurface, marginTop: 8 },
                ]}
                variant="bodyMedium"
              >
                {labels.professionDesc}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={DocumentStyles.section}>
          <Card style={DocumentStyles.card} mode="outlined">
            <Card.Content>
              <Text
                variant="titleLarge"
                style={[
                  DocumentStyles.orgName,
                  { color: theme.colors.onSurface, fontWeight: 'bold' },
                ]}
              >
                {labels.transferTitle}
              </Text>
              <Text
                style={[
                  DocumentStyles.description,
                  { color: theme.colors.onSurface, marginTop: 8 },
                ]}
                variant="bodyMedium"
              >
                {labels.transferDesc}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}
