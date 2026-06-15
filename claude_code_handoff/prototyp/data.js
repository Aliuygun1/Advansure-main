/* ADVANSURE — seed data (PoC demo personas, grades, helpers) */
window.ADV = (function () {
  const personas = {
    leon: {
      id: 'leon', name: 'Leon', fullName: 'Leon Brandt',
      area: 72, sumInsured: 65000,
      address: 'Lindenstraße 14 · Mannheim',
      policy: 'ADV-HR-2024-10293', initials: 'LB',
      tenure: 'Kunde seit 2022',
    },
    robert: {
      id: 'robert', name: 'Robert', fullName: 'Robert Hofmann',
      area: 118, sumInsured: 95000,
      address: 'Am Stadtpark 7 · Heidelberg',
      policy: 'ADV-HR-2021-44817', initials: 'RH',
      tenure: 'Kunde seit 2019',
    },
    julia: {
      id: 'julia', name: 'Julia', fullName: 'Julia Sander',
      area: 54, sumInsured: 48000,
      address: 'Kerschensteinerweg 3 · Mannheim',
      policy: 'ADV-HR-2025-50922', initials: 'JS',
      tenure: 'Kundin seit 2025',
    },
  };

  // Pauschalsätze pro m² je Schadensgrad (aus Konzept: €200 / €450 / €800)
  const grades = {
    leicht: { key: 'leicht', label: 'Leicht',  rate: 200, color: 'var(--grade-leicht)',
              desc: 'Oberflächlich, kosmetisch' },
    mittel: { key: 'mittel', label: 'Mittel',  rate: 450, color: 'var(--grade-mittel)',
              desc: 'Deutlich sichtbar, Substanz betroffen' },
    schwer: { key: 'schwer', label: 'Schwer',  rate: 800, color: 'var(--grade-schwer)',
              desc: 'Massiv, Sanierung erforderlich' },
    total:  { key: 'total',  label: 'Totalschaden', rate: 800, color: 'var(--grade-total)',
              desc: 'Vollständig zerstört' },
  };

  // Default-Raumgrößen (m²) für die Pauschalmethode
  const roomSizes = {
    'Küche': 9, 'Bad': 6, 'Wohnzimmer': 24, 'Schlafzimmer': 14,
    'Flur': 6, 'Kinderzimmer': 12, 'Arbeitszimmer': 10, 'Keller': 14, 'Esszimmer': 12,
  };

  const damageTypes = {
    wasser: { key: 'wasser', label: 'Wasserschaden', icon: 'water',
              empathy: 'Oh nein, ein Wasserschaden ist echt ärgerlich.' },
    feuer:  { key: 'feuer', label: 'Brand- / Feuerschaden', icon: 'fire',
              empathy: 'Ein Feuerschaden – das tut mir leid, das ist erschreckend.' },
    einbruch:{ key: 'einbruch', label: 'Einbruchdiebstahl', icon: 'lock',
              empathy: 'Ein Einbruch ist ein echter Vertrauensbruch. Ich helfe dir.' },
    sturm:  { key: 'sturm', label: 'Sturm- / Hagelschaden', icon: 'storm',
              empathy: 'Sturmschäden können ganz schön heftig sein.' },
  };

  const statusStages = [
    { key: 'eingegangen',  label: 'Eingegangen',   desc: 'Deine Meldung ist bei uns angekommen.' },
    { key: 'bearbeitung',  label: 'In Bearbeitung', desc: 'Ein Sachbearbeiter prüft deinen Fall.' },
    { key: 'geprueft',     label: 'Geprüft',        desc: 'Die Schadenhöhe wurde bestätigt.' },
    { key: 'abgeschlossen',label: 'Abgeschlossen',  desc: 'Die Regulierung ist abgeschlossen.' },
  ];

  function euro(n) {
    return '€' + Math.round(n).toLocaleString('de-DE');
  }
  function roomArea(roomType) {
    return roomSizes[roomType] || 10;
  }
  function calcRoom(roomType, gradeKey) {
    const area = roomArea(roomType);
    const g = grades[gradeKey] || grades.mittel;
    return { area, rate: g.rate, amount: area * g.rate };
  }

  return { personas, grades, roomSizes, damageTypes, statusStages, euro, roomArea, calcRoom };
})();
