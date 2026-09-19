export const siteConfig = {
  name: "M&F Netztechnik",
  shortName: "M&F Netztechnik",
  tagline: "Professionelle Netzwerkinfrastruktur. Sauber installiert.",
  city: "Dortmund",
  region: "Nordrhein-Westfalen",
  url: "https://mf-netztechnik.de",
  phone: "[TELEFON EINFÜGEN]",
  email: "[E-MAIL EINFÜGEN]",
  address: "[ANSCHRIFT EINFÜGEN]",
  ceo: "[GESCHÄFTSFÜHRER EINFÜGEN]",
};

export const mainNav = [
  { label: "Leistungen", href: "/leistungen" },
  { label: "Für Unternehmen", href: "/unternehmen" },
  { label: "Für Partner", href: "/partner" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Kontakt", href: "/kontakt" },
];

export const footerNav = [
  { label: "Leistungen", href: "/leistungen" },
  { label: "Für Unternehmen", href: "/unternehmen" },
  { label: "Für Partner", href: "/partner" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Kontakt", href: "/kontakt" },
];

export const legalNav = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];

export type ServiceCategory = {
  id: string;
  number: string;
  title: string;
  description: string;
  items: string[];
  href: string;
};

export const services: ServiceCategory[] = [
  {
    id: "glasfaser",
    number: "01",
    title: "Glasfaser",
    description:
      "Verlegung, Einzug, Spleißung und Messung von Glasfaserinfrastruktur – fachgerecht dokumentiert.",
    items: [
      "Glasfaserkabel verlegen",
      "Glasfaser einziehen",
      "Glasfaser spleißen",
      "Glasfaser-Muffen montieren",
      "Patch- und Verteilerarbeiten",
      "Dämpfungs- und OTDR-Messungen",
      "Dokumentation",
    ],
    href: "/leistungen#glasfaser",
  },
  {
    id: "netzwerk-kupfer",
    number: "02",
    title: "Netzwerk & Kupfer",
    description:
      "Strukturierte Netzwerkverkabelung nach CAT 6 bis CAT 8 – geprüft, beschriftet und dokumentiert.",
    items: [
      "Strukturierte Netzwerkverkabelung",
      "CAT 6 / CAT 6A / CAT 7 / CAT 8",
      "Kupfer-Datenverkabelung",
      "Netzwerkdosen & Patchfelder",
      "Auflegen von Datenkabeln",
      "Messung und Prüfung",
      "Dokumentation",
    ],
    href: "/leistungen#netzwerk-kupfer",
  },
  {
    id: "schraenke",
    number: "03",
    title: "Server- & Netzwerkschränke",
    description:
      "Aufbau und Ordnung passiver Netzwerkinfrastruktur – von der Schrankmontage bis zum Kabelmanagement.",
    items: [
      "Serverschränke",
      "Netzwerkschränke",
      "Patchfelder",
      "Passive Netzwerkkomponenten",
      "Kabelmanagement",
      "Strukturierte Verkabelung",
    ],
    href: "/leistungen#schraenke",
  },
  {
    id: "montage",
    number: "04",
    title: "Montage & Projektunterstützung",
    description:
      "Flexible Unterstützung für Neuinstallationen, Erweiterungen und Projekte als Subunternehmer.",
    items: [
      "Neuinstallationen",
      "Erweiterungen bestehender Netzwerke",
      "Nachrüstungen",
      "Rückbau / Demontage",
      "Montage- und Projektunterstützung",
      "Kurzfristige personelle Unterstützung",
      "Ausführung als Subunternehmer",
    ],
    href: "/leistungen#montage",
  },
];

export const process = [
  {
    number: "01",
    title: "Anfrage",
    description: "Sie schildern Ihr Projekt oder Ihren Bedarf über das Formular oder direkt.",
  },
  {
    number: "02",
    title: "Projektbesprechung",
    description: "Wir klären Umfang, Standort und Anforderungen gemeinsam ab.",
  },
  {
    number: "03",
    title: "Planung & Terminierung",
    description: "Wir stimmen Termine und Ablauf mit Ihnen oder Ihrem Team ab.",
  },
  {
    number: "04",
    title: "Ausführung",
    description: "Fachgerechte Montage vor Ort – sauber, strukturiert und dokumentiert.",
  },
];

export const nrwCities = [
  "Dortmund",
  "Bochum",
  "Essen",
  "Düsseldorf",
  "Köln",
  "Duisburg",
  "Münster",
  "Bielefeld",
];

export const partnerAdvantages = [
  {
    title: "Flexible Unterstützung",
    description: "Kurzfristig einsetzbar, wenn Ihre eigene Kapazität nicht ausreicht.",
  },
  {
    title: "Zwei Monteure",
    description: "Ein eingespieltes Team für Glasfaser- und Netzwerkmontage.",
  },
  {
    title: "NRW-weiter Einsatz",
    description: "Unterwegs im gesamten Bundesland – abgestimmt auf Ihr Projektgebiet.",
  },
  {
    title: "Glasfaser & Netzwerk",
    description: "Abdeckung beider Kernbereiche aus einer Hand.",
  },
  {
    title: "Direkte Kommunikation",
    description: "Kurze Wege, klare Absprachen, verbindliche Termine.",
  },
  {
    title: "Projektorientierte Zusammenarbeit",
    description: "Einsatz projektbezogen – von der einzelnen Montage bis zur Projektbegleitung.",
  },
];

export const projectTypes = [
  "Glasfaser",
  "Netzwerk / Kupfer",
  "Serverschrank / Patchfeld",
  "Montageunterstützung",
  "Subunternehmer-Anfrage",
  "Sonstiges",
];
