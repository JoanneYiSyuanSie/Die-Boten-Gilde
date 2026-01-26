
import { GamePhase } from "../types";

export interface LocalizedText {
  de: string;
  zh: string;
}

export interface ShopItem {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  cost: number;
  iconKey: string;
  type: 'consumable' | 'origin' | 'theme' | 'badge' | 'chronicle';
  effect?: string;
  strength?: LocalizedText;
  weakness?: LocalizedText;
  promptTag?: string;
  cssClass?: string;
  badgeId?: string;
  allowedPhases?: GamePhase[];
}

export const SHOP_ITEMS: ShopItem[] = [
  // ==========================================
  // 1. 消耗品 (Consumables)
  // ==========================================
  {
    id: 'consumable_coffee',
    name: {
      de: 'Wiener Melange',
      zh: '維也納米朗琪咖啡'
    },
    description: {
      de: 'Ein warmer Duft von gerösteten Bohnen und frischer Milch. Ein Moment der Ruhe im Chaos der Geschichte.',
      zh: '烘焙咖啡豆與新鮮牛奶的溫暖香氣。在歷史的混亂中，享受片刻的寧靜與清醒。'
    },
    cost: 50,
    iconKey: 'Coffee',
    type: 'consumable',
    effect: 'flavor_text',
    allowedPhases: [GamePhase.MENU, GamePhase.LEVEL_1, GamePhase.LEVEL_2, GamePhase.LEVEL_3, GamePhase.EPILOGUE]
  },
  {
    id: 'consumable_spy_network',
    name: {
      de: 'Depesche des Spions',
      zh: '間諜密函'
    },
    description: {
      de: 'Versiegelt mit schwarzem Wachs. Enthält Informationen, die das Blatt wenden können. (KI-Hinweis)',
      zh: '以黑色蠟封緘。信中的情報足以扭轉局勢，讓你在談判桌上洞燭先機。(獲得一次 AI 提示)'
    },
    cost: 100,
    iconKey: 'Key',
    type: 'consumable',
    effect: 'add_hint_charge',
    allowedPhases: [GamePhase.LEVEL_2]
  },
  {
    id: 'consumable_royal_pardon',
    name: {
      de: 'Kaiserlicher Passierschein',
      zh: '皇帝通行證'
    },
    description: {
      de: 'Unterzeichnet vom Kaiser selbst. Es öffnet Türen, die sonst verschlossen blieben, und tilgt kleine Fehler.',
      zh: '由皇帝親筆簽署。它能開啟常人無法通過的大門，並在結算時抹去你的微小過失 (提升評級)。'
    },
    cost: 250,
    iconKey: 'Scroll',
    type: 'consumable',
    effect: 'boost_score',
    allowedPhases: [GamePhase.EPILOGUE]
  },

  // ==========================================
  // 2. 身世背景 (Herkunft / Origins)
  // ==========================================
  {
    id: 'origin_merchant',
    name: {
      de: 'Der Kaufmann',
      zh: '漢薩商人'
    },
    description: {
      de: 'Du verstehst den Wert von Münzen besser als den von Worten. Die Welt ist ein Marktplatz.',
      zh: '你懂得金幣的份量勝過千言萬語。對你而言，這世界不過是一個巨大的市集。'
    },
    cost: 1000,
    iconKey: 'Anchor',
    type: 'origin',
    strength: {
      de: 'Leichteres Vertrauen bei Bürgern und Händlern (Gleichgesinnte).',
      zh: '面對平民、商販時，因務實的態度而容易建立信任。'
    },
    weakness: {
      de: 'Schwieriger bei Adel und Klerus (wird als gierig angesehen).',
      zh: '面對貴族或神職人員時，可能被視為銅臭味過重。'
    },
    promptTag: 'The Player is a pragmatic Merchant. [Gameplay Effect: Easier trust with Commoners/Merchants; Harder trust with Nobles/Clergy who see you as greedy.]'
  },
  {
    id: 'origin_noble',
    name: {
      de: 'Der Adlige',
      zh: '貴族子弟'
    },
    description: {
      de: 'Dein Familienname ist alt, dein Erbe schwer. Du forderst Respekt, wo andere bitten.',
      zh: '你的姓氏古老而沉重。即使身處險境，你仍習慣要求尊重，而非卑躬屈膝。'
    },
    cost: 1200,
    iconKey: 'Shield',
    type: 'origin',
    strength: {
      de: 'Leichteres Vertrauen bei Wachen, Beamten und Militärs (Status).',
      zh: '面對守衛、官員時，你的氣場能讓他們不自覺地服從。'
    },
    weakness: {
      de: 'Schwieriger bei Bauern und Rebellen (Neid oder Hass).',
      zh: '面對貧苦大眾或叛逆者時，你的出身是原罪。'
    },
    promptTag: 'The Player is a Noble. [Gameplay Effect: Easier trust with Officials/Guards; Harder trust with Peasants/Rebels who resent your status.]'
  },
  {
    id: 'origin_artist',
    name: {
      de: 'Der Künstler',
      zh: '風流才子'
    },
    description: {
      de: 'Ein Beobachter der menschlichen Seele. Du sprichst in Rätseln, Reimen und Emotionen.',
      zh: '靈魂的觀察者。你用謎語、韻腳和情感編織語言，能在人心最柔軟處留下痕跡。'
    },
    cost: 1200,
    iconKey: 'PenTool',
    type: 'origin',
    strength: {
      de: 'Leichteres Vertrauen bei Romantikern, Einheimischen und jungen Leuten.',
      zh: '面對感性之人、年輕人時，你的魅力無人能擋。'
    },
    weakness: {
      de: 'Schwieriger bei Soldaten und Pragmatikern (wird als nutzlos angesehen).',
      zh: '面對嚴肅的軍官或務實者時，他們認為你只是個只會空談的廢物。'
    },
    promptTag: 'The Player is an Artist. [Gameplay Effect: Easier trust with Romantics/Locals; Harder trust with Soldiers/Pragmatists who see you as useless.]'
  },
  {
    id: 'origin_scholar',
    name: {
      de: 'Der Gelehrte',
      zh: '學院學者'
    },
    description: {
      de: 'Die Feder ist mächtiger als das Schwert. Du suchst Logik und Wissen in einer chaotischen Welt.',
      zh: '筆鋒勝於劍鋒。在這個混亂的時代，你試圖用邏輯與知識尋找秩序。'
    },
    cost: 1500,
    iconKey: 'GraduationCap',
    type: 'origin',
    strength: {
      de: 'Leichteres Vertrauen bei Bibliothekaren, Klerikern und Ältesten.',
      zh: '面對知識份子、神職人員時，你的博學能贏得敬重。'
    },
    weakness: {
      de: 'Schwieriger bei Banditen und Söldnern (wird als schwaches Opfer gesehen).',
      zh: '面對強盜、傭兵時，你看起來就像一隻待宰的肥羊。'
    },
    promptTag: 'The Player is a Scholar. [Gameplay Effect: Easier trust with Educated/Clergy; Harder trust with Criminals/Mercenaries who see you as a weak target.]'
  },

  // ==========================================
  // 3. 介面主題 (UI Themes)
  // ==========================================
  {
    id: 'theme_blueprint',
    name: {
        de: 'Preußische Ingenieurskunst',
        zh: '普魯士工程藍圖'
    },
    description: {
        de: 'Präzision und Fortschritt. Weiße Linien auf tiefblauem Grund, entworfen für die Maschinen des 19. Jahrhunderts.',
        zh: '精準與進步的象徵。深藍底色上的白色線條，彷彿置身於 19 世紀的蒸汽機械設計室。'
    },
    cost: 800,
    iconKey: 'Map',
    type: 'theme',
    cssClass: 'theme-blueprint'
  },
  {
    id: 'theme_black_forest',
    name: {
        de: 'Mythen des Schwarzwalds',
        zh: '黑森林傳說'
    },
    description: {
        de: 'Tiefes Grün der Tannen und die Dunkelheit alter Sagen. Ein Interface für jene, die die Wildnis nicht fürchten.',
        zh: '冷杉的深綠與古老傳說的幽暗。這是為那些不畏懼荒野之人所設計的介面。'
    },
    cost: 700,
    iconKey: 'Compass',
    type: 'theme',
    cssClass: 'theme-forest'
  },

  // ==========================================
  // 4. 公會秘史 (Guild Chronicles)
  // ==========================================
  {
    id: 'chronicle_origin',
    name: {
      de: 'Das Erste Siegel',
      zh: '最初的封印'
    },
    description: {
      de: 'Fragmente aus der Zeit Karls des Großen. Die Gründung der Gilde in den Schatten von Aachen.',
      zh: '來自查理曼大帝時期的殘卷。記載著公會如何在亞琛的陰影中誕生。'
    },
    cost: 300,
    iconKey: 'Book',
    type: 'chronicle'
  },
  {
    id: 'chronicle_shadow_war',
    name: {
      de: 'Krieg der Hanse',
      zh: '漢薩影子戰爭'
    },
    description: {
      de: 'Wie Tinte und Gerüchte mächtiger waren als Kanonen. Ein Lehrstück über Desinformation.',
      zh: '墨水與謠言如何勝過火砲？一段關於假情報戰的經典戰役紀錄。'
    },
    cost: 450,
    iconKey: 'Key',
    type: 'chronicle'
  },

  // ==========================================
  // 5. 榮耀 (Prestige)
  // ==========================================
  {
    id: 'prestige_thurn_und_taxis',
    name: {
      de: 'Thurn und Taxis',
      zh: '皇家郵政傳奇'
    },
    description: {
      de: 'Das Wappen der Familie, die die Post erfand. Ein Symbol für absolute Zuverlässigkeit und Geschwindigkeit.',
      zh: '發明現代郵政家族的紋章。這象徵著絕對的可靠與速度，是信使至高無上的榮耀。'
    },
    cost: 5000,
    iconKey: 'Crown',
    type: 'badge',
    badgeId: 'postal_legend'
  }
];
