import {
  BAPTISMAL_VOWS,
  DIETARY_PRINCIPLES,
  FOUR_PILLARS,
  TEN_COMMANDMENTS,
} from '@/constants/DoctrineData';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { DocumentStyles } from '@/styles/DocumentStyles';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Card, List, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BaptismScreen() {
  const { language } = useContext(LanguageContext);
  const { backTo } = useLocalSearchParams();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const [expanded, setExpanded] = useState<string | null>(null);

  const allLabels = {
    en: {
      title: 'Joining the Church',
      baptismHeader: 'The Meaning of Baptism',
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
      pillarsTitle: 'Four Pillars of Church Life',
      vowsTitle: 'Baptismal Vows',
      commandmentsTitle: 'The Ten Commandments',
      lifestyleTitle: 'Christian Lifestyle',
    },
    zh: {
      title: '加入教會',
      baptismHeader: '受洗的意義',
      baptismQuote: '「信而受洗的必然得救。」',
      baptismRef: '馬可福音 16:16',
      processTitle: '受洗程序',
      processDesc:
        '如果你從未受洗成為基督徒，我們邀請您學習聖經和我們的基本信仰。當您明了並願意持守這信仰，就可以申請受洗。',
      professionTitle: '宣告認信',
      professionDesc:
        '如果你已在其他宗派奉三一真神之名全身入水受洗，可以通過學習並宣告認信加入。',
      transferTitle: '會籍轉移',
      transferDesc: '其他教會的 SDA 教友，可以通過正式的會籍轉移手續加入。',
      pillarsTitle: '教會生活的四大支柱',
      vowsTitle: '浸禮約言',
      commandmentsTitle: '十條誡命',
      lifestyleTitle: '基督徒的生活方式',
    },
    'zh-cn': {
      title: '加入教会',
      baptismHeader: '受洗的意义',
      baptismQuote: '“信而受洗的必然得救。”',
      baptismRef: '马可福音 16:16',
      processTitle: '受洗程序',
      processDesc:
        '如果你从未受洗成为基督徒，我们邀请您学习圣经和我们的基本信仰。当您明了并愿意持守这信仰，就可以申请受洗。',
      professionTitle: '宣告认信',
      professionDesc:
        '如果你已在其他宗派奉三一真神之名全身入水受洗，可以通过学习并宣告认信加入。',
      transferTitle: '会籍转移',
      transferDesc: '其他教会的 SDA 教友，可以通过正式的会籍转移手续加入。',
      pillarsTitle: '教会生活的四大支柱',
      vowsTitle: '浸礼约言',
      commandmentsTitle: '十条诫命',
      lifestyleTitle: '基督徒的生活方式',
    },
    es: {
      title: 'Unirse a la Iglesia',
      baptismHeader: 'El Significado del Bautismo',
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
      pillarsTitle: 'Cuatro Pilares de la Vida Eclesial',
      vowsTitle: 'Votos Bautismales',
      commandmentsTitle: 'Los Diez Mandamientos',
      lifestyleTitle: 'Estilo de Vida Cristiano',
    },
  };

  const langKey = (language as keyof typeof allLabels) || 'en';
  const labels = allLabels[langKey];
  const vows =
    BAPTISMAL_VOWS[langKey as keyof typeof BAPTISMAL_VOWS] || BAPTISMAL_VOWS.en;
  const commandments =
    TEN_COMMANDMENTS[langKey as keyof typeof TEN_COMMANDMENTS] || TEN_COMMANDMENTS.en;
  const pillars = FOUR_PILLARS[langKey as keyof typeof FOUR_PILLARS] || FOUR_PILLARS.en;
  const diet =
    DIETARY_PRINCIPLES[langKey as keyof typeof DIETARY_PRINCIPLES] ||
    DIETARY_PRINCIPLES.en;

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

        <View style={DocumentStyles.section}>
          <Text
            variant="titleLarge"
            style={[DocumentStyles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            {labels.pillarsTitle}
          </Text>
          <Card style={DocumentStyles.card} mode="contained">
            <Card.Content>
              {pillars.map((pillar, idx) => (
                <List.Item
                  key={idx}
                  title={pillar.title}
                  description={pillar.desc}
                  left={(props) => (
                    <List.Icon {...props} icon="pillar" color={theme.colors.primary} />
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        </View>

        <View style={DocumentStyles.section}>
          <List.Accordion
            title={labels.vowsTitle}
            expanded={expanded === 'vows'}
            onPress={() => setExpanded(expanded === 'vows' ? null : 'vows')}
            left={(props) => <List.Icon {...props} icon="check-decagram" />}
            style={{ backgroundColor: theme.colors.surface }}
          >
            <Card style={DocumentStyles.card} mode="outlined">
              <Card.Content>
                {vows.map((vow, idx) => (
                  <Text key={idx} style={{ marginBottom: 8 }}>
                    {idx + 1}. {vow}
                  </Text>
                ))}
              </Card.Content>
            </Card>
          </List.Accordion>

          <List.Accordion
            title={labels.commandmentsTitle}
            expanded={expanded === 'commandments'}
            onPress={() =>
              setExpanded(expanded === 'commandments' ? null : 'commandments')
            }
            left={(props) => <List.Icon {...props} icon="script-text" />}
            style={{ backgroundColor: theme.colors.surface }}
          >
            <Card style={DocumentStyles.card} mode="outlined">
              <Card.Content>
                {commandments.map((cmd, idx) => (
                  <Text key={idx} style={{ marginBottom: 8 }}>
                    {idx + 1}. {cmd}
                  </Text>
                ))}
              </Card.Content>
            </Card>
          </List.Accordion>

          <List.Accordion
            title={labels.lifestyleTitle}
            expanded={expanded === 'lifestyle'}
            onPress={() => setExpanded(expanded === 'lifestyle' ? null : 'lifestyle')}
            left={(props) => <List.Icon {...props} icon="heart-pulse" />}
            style={{ backgroundColor: theme.colors.surface }}
          >
            <Card style={DocumentStyles.card} mode="outlined">
              <Card.Content>
                <List.Item
                  title={diet.land}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="food-apple"
                      color={theme.colors.primary}
                    />
                  )}
                  titleNumberOfLines={3}
                />
                <List.Item
                  title={diet.water}
                  left={(props) => (
                    <List.Icon {...props} icon="fish" color={theme.colors.primary} />
                  )}
                  titleNumberOfLines={3}
                />
                <List.Item
                  title={diet.birds}
                  left={(props) => (
                    <List.Icon {...props} icon="bird" color={theme.colors.primary} />
                  )}
                  titleNumberOfLines={3}
                />
                <View
                  style={{
                    marginTop: 8,
                    padding: 12,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: 8,
                  }}
                >
                  <Text variant="bodyMedium" style={{ fontStyle: 'italic' }}>
                    {diet.lifestyle}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </List.Accordion>
        </View>
      </ScrollView>
    </>
  );
}
