import { openAdventistGiving } from '@/constants/ExternalLinks';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { DocumentStyles } from '@/styles/DocumentStyles';
import { Stack } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Paragraph, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GiveScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      title: 'Tithe & Offering',
      description:
        'Your faithful support allows us to serve our community and share the Gospel message of hope and healing.',
      cashSection: 'In-Person Giving',
      cashLabel: 'Sabbath Service',
      cashTitle: 'Cash',
      cashDesc:
        'We welcome cash donations during our weekly meetings. Envelopes are provided for your convenience to specify tithe or designate your gift to various offering categories and local ministries.',
      zelleSection: 'Electronic Transfer',
      zelleLabel: 'Direct Bank Transfer',
      zelleTitle: 'Zelle',
      zelleDesc:
        'Electronic transfers via Zelle are currently being established. Please check back soon for the official church handle.',
      zelleButton: 'Zelle (TBD)',
      onlineSection: 'Online Portal',
      onlineLabel: 'Official Platform',
      onlineTitle: 'AdventistGiving',
      onlineDesc:
        'AdventistGiving allows you to return your tithe and give your offerings online while you are at home or on the go.',
      onlineButton: 'AdventistGiving',
      quote: 'Kindness to the poor is a loan to the LORD, and He will repay the lender.',
      quoteRef: 'Proverbs 19:17',
      psalmQuote: 'The LORD is my shepherd; I shall not want.',
      psalmRef: 'Psalm 23:1',
      taxNote:
        'All donations are tax-deductible. As a registered 501(c)(3) non-profit organization, we issue tax receipts for all contributions at the end of the fiscal year.',
    },
    zh: {
      title: '奉獻',
      description: '您的忠心支持使我們能夠服務社群，並分享充滿希望與醫治的福音信息。',
      cashSection: '現場奉獻',
      cashLabel: '安息日聚會',
      cashTitle: '現金',
      cashDesc:
        '我們歡迎在每週聚會期間進行現金捐款。我們提供奉獻袋，方便您註明什一奉獻或將捐款指定用於特定的事工類別或在地項目。',
      zelleSection: '電子轉賬',
      zelleLabel: '直接銀行轉賬',
      zelleTitle: 'Zelle',
      zelleDesc: 'Zelle 電子轉賬正在建立中。請稍後查看教會賬號。',
      zelleButton: 'Zelle (待定)',
      onlineSection: '網上平台',
      onlineLabel: '官方平台',
      onlineTitle: 'AdventistGiving',
      onlineDesc:
        'AdventistGiving 讓您無論是在家或在外，都能在線歸還什一奉獻並進行捐款。',
      onlineButton: 'AdventistGiving',
      psalmQuote: '耶和華是我的牧者，我必不致缺乏。',
      psalmRef: '詩篇 23:1',
      quote: '憐憫貧窮的，就是借給耶和華；他的善行，耶和華必償還。',
      quoteRef: '箴言 19:17',
      taxNote:
        '所有捐款均可扣稅。作為註冊的 501(c)(3) 非營利組織，我們會在財政年度結束時為所有捐款提供報稅收據。',
    },
    'zh-cn': {
      title: '奉献',
      description: '您的忠心支持使我们能够服务社区，并分享充满希望与医治的福音信息。',
      cashSection: '现场奉献',
      cashLabel: '安息日聚会',
      cashTitle: '现金',
      cashDesc:
        '我们欢迎在每周聚会期间进行现金捐款。我们提供奉献袋，方便您注明什一奉献或将捐款指定用于特定的事工类别或本地项目。',
      zelleSection: '电子转账',
      zelleLabel: '直接银行转账',
      zelleTitle: 'Zelle',
      zelleDesc: 'Zelle 电子转账正在建立中。请稍后查看教会账号。',
      zelleButton: 'Zelle (待定)',
      onlineSection: '网上平台',
      onlineLabel: '官方平台',
      onlineTitle: 'AdventistGiving',
      onlineDesc:
        'AdventistGiving 让您无论是在家或在外，都能在线归还什一奉献并进行捐款。',
      onlineButton: 'AdventistGiving',
      psalmQuote: '耶和华是我的牧者，我必不致缺乏。',
      psalmRef: '诗篇 23:1',
      quote: '怜悯贫穷的，就是借给耶和华；他的善行，耶和华必偿还。',
      quoteRef: '箴言 19:17',
      taxNote:
        '所有捐款均可扣税。作为注册的 501(c)(3) 非营利组织，我们会在财政年度结束时为所有捐款提供报税收据。',
    },
    es: {
      title: 'Diezmos y Ofrendas',
      description:
        'Su apoyo fiel nos permite servir a nuestra comunidad y compartir el mensaje evangélico de esperanza y sanación.',
      cashSection: 'Donaciones en Persona',
      cashLabel: 'Servicio Sabático',
      cashTitle: 'Efectivo',
      cashDesc:
        'Aceptamos donaciones en efectivo durante nuestras reuniones semanales. Se proporcionan sobres para su conveniencia, permitiéndole especificar el diezmo o asignar su donación a diversas categorías de ofrendas y ministerios locales.',
      zelleSection: 'Transferencia Electrónica',
      zelleLabel: 'Transferencia Directa',
      zelleTitle: 'Zelle',
      zelleDesc:
        'Las transferencias electrónicas a través de Zelle se están estableciendo actualmente. Vuelva pronto para ver el identificador.',
      zelleButton: 'Zelle (TBD)',
      onlineSection: 'Portal en Línea',
      onlineLabel: 'Plataforma Oficial',
      onlineTitle: 'AdventistGiving',
      onlineDesc:
        'AdventistGiving le permite devolver su diezmo y dar sus ofrendas en línea mientras está en casa o fuera.',
      onlineButton: 'AdventistGiving',
      quote: 'A Jehová empresta el que da al pobre, y él le dará su paga.',
      quoteRef: 'Proverbios 19:17',
      psalmQuote: 'JEHOVÁ es mi pastor; nada me faltará.',
      psalmRef: 'Salmo 23:1',
      taxNote:
        'Todas las donaciones son deducibles de impuestos. Como organización sin fines de lucro 501(c)(3) registrada, emitimos recibos de impuestos por todas las contribuciones al final del año fiscal.',
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

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
          <Text
            variant="bodySmall"
            style={[
              DocumentStyles.note,
              { color: theme.colors.onSurfaceVariant, marginTop: 8 },
            ]}
          >
            {labels.taxNote}
          </Text>

          <Card
            style={{
              marginTop: 24,
              backgroundColor: theme.colors.surfaceVariant,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.secondary,
            }}
            mode="contained"
          >
            <Card.Content>
              <Text
                variant="bodyLarge"
                style={{
                  fontStyle: 'italic',
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                "{labels.quote}"
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
                — {labels.quoteRef}
              </Text>
            </Card.Content>
          </Card>

          <Card
            style={{
              marginTop: 12,
              backgroundColor: theme.colors.surfaceVariant,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.secondary,
            }}
            mode="contained"
          >
            <Card.Content>
              <Text
                variant="bodyLarge"
                style={{
                  fontStyle: 'italic',
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                "{labels.psalmQuote}"
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
                — {labels.psalmRef}
              </Text>
            </Card.Content>
          </Card>
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
            {labels.cashSection}
          </Text>
          <Card style={[DocumentStyles.card, DocumentStyles.orgCard]} mode="outlined">
            <Card.Content>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {labels.cashLabel}
              </Text>
              <Text
                variant="titleLarge"
                style={[DocumentStyles.orgName, { color: theme.colors.onSurface }]}
              >
                {labels.cashTitle}
              </Text>
              <Text
                style={[
                  DocumentStyles.description,
                  DocumentStyles.orgDesc,
                  { color: theme.colors.onSurface, fontSize: 14 },
                ]}
              >
                {labels.cashDesc}
              </Text>
            </Card.Content>
          </Card>
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
            {labels.onlineSection}
          </Text>
          <Card style={[DocumentStyles.card, DocumentStyles.orgCard]} mode="outlined">
            <Card.Content>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {labels.onlineLabel}
              </Text>
              <Text
                variant="titleLarge"
                style={[DocumentStyles.orgName, { color: theme.colors.onSurface }]}
              >
                {labels.onlineTitle}
              </Text>
              <Text
                style={[
                  DocumentStyles.description,
                  DocumentStyles.orgDesc,
                  { color: theme.colors.onSurface, fontSize: 14 },
                ]}
              >
                {labels.onlineDesc}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="open-in-new"
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                onPress={openAdventistGiving}
              >
                {labels.onlineButton}
              </Button>
            </Card.Actions>
          </Card>
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
            {labels.zelleSection}
          </Text>
          <Card style={[DocumentStyles.card, DocumentStyles.orgCard]} mode="outlined">
            <Card.Content>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {labels.zelleLabel}
              </Text>
              <Text
                variant="titleLarge"
                style={[DocumentStyles.orgName, { color: theme.colors.onSurface }]}
              >
                {labels.zelleTitle}
              </Text>
              <Text
                style={[
                  DocumentStyles.description,
                  DocumentStyles.orgDesc,
                  { color: theme.colors.onSurface, fontSize: 14 },
                ]}
              >
                {labels.zelleDesc}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="bank-transfer"
                disabled
                buttonColor={theme.colors.surfaceVariant}
                textColor={theme.colors.onSurfaceVariant}
              >
                {labels.zelleButton}
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}
