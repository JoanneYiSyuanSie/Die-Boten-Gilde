
export const HISTORICAL_TOPICS = [
  // 800 - 1200: Early/High Middle Ages
  "Die Krönung Karls des Großen in Aachen (800 AD)",
  "Ein Streit zwischen Benediktinermönchen über die Abschrift seltener Bücher (950 AD)",
  "Der Bau einer neuen Steinbrücke in Regensburg (1135 AD)",
  "Hildegard von Bingen schreibt einen Brief über Heilkräuter (1150 AD)",
  "Ein Minnesänger-Wettbewerb auf der Wartburg (1206 AD)",
  "Barbarossas Vorbereitungen für den Kreuzzug (1189 AD)",
  
  // 1200 - 1500: Late Middle Ages & Hanseatic League
  "Ein geheimer Handel der Hanse in Lübeck (1350 AD)",
  "Der Schwarze Tod erreicht eine kleine Hafenstadt (1349 AD)",
  "Der Bau des Kölner Doms kommt ins Stocken (1410 AD)",
  "Ein Falschmünzer-Skandal auf dem Nürnberger Markt (1450 AD)",
  "Johannes Gutenberg sucht Investoren für seine Druckpresse (1452 AD)",
  "Das Fugger-Bankhaus finanziert eine kaiserliche Wahl (1519 AD)",
  "Ein Ritterturnier zu Ehren des Herzogs in Landshut (1475 AD)",

  // 1500 - 1650: Reformation & Thirty Years' War
  "Martin Luther versteckt sich auf der Wartburg (1521 AD)",
  "Ein Bauernaufstand im Schwarzwald fordert Gerechtigkeit (1525 AD)",
  "Albrecht Dürer sucht das perfekte Nashorn-Modell (1515 AD)",
  "Wallensteins Lager: Verhandlung mit einem Söldnerführer (1630 AD)",
  "Der Westfälische Frieden: Ein diplomatisches Ränkespiel in Münster (1648 AD)",
  "Hexenprozesse in Bamberg: Ein Schreiber versucht, jemanden zu retten (1628 AD)",
  "Johannes Kepler erklärt dem Kaiser die Planetenbahnen (1609 AD)",

  // 1650 - 1800: Baroque & Enlightenment
  "Johann Sebastian Bach beschwert sich über seine Schüler in Leipzig (1730 AD)",
  "Friedrich der Große plant das Schloss Sanssouci (1745 AD)",
  "Ein Alchemist behauptet, Gold herstellen zu können (1705 AD)",
  "Goethes Ankunft in Weimar und der Hofklatsch (1775 AD)",
  "Kaffeehauskultur in Wien: Ein Streit unter Philosophen (1785 AD)",
  "Mozart sucht dringend einen Librettisten für eine neue Oper (1786 AD)",
  "Die ersten Heißluftballon-Versuche in Deutschland (1784 AD)",

  // 1800 - 1900: Industrial Revolution & Empire
  "Napoleonische Truppen besetzen das Rheinland (1802 AD)",
  "Die Brüder Grimm sammeln Märchen in einem abgelegenen Dorf (1812 AD)",
  "Das Hambacher Fest: Studenten fordern Freiheit (1832 AD)",
  "Die erste Eisenbahnfahrt von Nürnberg nach Fürth (1835 AD)",
  "Die Revolution von 1848: Barrikaden in Berlin",
  "Richard Wagner sucht Geldgeber für das Festspielhaus (1872 AD)",
  "Ein Streik der Kohlearbeiter im Ruhrgebiet (1889 AD)",
  "Carl Benz und die erste heimliche Autofahrt seiner Frau (1888 AD)",
  "Bismarck verhandelt ein geheimes Bündnis (1885 AD)"
];

/**
 * Mundane daily messenger tasks for training mode.
 * Focused on everyday vocabulary and simple interactions.
 */
export const MESSENGER_DAILY_TOPICS = [
  "Einkaufsliste für den Gildenmeister schreiben",
  "Den Weg zum nächsten Bäcker erfragen",
  "Ein verschmiertes Wirtshausschild entziffern",
  "Den Fütterungsplan für die Gildenpferde notieren",
  "Eine kurze Nachricht an einen Nachbarn wegen Lärm",
  "Die Preise für Hafer auf dem Markt vergleichen",
  "Einen Aushang über verlorene Schlüssel am Stadttor lesen",
  "Den Wetterbericht auf einer Kreidetafel verstehen",
  "Einen Briefkasten im Regen finden",
  "Die Stallmiere beim Quartiermeister bezahlen",
  "Einen Zettel über eine Fundsache im Dorfplatz lesen",
  "Nach der Uhrzeit beim Kirchturmwächter fragen",
  "Einen Beleg für eine gelieferte Kiste Bier prüfen",
  "Eine kurze Entschuldigung für eine verspätete Lieferung schreiben",
  "Die Hausnummern in einer dunklen Gasse suchen",
  "Einen Steckbrief für einen entlaufenen Hund lesen",
  "Bestellung von Tinte und Pergament beim Händler",
  "Fragen nach einem freien Zimmer in einer Herberge",
  "Eine Wegbeschreibung für einen Wanderer skizzieren",
  "Die Regeln für das Sonntagsruhe-Dekret lesen"
];

export const getRandomTopic = (): string => {
  const index = Math.floor(Math.random() * HISTORICAL_TOPICS.length);
  return HISTORICAL_TOPICS[index];
};

export const getRandomDailyTopic = (): string => {
  const index = Math.floor(Math.random() * MESSENGER_DAILY_TOPICS.length);
  return MESSENGER_DAILY_TOPICS[index];
};
