# Audio-Assets

## Vorhanden (13 Dateien, geliefert als „Buchstaben Audio Alif – Tha“)
Format m4a (AAC, 48 kHz, mono, 1,3 bis 1,7 s). Die Zuordnung folgt den Dateinamen der Lieferung; **der gesprochene Inhalt wurde von uns nicht gegengehört oder muttersprachlich geprüft.**

| Asset-ID | Datei | Inhalt laut Dateiname | Verwendung |
|---|---|---|---|
| `name-alif` | `name-alif.m4a` | „Alif“ (Buchstabenname) | Alif-Schritt, Hörübung |
| `vowel-fatha` / `-kasra` / `-damma` | `vowel-*.m4a` | kurzes a / i / u | Vokale hören, Hörunterscheidung |
| `syl-{ba,ta,tha}-{fatha,kasra,damma}` | `syl-*.m4a` | ba bi bu ta ti tu tha thi thu | Silben hören, Hörvergleich, Hörübungen |
| `sound-ba/ta/tha` | = `syl-*-fatha.m4a` | Konsonant mit kurzem a | „Laut hören“ bei den Buchstaben |

Hinweis: Ein Konsonant allein ist nicht sprechbar. Der Buchstabenlaut wird darum als Silbe mit Fatha gespielt und das in der Oberfläche so erklärt. Die Buchstabennamen Bā, Tā, Thā (mit langem ā) fehlen.

## Fehlend (benötigt)

| Asset-ID | Datei | Aussprache | Verwendung |
|---|---|---|---|
| `name-ba`, `name-ta`, `name-tha` | `name-*.m4a` | Bā, Tā, Thā (Namen mit langem ā) | Buchstabennamen |
| `syl-ba-long`, `syl-ta-long`, `syl-tha-long` | `syl-*-long.m4a` | bā, tā, thā | Länge hören, Hörunterscheidung ba/bā |
| `word-bab`, `word-thabit`, `word-tab`, `word-thabat` | `word-*.m4a` | bāb, thābit, tāb (Pausalform), thabāt | Wörter einzeln hören |
| Minimalpaare (optional) | frei | ba/bā, ta/tha, ti/tu | Kontrastives Hören |
| Zweite und dritte Stimme (empfohlen) | gleiche Namen mit Suffix `-v2`, `-v3` | wie oben | Sprechervielfalt (siehe unten) |
| Echte Langsam-Aufnahmen (optional) | `*-slow.m4a` | wie oben, deutlich gesprochen | ersetzt technische Verlangsamung |

Die Oberfläche zeigt für fehlende Assets „Audio noch nicht verfügbar“ und lässt Hörübungen dazu weg. Sobald eine Datei in `public/audio/` liegt und im `AUDIO_MANIFEST` (`src/lektion/audio/manifest.ts`) eingetragen ist, werden Player und Hörübungen automatisch aktiv. Die Tests prüfen, dass jede Manifest-Datei existiert.

## Anforderungen an Sprecher und Aufnahme
- Muttersprachliche arabischsprechende Person mit klarer, nicht dialektal gefärbter Standardaussprache (Hocharabisch oder deutlich neutrale Aussprache), Rückmeldung einer zweiten arabischsprachigen Person.
- Studio- oder ruhige Raumaufnahme, 48 kHz, mono, ohne Rauschen, einheitliche Lautstärke (Zielwert z. B. −16 LUFS), je Datei 0,2 s Stille am Anfang und 0,3 s am Ende.
- Konsonant-Silben **isoliert** sprechen, ohne Satzmelodie. Kurzvokale kurz, ā deutlich lang (etwa doppelt).
- ث als /θ/ mit hörbarem Reibelaut, ohne Stimme; ت nicht stark behaucht.
- Format m4a (AAC); für maximale Kompatibilität zusätzlich `.mp3` oder `.ogg` bereitstellen.

## Hinweis zur Sprechervielfalt
Forschung zum Hörtraining fremder Laute berichtet Vorteile von Aufnahmen mehrerer Sprecher (z. B. Logan, Lively & Pisoni 1991). Mit nur einem Sprecher ist dieser Vorteil nicht zu erwarten. Das ist ein offener Punkt.
