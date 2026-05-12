import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface SearchableItem {
  title: string;
  keywords: string[];
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
}

export const ALL_SEARCH_LABELS: Record<string, any> = {
  en: {
    searchPlaceholder: "Search app...",
    home: {
      title: "Home",
      keywords: ["welcome", "start", "pulse", "livestream", "happening"],
    },
    community: {
      title: "Community",
      keywords: [
        "events",
        "schedule",
        "sabbath",
        "groups",
        "volunteer",
        "in-person",
        "hub",
        "service",
        "roles",
      ],
    },
    resources: {
      title: "Resources",
      keywords: [
        "video",
        "preach",
        "message",
        "bible",
        "hymnal",
        "spiritual",
        "library",
        "pdf",
        "devotional",
        "reader",
      ],
    },
    about: { title: "About Us", keywords: ["history", "beliefs", "church"] },
    connect: {
      title: "Connect",
      keywords: [
        "contact",
        "email",
        "phone",
        "location",
        "call",
        "map",
        "directions",
        "address",
        "staff",
      ],
    },
    give: {
      title: "Give",
      keywords: ["tithe", "offering", "donation", "tithing"],
    },
    language: {
      title: "Language",
      keywords: ["chinese", "spanish", "english", "translate", "settings"],
    },
    darkMode: {
      title: "Dark Mode",
      keywords: ["theme", "appearance", "night", "settings", "dark"],
    },
  },
  zh: {
    searchPlaceholder: "搜尋...",
    home: {
      title: "首頁",
      keywords: ["歡迎", "開始", "home", "脈搏", "直播"],
    },
    community: {
      title: "教會社群",
      keywords: [
        "活動",
        "時間表",
        "安息日",
        "小組",
        "義工",
        "calendar",
        "community",
        "中心",
        "服事",
      ],
    },
    resources: {
      title: "資源庫",
      keywords: [
        "視頻",
        "證道",
        "信息",
        "聖經",
        "詩歌",
        "sermons",
        "resources",
        "圖書館",
        "靈修",
      ],
    },
    about: { title: "關於我們", keywords: ["歷史", "信仰", "教會", "about"] },
    connect: {
      title: "聯繫我們",
      keywords: [
        "聯絡",
        "電子郵件",
        "電話",
        "地點",
        "電郵",
        "地圖",
        "導航",
        "地址",
        "路線",
        "connect",
        "contact",
        "email",
        "phone",
        "call",
        "map",
        "同工",
      ],
    },
    give: {
      title: "捐獻",
      keywords: ["什一", "奉獻", "捐款", "give", "tithe", "tithing"],
    },
    language: {
      title: "語言設定",
      keywords: ["中文", "英文", "西班牙文", "翻譯", "language", "設定"],
    },
    darkMode: {
      title: "深色模式",
      keywords: ["theme", "dark mode", "主題", "外觀", "settings", "深色"],
    },
  },
  es: {
    searchPlaceholder: "Buscar...",
    home: {
      title: "Inicio",
      keywords: ["bienvenido", "comenzar", "home", "pulso", "en vivo"],
    },
    community: {
      title: "Comunidad",
      keywords: [
        "eventos",
        "horario",
        "sábado",
        "grupos",
        "voluntario",
        "calendar",
        "community",
        "centro",
        "servicio",
      ],
    },
    resources: {
      title: "Recursos",
      keywords: [
        "video",
        "predicación",
        "mensaje",
        "biblia",
        "himnario",
        "sermons",
        "resources",
        "biblioteca",
        "devocional",
      ],
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
        "llamar",
        "mapa",
        "direcciones",
        "dirección",
        "connect",
        "contact",
        "email",
        "phone",
        "personal",
      ],
    },
    give: {
      title: "Dar",
      keywords: ["diezmo", "ofrenda", "donación", "give", "tithe", "diezmos"],
    },
    language: {
      title: "Idioma",
      keywords: [
        "chino",
        "español",
        "inglés",
        "traducir",
        "language",
        "ajustes",
      ],
    },
    darkMode: {
      title: "Modo oscuro",
      keywords: ["theme", "dark mode", "apariencia", "ajustes", "oscuro"],
    },
  },
};

export const getSearchableItems = (language: string): SearchableItem[] => {
  const labels = ALL_SEARCH_LABELS[language] || ALL_SEARCH_LABELS.en;

  return [
    { ...labels.home, icon: "home", route: "/" },
    {
      ...labels.community,
      icon: "account-group",
      route: "/community",
    },
    {
      ...labels.resources,
      icon: "bookmark-multiple",
      route: "/resources",
    },
    { ...labels.give, icon: "gift", route: "/you" },
    { ...labels.darkMode, icon: "theme-light-dark", route: "/you" },
    { ...labels.language, icon: "translate", route: "/you/language" },
    { ...labels.about, icon: "information", route: "/you/about" },
    { ...labels.connect, icon: "email", route: "/you/contact" },
  ];
};
