import type { SupportedLanguage } from './LanguageContext';
import type {
  PwaInstallPlatform,
  PwaInstallStatus,
} from '../services/PwaInstallGuidance';

type StatusCopy = Readonly<{ label: string; description: string }>;
type ManualStepsCopy = Readonly<{
  label: string;
  steps: readonly string[];
}>;

export interface PwaInstallCopy {
  readonly menu: Readonly<{ title: string; description: string }>;
  readonly dialog: Readonly<{
    title: string;
    description: string;
    manualStepsHeading: string;
  }>;
  readonly status: Readonly<Record<PwaInstallStatus, StatusCopy>>;
  readonly errors: Readonly<{ requestFailed: string }>;
  readonly buttons: Readonly<{ install: string; close: string }>;
  readonly a11y: Readonly<{
    dialog: string;
    install: string;
    close: string;
    openGuide: string;
  }>;
  readonly manualSteps: Readonly<
    Record<PwaInstallPlatform, ManualStepsCopy>
  >;
}

export const PWA_INSTALL_COPY = {
  en: {
    menu: {
      title: 'Install this app',
      description: 'Open the church app quickly from your home screen.',
    },
    dialog: {
      title: 'Install the church app',
      description:
        'Installation options depend on your browser. If the Install button is unavailable, follow the manual steps below.',
      manualStepsHeading: 'Steps for this browser',
    },
    status: {
      'not-applicable': {
        label: 'Not available here',
        description: 'Installation guidance is available in the web app.',
      },
      unavailable: {
        label: 'Manual steps available',
        description: 'This browser did not offer an automatic install prompt.',
      },
      'prompt-available': {
        label: 'Ready to install',
        description: 'Your browser can show its installation prompt.',
      },
      accepted: {
        label: 'Request accepted',
        description:
          'Your browser accepted the request. Finish any remaining browser steps; acceptance alone does not confirm installation.',
      },
      dismissed: {
        label: 'Installation canceled',
        description:
          'No changes were made. You can try again or use the manual steps.',
      },
      error: {
        label: 'Could not request installation',
        description:
          'The browser install prompt failed. Use the manual steps or try again.',
      },
      standalone: {
        label: 'Installed',
        description:
          'The browser reports this app as installed, or it is running in installed app mode.',
      },
    },
    errors: {
      requestFailed: 'The browser could not open its install prompt.',
    },
    buttons: { install: 'Install', close: 'Close' },
    a11y: {
      dialog: 'App installation guidance',
      install: 'Ask the browser to install the app',
      close: 'Close app installation guidance',
      openGuide: 'Open app installation guidance',
    },
    manualSteps: {
      'ios-safari': {
        label: 'Safari on iPhone or iPad',
        steps: [
          'Tap the Share button in Safari.',
          'Choose Add to Home Screen. You may need to scroll the actions.',
          'Turn on Open as Web App.',
          'Review the name, then tap Add.',
        ],
      },
      'android-chrome': {
        label: 'Chrome on Android',
        steps: [
          'Open the Chrome menu (three dots).',
          'Choose Install app or Add to Home screen, if shown.',
          'Follow the browser confirmation.',
        ],
      },
      'android-edge': {
        label: 'Microsoft Edge on Android',
        steps: [
          'Open the Edge menu.',
          'Choose Add to phone, Add to Home screen, or Install app, if shown.',
          'Follow the browser confirmation.',
        ],
      },
      'android-firefox': {
        label: 'Firefox on Android',
        steps: [
          'Open the Firefox menu.',
          'Choose Install or Add to Home screen, if shown.',
          'Follow the browser confirmation.',
        ],
      },
      'android-other': {
        label: 'Another Android browser',
        steps: [
          'Open the browser menu.',
          'Look for Install app or Add to Home screen.',
          'If neither option appears, this browser may not offer installation for this site.',
        ],
      },
      'mac-safari': {
        label: 'Safari on Mac',
        steps: [
          "Click Safari's Share button in the toolbar.",
          'Choose Add to Dock, if shown.',
          'If Add to Dock is absent, this Safari version may not offer installation for this site.',
        ],
      },
      'desktop-chrome': {
        label: 'Google Chrome on a computer',
        steps: [
          'Select the install icon in the address bar, if shown.',
          'Otherwise open the Chrome menu, then Cast, save, and share, and choose Install page as app.',
          'Confirm the installation in the browser.',
        ],
      },
      'desktop-edge': {
        label: 'Microsoft Edge on a computer',
        steps: [
          'Open the Edge menu (three dots).',
          'Choose More tools, then Apps, then Install this site as an app, if shown.',
          'Confirm the installation in the browser.',
        ],
      },
      'desktop-chromium': {
        label: 'A Chromium browser on a computer',
        steps: [
          'Look for an install icon in the address bar.',
          'Or open the browser menu and choose an install-app option, if shown.',
          'If no install option appears, this browser may not offer installation for this site.',
        ],
      },
      'firefox-windows': {
        label: 'Firefox on Windows',
        steps: [
          'Select the web apps button in the address bar, if shown.',
          'Firefox adds the site to the Windows taskbar and Start menu.',
          'If the button is absent, update Firefox or save a bookmark.',
        ],
      },
      'firefox-other': {
        label: 'Firefox on this device',
        steps: [
          'Firefox desktop web apps are currently available only on Windows.',
          'Save a bookmark, or open this site in a browser that offers installation.',
          'Only proceed when the browser shows the expected website address.',
        ],
      },
      generic: {
        label: 'This browser',
        steps: [
          'Open the browser menu or sharing menu.',
          'Look for Install app or Add to Home screen.',
          'If no such option appears, this browser may not offer installation for this site.',
        ],
      },
    },
  },
  zh: {
    menu: {
      title: '安裝此應用程式',
      description: '從主畫面快速開啟教會應用程式。',
    },
    dialog: {
      title: '安裝教會應用程式',
      description:
        '安裝選項會依瀏覽器而異。如果「安裝」按鈕無法使用，請按照下方的手動步驟操作。',
      manualStepsHeading: '此瀏覽器的操作步驟',
    },
    status: {
      'not-applicable': {
        label: '此處無法使用',
        description: '網頁版應用程式中提供安裝說明。',
      },
      unavailable: {
        label: '可使用手動步驟',
        description: '此瀏覽器未提供自動安裝提示。',
      },
      'prompt-available': {
        label: '可以安裝',
        description: '您的瀏覽器可以顯示安裝提示。',
      },
      accepted: {
        label: '已接受要求',
        description:
          '瀏覽器已接受要求。請完成瀏覽器中的其餘步驟；接受要求本身並不代表安裝完成。',
      },
      dismissed: {
        label: '已取消安裝',
        description: '未進行任何變更。您可以重試或使用手動步驟。',
      },
      error: {
        label: '無法要求安裝',
        description: '瀏覽器安裝提示失敗。請使用手動步驟或重試。',
      },
      standalone: {
        label: '已安裝',
        description:
          '瀏覽器回報此應用程式已安裝，或應用程式正以已安裝的應用程式模式執行。',
      },
    },
    errors: { requestFailed: '瀏覽器無法開啟安裝提示。' },
    buttons: { install: '安裝', close: '關閉' },
    a11y: {
      dialog: '應用程式安裝說明',
      install: '要求瀏覽器安裝應用程式',
      close: '關閉應用程式安裝說明',
      openGuide: '開啟應用程式安裝說明',
    },
    manualSteps: {
      'ios-safari': {
        label: 'iPhone 或 iPad 上的 Safari',
        steps: [
          '點按 Safari 中的「分享」按鈕。',
          '選擇「加入主畫面」。您可能需要捲動操作選單。',
          '開啟「以網頁 App 方式開啟」。',
          '確認名稱後，點按「新增」。',
        ],
      },
      'android-chrome': {
        label: 'Android 上的 Chrome',
        steps: [
          '開啟 Chrome 選單（三個點）。',
          '如果有顯示，請選擇「安裝應用程式」或「加到主畫面」。',
          '按照瀏覽器的確認步驟操作。',
        ],
      },
      'android-edge': {
        label: 'Android 上的 Microsoft Edge',
        steps: [
          '開啟 Edge 選單。',
          '如果有顯示，請選擇「加到手機」、「加到主畫面」或「安裝應用程式」。',
          '按照瀏覽器的確認步驟操作。',
        ],
      },
      'android-firefox': {
        label: 'Android 上的 Firefox',
        steps: [
          '開啟 Firefox 選單。',
          '如果有顯示，請選擇「安裝」或「加到主畫面」。',
          '按照瀏覽器的確認步驟操作。',
        ],
      },
      'android-other': {
        label: '其他 Android 瀏覽器',
        steps: [
          '開啟瀏覽器選單。',
          '尋找「安裝應用程式」或「加到主畫面」。',
          '如果沒有這些選項，此瀏覽器可能不支援安裝此網站。',
        ],
      },
      'mac-safari': {
        label: 'Mac 上的 Safari',
        steps: [
          '點按 Safari 工具列中的「分享」按鈕。',
          '如果有顯示，請選擇「加入 Dock」。',
          '如果沒有「加入 Dock」，此 Safari 版本可能不支援安裝此網站。',
        ],
      },
      'desktop-chrome': {
        label: '電腦上的 Google Chrome',
        steps: [
          '如果網址列顯示安裝圖示，請選取該圖示。',
          '否則開啟 Chrome 選單，再開啟「投放、儲存及分享」，並選擇「將網頁安裝為應用程式」。',
          '在瀏覽器中確認安裝。',
        ],
      },
      'desktop-edge': {
        label: '電腦上的 Microsoft Edge',
        steps: [
          '開啟 Edge 選單（三個點）。',
          '依序選擇「更多工具」、「應用程式」，再選擇「將此網站安裝為應用程式」（如果有顯示）。',
          '在瀏覽器中確認安裝。',
        ],
      },
      'desktop-chromium': {
        label: '電腦上的 Chromium 瀏覽器',
        steps: [
          '尋找網址列中的安裝圖示。',
          '或開啟瀏覽器選單，選擇安裝應用程式的選項（如果有顯示）。',
          '如果沒有安裝選項，此瀏覽器可能不支援安裝此網站。',
        ],
      },
      'firefox-windows': {
        label: 'Windows 上的 Firefox',
        steps: [
          '如果網址列顯示網頁應用程式按鈕，請選取該按鈕。',
          'Firefox 會將網站加入 Windows 工作列和「開始」選單。',
          '如果沒有此按鈕，請更新 Firefox 或儲存書籤。',
        ],
      },
      'firefox-other': {
        label: '此裝置上的 Firefox',
        steps: [
          'Firefox 桌面版網頁應用程式目前只適用於 Windows。',
          '請儲存書籤，或使用提供安裝功能的瀏覽器開啟此網站。',
          '只有瀏覽器顯示預期的網站網址時才繼續。',
        ],
      },
      generic: {
        label: '此瀏覽器',
        steps: [
          '開啟瀏覽器選單或分享選單。',
          '尋找「安裝應用程式」或「加到主畫面」。',
          '如果沒有這些選項，此瀏覽器可能不支援安裝此網站。',
        ],
      },
    },
  },
  'zh-cn': {
    menu: {
      title: '安装此应用',
      description: '从主屏幕快速打开教会应用。',
    },
    dialog: {
      title: '安装教会应用',
      description:
        '安装选项会因浏览器而异。如果“安装”按钮不可用，请按照下方的手动步骤操作。',
      manualStepsHeading: '此浏览器的操作步骤',
    },
    status: {
      'not-applicable': {
        label: '此处不可用',
        description: '网页版应用中提供安装说明。',
      },
      unavailable: {
        label: '可使用手动步骤',
        description: '此浏览器未提供自动安装提示。',
      },
      'prompt-available': {
        label: '可以安装',
        description: '您的浏览器可以显示安装提示。',
      },
      accepted: {
        label: '已接受请求',
        description:
          '浏览器已接受请求。请完成浏览器中的其余步骤；接受请求本身并不表示安装完成。',
      },
      dismissed: {
        label: '已取消安装',
        description: '未进行任何更改。您可以重试或使用手动步骤。',
      },
      error: {
        label: '无法请求安装',
        description: '浏览器安装提示失败。请使用手动步骤或重试。',
      },
      standalone: {
        label: '已安装',
        description:
          '浏览器报告此应用已安装，或应用正以已安装的应用模式运行。',
      },
    },
    errors: { requestFailed: '浏览器无法打开安装提示。' },
    buttons: { install: '安装', close: '关闭' },
    a11y: {
      dialog: '应用安装说明',
      install: '请求浏览器安装应用',
      close: '关闭应用安装说明',
      openGuide: '打开应用安装说明',
    },
    manualSteps: {
      'ios-safari': {
        label: 'iPhone 或 iPad 上的 Safari',
        steps: [
          '轻点 Safari 中的“分享”按钮。',
          '选择“添加到主屏幕”。您可能需要滚动操作菜单。',
          '打开“作为网页 App 打开”。',
          '确认名称后，轻点“添加”。',
        ],
      },
      'android-chrome': {
        label: 'Android 上的 Chrome',
        steps: [
          '打开 Chrome 菜单（三个点）。',
          '如果显示，请选择“安装应用”或“添加到主屏幕”。',
          '按照浏览器的确认步骤操作。',
        ],
      },
      'android-edge': {
        label: 'Android 上的 Microsoft Edge',
        steps: [
          '打开 Edge 菜单。',
          '如果显示，请选择“添加到手机”“添加到主屏幕”或“安装应用”。',
          '按照浏览器的确认步骤操作。',
        ],
      },
      'android-firefox': {
        label: 'Android 上的 Firefox',
        steps: [
          '打开 Firefox 菜单。',
          '如果显示，请选择“安装”或“添加到主屏幕”。',
          '按照浏览器的确认步骤操作。',
        ],
      },
      'android-other': {
        label: '其他 Android 浏览器',
        steps: [
          '打开浏览器菜单。',
          '查找“安装应用”或“添加到主屏幕”。',
          '如果没有这些选项，此浏览器可能不支持安装此网站。',
        ],
      },
      'mac-safari': {
        label: 'Mac 上的 Safari',
        steps: [
          '轻点 Safari 工具栏中的“分享”按钮。',
          '如果显示，请选择“添加到程序坞”。',
          '如果没有“添加到程序坞”，此 Safari 版本可能不支持安装此网站。',
        ],
      },
      'desktop-chrome': {
        label: '电脑上的 Google Chrome',
        steps: [
          '如果地址栏显示安装图标，请选择该图标。',
          '否则打开 Chrome 菜单，再打开“投放、保存和分享”，并选择“将网页安装为应用”。',
          '在浏览器中确认安装。',
        ],
      },
      'desktop-edge': {
        label: '电脑上的 Microsoft Edge',
        steps: [
          '打开 Edge 菜单（三个点）。',
          '依次选择“更多工具”“应用”，再选择“将此站点安装为应用”（如果显示）。',
          '在浏览器中确认安装。',
        ],
      },
      'desktop-chromium': {
        label: '电脑上的 Chromium 浏览器',
        steps: [
          '查找地址栏中的安装图标。',
          '或打开浏览器菜单，选择安装应用的选项（如果显示）。',
          '如果没有安装选项，此浏览器可能不支持安装此网站。',
        ],
      },
      'firefox-windows': {
        label: 'Windows 上的 Firefox',
        steps: [
          '如果地址栏显示网页应用按钮，请选择该按钮。',
          'Firefox 会将网站添加到 Windows 任务栏和“开始”菜单。',
          '如果没有此按钮，请更新 Firefox 或保存书签。',
        ],
      },
      'firefox-other': {
        label: '此设备上的 Firefox',
        steps: [
          'Firefox 桌面版网页应用目前仅适用于 Windows。',
          '请保存书签，或使用提供安装功能的浏览器打开此网站。',
          '只有浏览器显示预期的网站地址时才继续。',
        ],
      },
      generic: {
        label: '此浏览器',
        steps: [
          '打开浏览器菜单或分享菜单。',
          '查找“安装应用”或“添加到主屏幕”。',
          '如果没有这些选项，此浏览器可能不支持安装此网站。',
        ],
      },
    },
  },
  es: {
    menu: {
      title: 'Instalar esta aplicación',
      description: 'Abre rápidamente la aplicación de la iglesia desde tu pantalla de inicio.',
    },
    dialog: {
      title: 'Instalar la aplicación de la iglesia',
      description:
        'Las opciones de instalación dependen del navegador. Si el botón Instalar no está disponible, sigue los pasos manuales.',
      manualStepsHeading: 'Pasos para este navegador',
    },
    status: {
      'not-applicable': {
        label: 'No disponible aquí',
        description: 'La guía de instalación está disponible en la aplicación web.',
      },
      unavailable: {
        label: 'Pasos manuales disponibles',
        description: 'Este navegador no ofreció una solicitud automática de instalación.',
      },
      'prompt-available': {
        label: 'Lista para instalar',
        description: 'Tu navegador puede mostrar la solicitud de instalación.',
      },
      accepted: {
        label: 'Solicitud aceptada',
        description:
          'El navegador aceptó la solicitud. Completa los pasos restantes; aceptar la solicitud no confirma por sí solo la instalación.',
      },
      dismissed: {
        label: 'Instalación cancelada',
        description: 'No se hizo ningún cambio. Puedes intentarlo de nuevo o usar los pasos manuales.',
      },
      error: {
        label: 'No se pudo solicitar la instalación',
        description: 'Falló la solicitud de instalación del navegador. Usa los pasos manuales o inténtalo de nuevo.',
      },
      standalone: {
        label: 'Instalada',
        description:
          'El navegador informa que esta aplicación está instalada o se está ejecutando en modo de aplicación instalada.',
      },
    },
    errors: { requestFailed: 'El navegador no pudo abrir la solicitud de instalación.' },
    buttons: { install: 'Instalar', close: 'Cerrar' },
    a11y: {
      dialog: 'Guía para instalar la aplicación',
      install: 'Pedir al navegador que instale la aplicación',
      close: 'Cerrar la guía para instalar la aplicación',
      openGuide: 'Abrir la guía para instalar la aplicación',
    },
    manualSteps: {
      'ios-safari': {
        label: 'Safari en iPhone o iPad',
        steps: [
          'Toca el botón Compartir de Safari.',
          'Elige Agregar a la pantalla de inicio. Es posible que debas desplazarte por las acciones.',
          'Activa Abrir como app web.',
          'Revisa el nombre y toca Agregar.',
        ],
      },
      'android-chrome': {
        label: 'Chrome en Android',
        steps: [
          'Abre el menú de Chrome (tres puntos).',
          'Elige Instalar aplicación o Agregar a la pantalla principal, si aparece.',
          'Sigue la confirmación del navegador.',
        ],
      },
      'android-edge': {
        label: 'Microsoft Edge en Android',
        steps: [
          'Abre el menú de Edge.',
          'Elige Agregar al teléfono, Agregar a inicio o Instalar aplicación, si aparece.',
          'Sigue la confirmación del navegador.',
        ],
      },
      'android-firefox': {
        label: 'Firefox en Android',
        steps: [
          'Abre el menú de Firefox.',
          'Elige Instalar o Agregar a la pantalla principal, si aparece.',
          'Sigue la confirmación del navegador.',
        ],
      },
      'android-other': {
        label: 'Otro navegador de Android',
        steps: [
          'Abre el menú del navegador.',
          'Busca Instalar aplicación o Agregar a la pantalla principal.',
          'Si no aparece ninguna opción, es posible que este navegador no permita instalar este sitio.',
        ],
      },
      'mac-safari': {
        label: 'Safari en Mac',
        steps: [
          'Haz clic en el botón Compartir de la barra de herramientas de Safari.',
          'Elige Agregar al Dock, si aparece.',
          'Si no aparece Agregar al Dock, es posible que esta versión de Safari no permita instalar este sitio.',
        ],
      },
      'desktop-chrome': {
        label: 'Google Chrome en una computadora',
        steps: [
          'Selecciona el icono de instalación de la barra de direcciones, si aparece.',
          'También puedes abrir el menú de Chrome, luego Transmitir, guardar y compartir, y elegir Instalar página como aplicación.',
          'Confirma la instalación en el navegador.',
        ],
      },
      'desktop-edge': {
        label: 'Microsoft Edge en una computadora',
        steps: [
          'Abre el menú de Edge (tres puntos).',
          'Elige Más herramientas, luego Aplicaciones y después Instalar este sitio como una aplicación, si aparece.',
          'Confirma la instalación en el navegador.',
        ],
      },
      'desktop-chromium': {
        label: 'Un navegador Chromium en una computadora',
        steps: [
          'Busca un icono de instalación en la barra de direcciones.',
          'O abre el menú y elige una opción para instalar la aplicación, si aparece.',
          'Si no aparece una opción, es posible que este navegador no permita instalar este sitio.',
        ],
      },
      'firefox-windows': {
        label: 'Firefox en Windows',
        steps: [
          'Selecciona el botón de aplicaciones web de la barra de direcciones, si aparece.',
          'Firefox añade el sitio a la barra de tareas y al menú Inicio de Windows.',
          'Si no aparece el botón, actualiza Firefox o guarda un marcador.',
        ],
      },
      'firefox-other': {
        label: 'Firefox en este dispositivo',
        steps: [
          'Las aplicaciones web de Firefox para escritorio solo están disponibles actualmente en Windows.',
          'Guarda un marcador o abre este sitio en un navegador que permita la instalación.',
          'Continúa solamente si el navegador muestra la dirección esperada del sitio.',
        ],
      },
      generic: {
        label: 'Este navegador',
        steps: [
          'Abre el menú del navegador o el menú para compartir.',
          'Busca Instalar aplicación o Agregar a la pantalla principal.',
          'Si no aparece ninguna opción, es posible que este navegador no permita instalar este sitio.',
        ],
      },
    },
  },
} as const satisfies Record<SupportedLanguage, PwaInstallCopy>;

export const getPwaInstallCopy = (
  language: SupportedLanguage,
): PwaInstallCopy => PWA_INSTALL_COPY[language] ?? PWA_INSTALL_COPY.en;
