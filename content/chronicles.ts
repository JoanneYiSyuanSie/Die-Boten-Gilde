
// Guild Chronicles - Long form stories unlocked via items.
// Keyed by the Shop Item ID.

export const CHRONICLES: Record<string, { de: string; zh: string }> = {
  chronicle_origin: {
    de: `**Kapitel 1: Der Ursprung**

Es begann nicht mit einem Schwert, sondern mit einem Flüstern. In den kalten Hallen von Aachen, als Karl der Große sein Reich formte, erkannte ein Schreiber namens Alkuin die Macht des Wortes.

"Ein Schwert kann einen Mann töten," sagte er, "aber ein Brief kann eine Armee bewegen."

Die Boten-Gilde wurde als Netzwerk von Gelehrten, Mönchen und Reitern gegründet. Ihr Ziel war nicht Eroberung, sondern Verbindung. Sie entwickelten Codes, die selbst die schärfsten Augen nicht knacken konnten, und Wege, die auf keiner Karte verzeichnet waren.

Unser erstes Siegel war aus einfachem Wachs, doch es wog schwerer als Gold. Wer es trug, stand unter dem Schutz der Wahrheit.`,

    zh: `**第一章：起源**

一切並非始於劍刃，而是始於低語。在亞琛寒冷的宮殿大廳裡，當查理曼大帝正在塑造他的帝國時，一位名叫阿爾昆 (Alkuin) 的學者意識到了文字的力量。

「一把劍可以殺死一個人，」他說，「但一封信可以調動一支軍隊。」

信使公會最初是由學者、僧侶和騎手組成的網絡。他們的目標不是征服，而是連結。他們開發了連最銳利的眼睛都無法破解的密碼，開闢了地圖上未曾標示的密徑。

我們最初的印璽只是簡單的蠟印，但它的份量卻比黃金更重。持有此印者，便在真理的庇護之下。`
  },

  chronicle_shadow_war: {
    de: `**Kapitel 2: Der Schattenkrieg der Hanse**

Im Jahr 1356 stand die Hanse auf dem Höhepunkt ihrer Macht, doch Piraten und korrupte Adelige bedrohten die Handelsrouten. Ein offener Krieg hätte den Ruin bedeutet.

Die Gilde griff ein. Nicht mit Schiffen, sondern mit Desinformation.
Wir fälschten Frachtbriefe, ließen Gerüchte über Geisterschiffe in Lübecker Tavernen streuen und leiteten feindliche Flotten in leere Buchten.

Innerhalb eines Monats brach die Allianz der Piraten zusammen, ohne dass ein einziger Schuss aus einer Kanone abgefeuert wurde. Man nennt dies bis heute den "Schattenkrieg".

Dies lehrte uns: Information ist die ultimative Waffe.`,

    zh: `**第二章：漢薩同盟的影子戰爭**

1356 年，漢薩同盟正值鼎盛時期，但海盜和腐敗的貴族威脅著貿易路線。一場全面的公開戰爭將意味著毀滅。

公會介入了。不是用戰船，而是用假情報。
我們偽造了貨運清單，在呂貝克的小酒館裡散布關於幽靈船的謠言，並將敵方艦隊引導至空無一物的海灣。

一個月內，海盜聯盟分崩離析，而漢薩同盟未發一槍一砲。直到今天，這仍被稱為「影子戰爭」。

這教會了我們：情報即是終極武器。`
  }
};

// Main Story Chronicles - Unlocked by Messenger Level (XP)
export const MAIN_STORY_CHRONICLES: Array<{
  id: string;
  levelRequired: number;
  title: { de: string; zh: string };
  content: { de: string; zh: string };
}> = [
    {
      id: 'main_story_01',
      levelRequired: 1,
      title: {
        de: "Der Eid in der Dunkelheit",
        zh: "黑暗中的誓言"
      },
      content: {
        de: `**Prolog: Der Eid**

In den Schatten der Geschichte, wo Könige und Kaiser vergessen werden, bleiben nur wir. Wir tragen keine Kronen, sondern Taschen. Wir führen keine Kriege, wir beenden sie – oder starten sie – mit einem einzigen Stück Papier.

Du fragst dich, warum du hier bist? Warum du das Siegel trägst?

Weil du verstehst, dass Wahheit ein Schwert ist. Und wir sind die einzigen, die wissen, wie man es führt, ohne sich selbst zu schneiden.

Willkommen in der Gilde. Dein Weg beginnt hier, auf Level 1. Aber der Pfad reicht tiefer, als du ahnst.`,
        zh: `**序章：誓言**

在歷史的陰影中，當國王與皇帝都被遺忘之時，唯有我們長存。我們不戴皇冠，只揹行囊。我們不發動戰爭，我們只用一張紙結束——或開始——戰爭。

你問為什麼你會在這裡？為什麼你佩戴著這枚印璽？

因為你明白，真相是一把雙面刃。而我們是唯一知道如何揮舞它而不傷及自身的人。

歡迎來到公會。你的旅程始於等級 1。但這條路，比你想像的還要深邃。`
      }
    },
    {
      id: 'main_story_02',
      levelRequired: 5,
      title: {
        de: "Die erste Regel",
        zh: "第一條規則"
      },
      content: {
        de: `**Level 5: Verschwiegenheit**

Du hast nun einige Reisen hinter dir. Du hast gesehen, wie Lügen zu Währungen werden.

Die erste Regel der Gilde lautet nicht "Sei schnell". Sie lautet "Sei unsichtbar". Ein Bote, an den man sich erinnert, hat versagt. Wir sind der Wind, der das Feuer entfacht, nicht das Streichholz.

Erinnere dich daran, wenn du das nächste Mal dem Feind in die Augen blickst.`,
        zh: `**等級 5：守密**

你已經經歷了幾次旅程。你見識到了謊言如何成為貨幣。

公會的第一條規則不是「要快」。而是「要隱形」。一個被人記住的信使是失敗的。我們是搧風點火的風，而不是那一根火柴。

當你下次直視敵人雙眼時，請記住這一點。`
      }
    }
  ];
