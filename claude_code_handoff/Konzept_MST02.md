ADVANSURE
Digitale Schadenmeldung für die Hausratversicherung
Konzept
Fachliche und technische Konzeption des Proof of Concept
Projekt
Advansure - Hausrat Schadenmeldung
Studiengang
Unternehmens- und Wirtschaftsinformatik (UIB)
Hochschule
Technische Hochschule Mannheim
Partner
Convista Consulting GmbH
Projektsemester
Sommersemester 2026
Meilenstein
MST02 - Konzeptionsphase
Team
S. Amiri, F. Hamidi, L. Reinhardt, A. Uygun, A. Kronboch
Betreuer Convista
Julian Markopolsky, Martin Schulz
Dokumentversion
1.0
Inhaltsverzeichnis
1. Einleitung3
1.1 Aufgabenstellung3
1.2 Lösungsidee3
1.3 Abgrenzung und Scope4
1.4 Aufbau dieses Dokuments4
2. Konzeption5
2.1 Nutzen der Lösung5
2.2 Fachliche Anwendungsfälle6
2.3 BPMN-Prozessmodell14
2.4 Technische Anwendungsfälle17
2.5 Kontextdiagramm, Datenflüsse, Kommunikationsstrukturen und Abhängigkeiten22
2.6 Architekturbild27
2.7 Testplanung auf Use-Case-Ebene30
3. Zusammenfassung und Ausblick36
3.1 Kerngedanke der Lösung36
3.2 Bewusste Reduktion auf das Notwendige36
3.3 Nächste Schritte36
Abbildungen und Tabellen sind durchgängig nummeriert (Abbildung 1 bis Abbildung 7). Die genauen Seitenzahlen ergeben sich aus dem aktualisierten Dokument; nach Öffnen in Word kann eine dynamische Aktualisierung mit F9 erfolgen.

# 1. Einleitung

## 1.1 Aufgabenstellung
Die digitale Schadenmeldung in der Hausratversicherung ist heute in den meisten Fällen ein Bruch zwischen den Welten: Versicherungsnehmer sind moderne, mobile Endkundenerlebnisse aus anderen Lebensbereichen gewohnt - etwa aus dem Online-Banking, dem Lebensmitteleinkauf oder aus dem Reisesektor. In der Schadenmeldung treffen sie hingegen häufig auf statische Webformulare, telefonische Hotlines oder PDF-Vordrucke. Die Folge ist eine ungleichmäßige Customer Experience, eine hohe manuelle Aufwandsbelastung auf Seiten des Versicherers und eine längere Time-to-Cash für den Endkunden.
Die Projektaufgabe, die das Team im Projektsemester gemeinsam mit der Convista Consulting GmbH bearbeitet, lautet daher in ihrem Kern: Wie lässt sich eine moderne, KI-gestützte Schadenmeldung für die Hausratversicherung so konzipieren und prototypisch umsetzen, dass der Versicherungsnehmer einen Schaden in wenigen Minuten dokumentieren, einreichen und nachverfolgen kann, ohne ein klassisches Formular auszufüllen?
Aus dieser Frage ergeben sich mehrere konkrete Anforderungen, die in dieser Konzeption beantwortet werden sollen:
Die Lösung muss auf einem Mobilgerät funktionieren, da Schadenfälle typischerweise „vor Ort“ am Schadensobjekt entstehen.
Die Lösung muss dem Versicherungsnehmer eine niedrigschwellige, dialogorientierte Erfassung des Schadens ermöglichen, statt ihm eine fremde Fachsprache abzuverlangen.
Die Lösung muss eine erste, automatisierte Schadeneinschätzung liefern können, die als Ausgangsbasis für die weitere Bearbeitung dient.
Die Lösung muss im Rahmen eines Projektsemesters realisierbar sein - das heißt: schlanker Scope, klare Schnittstellen, beherrschbare Architektur.
Diese Konzeption beschreibt die fachliche und technische Lösung für genau diese Aufgabenstellung und bildet die Grundlage für die anschließende Implementierungsphase bis zum Abschluss-Meilenstein MST03.

## 1.2 Lösungsidee
Die im Projekt entwickelte Lösung trägt den Namen Advansure. Sie ist eine Progressive Web-App (PWA) für den Versicherungsnehmer der Hausratversicherung und ersetzt das klassische Schadenformular durch einen dialoggeführten, KI-gestützten Prozess. Im Zentrum steht eine virtuelle Assistentin namens Avery, die den Versicherungsnehmer durch die Schadenmeldung begleitet.
Der Ablauf folgt aus Nutzersicht einem einfachen Muster:
1.Der Versicherungsnehmer öffnet die PWA und beschreibt seinen Schaden in natürlicher Sprache (z. B. „Wasserschaden durch Waschmaschine in der Küche“).
2.Avery erkennt aus dem Dialog Schadenstyp, Ursache und betroffene Räume und schlägt einen sogenannten Foto-Walk vor.
3.Der Versicherungsnehmer filmt mit der Smartphone-Kamera kurze Videosequenzen je Raum. Diese werden serverseitig an ein multimodales KI-Modell übergeben, das den Schadensgrad pro Raum klassifiziert.
4.Anhand der erkannten Räume, Schadensgrade und der Pauschalmethode (Wohnfläche × hinterlegter Pauschalsatz pro m² je Schadensgrad) wird eine erste, voraussichtliche Schadenshöhe berechnet.
5.Der Versicherungsnehmer prüft die Zusammenfassung, reicht den Schaden ein und erhält unmittelbar eine lokale Vorgangsnummer sowie einen Status-Screen zur Nachverfolgung.
Konzeptionell unterscheidet sich Advansure damit in drei wesentlichen Punkten von einer klassischen Schadenmeldung:
Dialog statt Formular: Der Versicherungsnehmer beschreibt seinen Schaden in eigenen Worten. Die Strukturierung übernimmt die KI im Hintergrund.
Multimodale Erfassung: Statt einer Inventarliste mit Einzelposten wird der Raumzustand per Video aufgenommen und automatisiert ausgewertet.
Pauschalmethode statt Einzelbewertung: Die Schadenshöhe wird über einen pro Raum und Schadensgrad konfigurierten Pauschalsatz pro Quadratmeter ermittelt - das vereinfacht die Berechnung erheblich und ist im Rahmen eines PoC realistisch umsetzbar.

## 1.3 Abgrenzung und Scope
Advansure ist als Proof of Concept konzipiert. Der Scope wurde im Projekt bewusst reduziert, um die Konzeption innerhalb des Projektsemesters bis zum geplanten Abschluss-Meilenstein abschließen zu können. Folgende Punkte sind ausdrücklich nicht Bestandteil dieser Konzeption und der nachfolgenden Implementierung:
Eine echte Anbindung an ein Bestandsführungssystem eines Versicherers (z. B. ReSy).
Eine eigene Sachbearbeiter-Ansicht (Cockpit) zur weiteren Bearbeitung des Schadens.
Asynchrone Komponenten wie Webhook-Empfänger, Background-Job-Queues oder Push-Notifications.
Eine produktionsreife Authentifizierungsstrategie mit echten Endkundenkonten - im PoC arbeiten wir mit drei Demo-Personas.
Diese Abgrenzungen sind nicht als Mangel, sondern als bewusste konzeptionelle Entscheidung zu verstehen. Sie sind in Abschnitt 2.5 (Architektur und Kommunikationsstrukturen) noch einmal explizit dokumentiert.

## 1.4 Aufbau dieses Dokuments
Dieses Dokument folgt einer top-down-Struktur: Es beginnt mit dem fachlichen Nutzen der Lösung (Kapitel 2.1), führt anschließend in die fachliche Logik über die Anwendungsfälle und das BPMN (Kapitel 2.2 und 2.3) und konkretisiert die Lösung danach technisch über technische Anwendungsfälle, Kontextdiagramm, Datenflüsse, Kommunikationsstrukturen, Abhängigkeiten und Architektur (Kapitel 2.4 bis 2.6). Den Abschluss bildet eine fachliche Testplanung auf Use-Case-Ebene (Kapitel 2.7).
Wo immer es die Lesbarkeit unterstützt, sind die Inhalte mit Diagrammen, Tabellen und konkreten Beispielen aus dem Hausrat-Kontext angereichert. Ziel ist, dass diese Konzeption sowohl als Diskussionsgrundlage mit Convista als auch als interne Implementierungsvorlage für das Projektteam dient.

# 2. Konzeption
Die folgenden Kapitel beschreiben die konkrete Lösung Advansure aus fachlicher und technischer Sicht. Sie folgen der in der Aufgabenstellung vorgegebenen Struktur und führen die Leserin und den Leser von den fachlichen Capabilities (Nutzen der Lösung) über die fachliche Logik bis hin zur technischen Architektur und Testplanung.
Wenn in den Kapiteln auf konkrete Endkundenszenarien Bezug genommen wird, geschieht dies anhand der drei für den PoC definierten Demo-Personas Leon, Robert und Julia - stellvertretend für unterschiedliche Wohnsituationen, Versicherungssummen und Schadensszenarien.

## 2.1 Nutzen der Lösung
Der fachliche Nutzen von Advansure lässt sich am besten anhand einer Business Capability Map darstellen. Eine Business Capability beschreibt eine fachliche Fähigkeit, die ein Unternehmen besitzt oder besitzen sollte - unabhängig davon, durch welche Organisation, welchen Prozess oder welche Technologie sie umgesetzt wird. Für die Hausratversicherung lassen sich die relevanten Capabilities entlang der Wertschöpfungskette von der Antragsaufnahme bis zur Nachregulierung gliedern.
Advansure adressiert nicht alle dieser Capabilities, sondern konzentriert sich bewusst auf einen klar definierten Ausschnitt: die Schadenmeldung (FNOL), die Schadenermittlung sowie eine schlanke Statusverfolgung. Die folgende Business Capability Map ordnet die Capabilities und hebt den Fokus von Advansure hervor.
[IMAGE]
Abbildung 1: Business Capability Map - fachliche Capabilities entlang der Hausratversicherungs-Wertschöpfungskette. Hervorgehoben sind die für Advansure relevanten Fähigkeiten.

### 2.1.1 Capability-Cluster im Überblick
Die Capability Map gliedert sich in fünf fachliche Cluster, die im Folgenden kurz erläutert werden:
Cluster
Beschreibung und Advansure-Fokus
Antrag & Vertrag
Bedarfs- und Risikoaufnahme, Tarifierung sowie Policierung und Bestandsführung. Dieser Cluster ist für Advansure nicht im Fokus. Wir setzen einen bestehenden Hausratvertrag mit hinterlegter Wohnfläche voraus.
Schadenmeldung (FNOL)
Kern-Fokus
Dialoggeführte Erstaufnahme über Avery, multimodaler Foto-/Video-Walkthrough, automatisierte Raumerfassung und erste Schadenart-Klassifikation. Dieser Cluster bildet das Herzstück von Advansure und wird in den fachlichen Use Cases FA-01 bis FA-06 abgebildet.
Schadenermittlung
Kern-Fokus
Pauschalsummen-Validierung und Plausibilisierung. Die Schadenshöhe wird auf Basis der Pauschalmethode pro Raum und Schadensgrad berechnet. Eine echte Policen-/Deckungsprüfung ist im PoC nicht abgebildet, aber konzeptionell vorgesehen.
Regulierung & Auszahlung
Sofortregulierung und Sachbearbeiter-Freigabe. Im PoC wird die Sachbearbeiter-Logik bewusst ausgespart; Advansure liefert lediglich den vorbereiteten Datensatz für die Regulierung.
Nach der Regulierung
Schadenakte, Statusverfolgung und anlassbezogene Beratung. Advansure realisiert in diesem Cluster eine schlanke Statusverfolgung (FA-08), die dem Versicherungsnehmer den aktuellen Bearbeitungsstand seiner Schadenmeldung anzeigt.

### 2.1.2 Nutzenversprechen pro Stakeholder
Aus den fokussierten Capabilities ergibt sich für die drei wesentlichen Stakeholder-Gruppen jeweils ein konkretes Nutzenversprechen:
Stakeholder
Nutzenversprechen
Versicherungsnehmer
Schaden in wenigen Minuten dokumentiert - ohne ein klassisches Formular auszufüllen. Klare Anleitung durch Avery, transparente erste Schadeneinschätzung und unmittelbare Vorgangsnummer als Bestätigung.
Versicherer
Strukturierte Schadensdaten ab dem ersten Kundenkontakt. Reduzierter manueller Aufwand in der Erstaufnahme, da Schadenstyp, Räume und Schadensgrade bereits klassifiziert vorliegen. Schnellere Time-to-Cash durch frühzeitige Plausibilisierung.
Sachbearbeiter
Konzeptionell erhält der Sachbearbeiter im späteren Ausbau einen vorqualifizierten Datensatz inklusive Videomaterial und KI-Einschätzung. Er kann sich auf Plausibilisierung und Eskalationsfälle konzentrieren statt auf reine Datenerfassung.

## 2.2 Fachliche Anwendungsfälle
Die folgenden fachlichen Anwendungsfälle (FA-01 bis FA-08) beschreiben die nutzerseitige Sicht auf Advansure. Sie sind sprachlich an die Hausratversicherungs-Domäne angelehnt und nicht technisch geschnitten. Jeder Use Case dokumentiert Ziel, Akteur, Auslöser, Vor- und Nachbedingungen, den Normalablauf, mindestens einen Alternativablauf, die geplante Umsetzung im PoC sowie die fachlichen Testszenarien.
Eine zusammenfassende Übersicht über alle fachlichen Use Cases findet sich in nachstehender Tabelle. Die Detailbeschreibungen folgen darunter.
ID
Titel
Hauptakteur
FA-01
App-Start & Session-Initialisierung
Versicherungsnehmer
FA-02
Schaden über Avery-Dialog melden
Versicherungsnehmer, Avery
FA-03
Foto-Walk durchführen (Happy Path)
Versicherungsnehmer, Avery, KI-Vision
FA-04
Foto-Walk mit erneuter Aufforderung (Iteration)
Versicherungsnehmer, Avery, KI-Vision
FA-05
Foto-Walk abbrechen
Versicherungsnehmer
FA-06
Kamera-Berechtigung verweigert
Versicherungsnehmer
FA-07
Schadenmeldung abschicken & Vorgangsnummer erhalten
Versicherungsnehmer
FA-08
Status der Schadenmeldung verfolgen
Versicherungsnehmer

### FA-01: App-Start & Session-Initialisierung
Ziel
Der Versicherungsnehmer öffnet die Advansure-PWA und bekommt seine Stammdaten geladen, sodass er anschließend einen Schaden melden kann.
Akteur
Versicherungsnehmer (Leon)
Auslöser
Der Versicherungsnehmer öffnet die Advansure-PWA über den Browser oder als installierte PWA.
Vorbedingungen
Der Versicherungsnehmer besitzt eine gültige Hausratversicherungspolice bei Advansure. Die PWA ist auf dem Gerät installiert oder über die URL aufrufbar. Eine aktive Internetverbindung besteht.
Nachbedingungen
Die Session ist aktiv, Stammdaten (Name, Police, Wohnfläche) sind im Frontend verfügbar, der personalisierte Startscreen wird angezeigt.
#### Normalablauf
1.Der Versicherungsnehmer öffnet die Advansure-PWA.
2.Das System lädt die zugehörige Police aus der Datenbank.
3.Das System erzeugt eine Session und übergibt die Stammdaten an das Frontend.
4.Das System zeigt einen personalisierten Startscreen mit Begrüßung („Hey Leon, was liegt an?“) und der Option, einen Schaden zu melden.
Alternativablauf 1 - Keine aktive Police vorhanden
Nach Schritt 2: Das System findet keine gültige Police und zeigt eine Fehlermeldung („Keine aktive Police gefunden. Bitte wenden Sie sich an Ihren Berater.“). Der Versicherungsnehmer kann die App nicht weiter nutzen.
Alternativablauf 2 - Offline-Start
Nach Schritt 1: Es besteht keine Internetverbindung. Die PWA zeigt einen Offline-Hinweis und bietet an, es erneut zu versuchen, sobald die Verbindung wiederhergestellt ist.
Umsetzung für den PoC
Die Police wird als Seed-Datensatz für drei Demo-Personas (Leon, Robert, Julia) in Supabase angelegt. Beim App-Start wird über eine Mock-User-ID die jeweilige Police geladen. Es gibt keine echte Authentifizierung.
Testszenarien
Standardfall: Demo-Persona Leon öffnet die App - Startscreen mit „Hey Leon“ wird korrekt angezeigt.
Mehrere Personas: Wechsel zwischen Leon, Robert und Julia - jeweils korrekte Stammdaten (Wohnfläche, Versicherungssumme) sichtbar.
Fehlerfall keine Police: Mock-User-ID ohne Policendatensatz - Fehlermeldung wird angezeigt, kein Schadenflow startbar.
Offline-Verhalten: Browser im Flugmodus öffnet die PWA - Offline-Hinweis erscheint, kein Absturz.

### FA-02: Schaden über Avery-Dialog melden
Ziel
Der Versicherungsnehmer beschreibt seinen Schaden in natürlicher Sprache, und Avery erkennt den Schadenstyp sowie die Ursache.
Akteur
Versicherungsnehmer, Avery (KI-Assistent)
Auslöser
Der Versicherungsnehmer tippt auf dem Startscreen auf „Schaden melden“ oder schreibt eine entsprechende Nachricht an Avery.
Vorbedingungen
FA-01 ist erfolgreich abgeschlossen. Der Startscreen ist aktiv. Die Avery-Chat-Komponente ist erreichbar.
Nachbedingungen
Der Schadenstyp (z. B. Wasserschaden) und die mutmaßliche Ursache (z. B. defekte Waschmaschine) sind erfasst und in Supabase gespeichert. Der Übergang zum Foto-Walk ist vorbereitet.
#### Normalablauf
1.Der Versicherungsnehmer öffnet den Avery-Chat.
2.Der Versicherungsnehmer beschreibt den Schaden in eigenen Worten (z. B. „Wasserschaden, Waschmaschine kaputt“).
3.Das System leitet die Nachricht an die KI weiter und erkennt Schadenstyp und Ursache.
4.Avery antwortet empathisch und schlägt vor, einen Foto-Walk zu starten.
5.Das Frontend zeigt einen Button „Foto-Walk starten“.
Alternativablauf 1 - Unklarer Intent
Nach Schritt 3: Die KI kann den Schadenstyp nicht eindeutig erkennen. Avery stellt eine Rückfrage („Kannst du das etwas genauer beschreiben?“) und wartet auf eine präzisere Eingabe.
Alternativablauf 2 - Nicht abgedeckter Schaden
Nach Schritt 3: Die KI erkennt einen Schadenstyp, der von einer Hausratversicherung nicht abgedeckt ist (z. B. KFZ-Schaden). Avery erklärt höflich, dass dieser Schaden nicht in Advansure gemeldet werden kann.
Umsetzung für den PoC
Die KI-Anbindung erfolgt über das Google AI Studio mit einem deutschen System-Prompt im Du-Format. Der Dialogverlauf wird in der Tabelle Conversations in Supabase persistiert.
Testszenarien
Standardfall Wasserschaden: Eingabe „Wasserschaden durch Waschmaschine“ - Avery erkennt Typ und Ursache korrekt.
Standardfall Feuerschaden: Eingabe „Kerze umgefallen, Sofa angekohlt“ - Avery erkennt Brand-/Feuerschaden.
Vager Input: Eingabe „Es ist was passiert“ - Avery stellt eine sinnvolle Rückfrage.
Nicht abgedeckter Schaden: Eingabe „Mein Auto wurde zerkratzt“ - Avery erklärt, dass dies kein Hausrat-Fall ist.
Dialog-Persistenz: Nach Reload der Seite ist der bisherige Verlauf wiederherstellbar.

### FA-03: Foto-Walk durchführen (Happy Path)
Ziel
Der Versicherungsnehmer dokumentiert den Schaden per Videoaufnahme, und die KI erstellt automatisiert eine Schadenseinschätzung pro Raum auf Basis der Pauschalmethode.
Akteur
Versicherungsnehmer, Avery, KI-Vision
Auslöser
Der Versicherungsnehmer klickt auf den Button „Foto-Walk starten“.
Vorbedingungen
FA-02 ist abgeschlossen. Der Schadenstyp ist bekannt. Die Kamera-Berechtigung ist erteilt oder wird im Verlauf erteilt.
Nachbedingungen
Pro betroffenen Raum liegt eine strukturierte Schadenseinschätzung (Raumtyp, Schadensgrad, Schadensart) vor. Die zugehörigen Videos sind in Supabase Storage gespeichert.
#### Normalablauf
1.Das System startet einen neuen Foto-Walk und legt eine eindeutige Walk-ID an.
2.Das Frontend fordert Kamera-Berechtigung an, falls noch nicht erteilt.
3.Avery zeigt die Anweisung „Filme zuerst den Raum mit dem größten Schaden.“.
4.Der Versicherungsnehmer nimmt ein kurzes Video (ca. 10-20 Sekunden) auf.
5.Das System lädt das Video in den Cloud-Storage hoch.
6.Das System sendet das Video an die KI-Vision zur Analyse.
7.Die KI liefert eine strukturierte Antwort mit Raumtyp, Schadenseinschätzung und der Information, ob die Dokumentation ausreichend ist.
8.Bei ausreichender Dokumentation bestätigt Avery: „Perfekt, das reicht mir. Lass mich kurz zusammenfassen…“.
Alternativablauf 1 - Mehrere Räume betroffen
Nach Schritt 8: Avery fragt, ob weitere Räume vom Schaden betroffen sind. Bei „Ja“ beginnt der Loop erneut bei Schritt 3 für den nächsten Raum.
Alternativablauf 2 - Unzureichende Dokumentation
Nach Schritt 7: Die KI meldet, dass die Aufnahme nicht ausreicht (siehe FA-04 Iterations-Loop).
Umsetzung für den PoC
Die Videoaufnahme erfolgt über die MediaRecorder-API im Browser. Videos werden in Supabase Storage abgelegt. Die KI-Analyse erfolgt über das Google AI Studio mit Multimodal-Input. Die Pauschalsätze (€200/€450/€800 pro m²) sind als Stammdaten konfiguriert.
Testszenarien
Standardfall ein Raum: Wasserschaden in Küche - ein Video reicht, Schadensgrad „mittel“ wird erkannt.
Standardfall mehrere Räume: Wasserschaden in Küche und Flur - zwei separate Videos werden korrekt zugeordnet.
Leichter Schaden: Kleiner Fleck im Wohnzimmer - KI klassifiziert als „leicht“.
Schwerer Schaden: Komplett überflutetes Bad - KI klassifiziert als „schwer“ oder „Totalschaden“.
Video-Persistenz: Nach Abschluss des Walks sind die Videos über die Walk-ID wiederabrufbar.

### FA-04: Foto-Walk mit erneuter Aufforderung (Iteration)
Ziel
Bei unzureichender Dokumentation fordert Avery gezielt eine zusätzliche Aufnahme an, bis die Einschätzung möglich ist oder die maximale Iterationszahl erreicht ist.
Akteur
Versicherungsnehmer, Avery, KI-Vision
Auslöser
Die KI signalisiert nach einer Iteration, dass die bisherige Dokumentation für eine valide Schadenseinschätzung nicht ausreicht.
Vorbedingungen
Mindestens eine Iteration aus FA-03 wurde durchgeführt. Der Iterationszähler ist kleiner als 5.
Nachbedingungen
Der Foto-Walk-Loop ist beendet. Eine aggregierte Schadenseinschätzung pro Raum liegt vor - entweder weil die KI „zufrieden“ war oder weil die maximale Iterationszahl erreicht wurde.
#### Normalablauf
1.Das System prüft, ob der Iterationszähler kleiner als 5 ist.
2.Das System extrahiert aus der KI-Antwort eine konkrete Folgeaufforderung (z. B. „Bitte zeige mir den Boden in der Küche näher.“).
3.Avery zeigt die Aufforderung im Chat an.
4.Der Versicherungsnehmer nimmt ein weiteres Video auf.
5.Das System wiederholt die Schritte aus FA-03 (Upload, KI-Analyse).
6.Der Loop endet, sobald die KI die Dokumentation als ausreichend bewertet oder die fünfte Iteration erreicht ist.
Alternativablauf 1 - Maximalzahl erreicht
Nach Schritt 6: Die fünfte Iteration ist abgeschlossen, ohne dass die KI „zufrieden“ ist. Das System verwendet die bis dahin gesammelten Daten und beendet den Walk mit einem Hinweis, dass die Einschätzung auf unvollständigen Daten basiert.
Alternativablauf 2 - Nutzer bricht vorzeitig ab
Während der Iteration: Der Versicherungsnehmer möchte nicht weiterfilmen und löst FA-05 aus.
Umsetzung für den PoC
Der Iterationszähler wird pro Walk in Supabase persistiert. Die KI-Antwort enthält ein satisfied-Flag und ein next_request-Feld. Der Loop ist auf 5 Iterationen begrenzt.
Testszenarien
Standardfall: Erstes Video unscharf, zweites Video klar - KI wechselt nach Iteration 2 auf „zufrieden“.
Maximalzahl: 5 unzureichende Videos in Folge - Walk wird mit Warnhinweis beendet, Schadenseinschätzung trotzdem erstellt.
Sinnvolle Folgeaufforderung: KI fordert spezifisch „Boden zeigen“ an, nicht generisch „nochmal filmen“.
Iterationszähler korrekt: Nach jeder Aufnahme wird der Zähler sichtbar/abrufbar um 1 erhöht.

### FA-05: Foto-Walk abbrechen
Ziel
Der Versicherungsnehmer kann den Foto-Walk jederzeit kontrolliert abbrechen, ohne dass eine unvollständige Schadenmeldung übermittelt wird.
Akteur
Versicherungsnehmer
Auslöser
Der Versicherungsnehmer klickt während eines laufenden Foto-Walks auf „Abbrechen“.
Vorbedingungen
Ein Foto-Walk wurde gestartet (FA-03 oder FA-04 läuft).
Nachbedingungen
Der Foto-Walk ist in der Datenbank als „abgebrochen“ markiert. Es wird keine Schadenmeldung erzeugt. Bereits aufgenommene Videos bleiben zur Nachvollziehbarkeit gespeichert.
#### Normalablauf
1.Der Versicherungsnehmer klickt auf „Abbrechen“.
2.Das Frontend zeigt einen Bestätigungsdialog: „Foto-Walk wirklich abbrechen?“.
3.Der Versicherungsnehmer bestätigt mit „Ja, abbrechen“.
4.Das System markiert den Walk als „cancelled“.
5.Das Frontend kehrt zum Startscreen zurück.
6.Avery sendet eine abschließende Nachricht: „Kein Problem. Du kannst jederzeit neu starten.“.
Alternativablauf 1 - Abbruch zurücknehmen
Nach Schritt 2: Der Versicherungsnehmer wählt „Nein, weitermachen“. Der Foto-Walk wird ohne Datenverlust fortgesetzt.
Umsetzung für den PoC
Der Walk-Status wird in Supabase auf „cancelled“ gesetzt. Bereits hochgeladene Videos bleiben im Storage erhalten und sind über die Walk-ID auffindbar.
Testszenarien
Standardfall: Walk nach Iteration 1 abbrechen - Status „cancelled“, keine Schadenmeldung erzeugt.
Abbruch zurücknehmen: „Nein, weitermachen“ - Walk läuft ohne Datenverlust weiter.
Mehrfacher Abbruch: Mehrere Walks hintereinander abbrechen - jeder erhält eigene cancelled-Markierung.
Datenintegrität: Nach Abbruch sind die bisherigen Videos im Storage noch vorhanden.

### FA-06: Kamera-Berechtigung verweigert
Ziel
Wenn der Versicherungsnehmer die Kamera-Berechtigung verweigert, reagiert das System verständlich und bietet sinnvolle Auswege.
Akteur
Versicherungsnehmer
Auslöser
Der Browser zeigt den Berechtigungs-Dialog für die Kamera an und der Versicherungsnehmer wählt „Nicht erlauben“.
Vorbedingungen
Der Foto-Walk wurde initiiert (FA-03 Schritt 2). Der Browser hat die Berechtigungsabfrage angezeigt.
Nachbedingungen
Der Versicherungsnehmer kennt den Grund, warum der Foto-Walk nicht starten kann, und hat eine Handlungsoption (Berechtigung neu anfragen oder textbasiert fortfahren).
#### Normalablauf
1.Das Frontend fordert die Kamera-Berechtigung an.
2.Der Versicherungsnehmer verweigert die Berechtigung im Browser-Dialog.
3.Das Frontend erkennt den Fehler und zeigt eine verständliche Erklärung: „Ohne Kamera-Zugriff kann ich keinen Foto-Walk durchführen.“.
4.Das Frontend zeigt zwei Optionen an: „Berechtigung neu anfragen“ oder „Schaden textbasiert beschreiben“.
5.Der Versicherungsnehmer wählt eine der Optionen.
Alternativablauf 1 - Berechtigung neu anfragen
Nach Schritt 4: Der Versicherungsnehmer wählt „Berechtigung neu anfragen“. Das Frontend stößt den Berechtigungs-Dialog erneut an.
Alternativablauf 2 - Textbasiert weitermachen
Nach Schritt 4: Der Versicherungsnehmer wählt „Schaden textbasiert beschreiben“. Avery führt einen Dialog ohne Video, in dem der Schaden über Fragen erfasst wird.
Umsetzung für den PoC
Im Frontend wird der NotAllowedError der MediaDevices-API abgefangen. Die textbasierte Alternative nutzt denselben Avery-Chat wie FA-02.
Testszenarien
Standardfall Verweigerung: Browser-Dialog ablehnen - verständliche Fehlermeldung erscheint, App stürzt nicht ab.
Berechtigung nachholen: Nach Verweigerung erneut anfragen - Dialog erscheint wieder, bei Zustimmung läuft Foto-Walk weiter.
Textbasierter Fallback: Schaden ohne Kamera melden - Avery führt strukturiertes Frage-Antwort-Gespräch.
Browser ohne Kamera: Desktop ohne Webcam - gleiche Fehlerbehandlung wie bei Verweigerung.

### FA-07: Schadenmeldung abschicken & lokale Vorgangsnummer erhalten
Ziel
Der Versicherungsnehmer reicht die fertige Schadenmeldung ein und erhält eine lokale Vorgangsnummer als Bestätigung.
Akteur
Versicherungsnehmer
Auslöser
Der Versicherungsnehmer klickt im Zusammenfassungs-Screen auf „Schaden absenden“.
Vorbedingungen
Der Foto-Walk ist abgeschlossen (FA-03 / FA-04). Eine Zusammenfassung mit allen Raumeinschätzungen und der voraussichtlichen Schadenshöhe wird angezeigt.
Nachbedingungen
Die vollständige Schadenmeldung ist in Supabase gespeichert. Eine eindeutige lokale Vorgangsnummer (z. B. ADV-2026-0482) wurde erzeugt und dem Versicherungsnehmer angezeigt.
#### Normalablauf
1.Der Versicherungsnehmer prüft die Zusammenfassung (betroffene Räume, Schadensgrade, geschätzte Schadenshöhe nach Pauschalmethode).
2.Der Versicherungsnehmer klickt auf „Schaden absenden“.
3.Das System aggregiert alle Daten (Dialog, Foto-Walk-Ergebnisse, Police-Bezug) in einen finalen Datensatz.
4.Das System erzeugt eine eindeutige Vorgangsnummer im Format ADV-JJJJ-XXXX.
5.Das System speichert die Schadenmeldung mit Status „Eingegangen“ in Supabase.
6.Das Frontend zeigt einen Erfolgs-Screen mit der Vorgangsnummer und einem Link zum Status-Screen.
Alternativablauf 1 - Zusammenfassung korrigieren
Nach Schritt 1: Der Versicherungsnehmer möchte etwas anpassen und klickt auf „Bearbeiten“. Er kann einen Raum entfernen oder einen weiteren Foto-Walk anhängen.
Alternativablauf 2 - Speicherfehler
Nach Schritt 5: Die Speicherung in Supabase schlägt fehl. Das System behält die Eingaben im lokalen State und bietet einen Retry-Button an.
Umsetzung für den PoC
Die Schadenmeldung wird in der Tabelle claims in Supabase persistiert. Die Vorgangsnummer wird über eine PostgreSQL-Sequenz generiert. Es gibt keine Anbindung an externe Versicherer-Backends.
Testszenarien
Standardfall: Komplette Meldung absenden - Vorgangsnummer ADV-2026-XXXX wird angezeigt und ist eindeutig.
Mehrere Räume: Schaden in 3 Räumen - alle Raumeinschätzungen sind im gespeicherten Datensatz enthalten.
Korrektur vor Absenden: Raum aus Zusammenfassung entfernen - nur die finalen Räume werden gespeichert.
Speicherfehler: Supabase nicht erreichbar - Retry-Button erscheint, keine doppelte Speicherung bei erfolgreichem Retry.
Eindeutigkeit: 100 simulierte Einreichungen erzeugen 100 verschiedene Vorgangsnummern.

### FA-08: Status der Schadenmeldung verfolgen
Ziel
Der Versicherungsnehmer kann den aktuellen Bearbeitungsstatus seiner Schadenmeldung in einem einfachen Status-Screen einsehen.
Akteur
Versicherungsnehmer
Auslöser
Der Versicherungsnehmer öffnet den Status-Screen direkt nach FA-07 oder später über einen Link in der App.
Vorbedingungen
Eine Schadenmeldung existiert mit gültiger Vorgangsnummer (FA-07 abgeschlossen).
Nachbedingungen
Der Versicherungsnehmer sieht den aktuellen Status (z. B. „Eingegangen“, „In Bearbeitung“) und eine Zeitlinie der bisherigen Status-Wechsel.
#### Normalablauf
1.Der Versicherungsnehmer öffnet den Status-Screen für seine Vorgangsnummer.
2.Das System lädt den aktuellen Status der Schadenmeldung aus Supabase.
3.Das Frontend zeigt eine Timeline-Komponente mit allen Status-Stufen („Eingegangen“, „In Bearbeitung“, „Geprüft“, „Abgeschlossen“).
4.Die bereits durchlaufenen Stufen sind farblich hervorgehoben.
5.Der Versicherungsnehmer sieht den Zeitstempel des letzten Status-Wechsels.
Alternativablauf 1 - Vorgangsnummer nicht gefunden
Nach Schritt 2: Die Vorgangsnummer existiert nicht in Supabase. Das System zeigt einen Hinweis: „Diese Vorgangsnummer kennen wir nicht.“.
Alternativablauf 2 - Manueller Refresh
Nach Schritt 5: Der Versicherungsnehmer klickt auf „Aktualisieren“. Das System lädt den Status neu und zeigt einen ggf. veränderten Status an.
Umsetzung für den PoC
Der Status wird in der Tabelle claims als Spalte status geführt. Für die Demo werden Status-Wechsel durch ein einfaches Skript oder einen zeitgesteuerten Trigger in Supabase simuliert. Es gibt keine echte Sachbearbeiter-Logik.
Testszenarien
Standardfall direkt nach Absenden: Status „Eingegangen“ wird angezeigt, Timeline beginnt korrekt.
Statuswechsel simulieren: Über Seed/Trigger Status auf „In Bearbeitung“ setzen - Timeline aktualisiert sich nach Refresh.
Abschluss-Status: Status „Abgeschlossen“ - alle Timeline-Stufen sind aktiv markiert.
Unbekannte Vorgangsnummer: Aufruf mit ungültiger ID - freundlicher Hinweis erscheint.
Mehrere Meldungen: Persona mit zwei Vorgängen - beide sind unabhängig voneinander aufrufbar.

## 2.3 BPMN-Prozessmodell
Die fachlichen Anwendungsfälle aus Kapitel 2.2 lassen sich zu einem zusammenhängenden Geschäftsprozess verdichten. Die folgende BPMN-Darstellung zeigt diesen Gesamtprozess aus der Sicht der Advansure-Anwendung und unterscheidet zwischen Frontend, Backend und den externen Pools für den Versicherungsnehmer (Leon) sowie das KI-Modell (Gemini). Persistente Daten landen jeweils in Supabase.

### 2.3.1 Gesamtprozess „Schadenmeldung über Advansure
[IMAGE]
Abbildung 2: BPMN-Gesamtprozess der Advansure-Schadenmeldung. Der Versicherungsnehmer interagiert ausschließlich mit dem Frontend. Backend-seitig laufen Persistierung, KI-Analyse und die Pauschalberechnung. Externe Pools: Endkunde und Gemini.
Der Prozess beginnt mit der Startaufforderung des Versicherungsnehmers (App-Start, FA-01) und endet entweder mit der erfolgreichen Anzeige des Ergebnisbildschirms und gestartetem Live-Status-Tracking (FA-07 / FA-08) oder mit dem regulären Session-Ende nach Inaktivität. Folgende fachlich relevante Schritte sind besonders hervorzuheben:
Frontend laden und Startbildschirm anzeigen: Hier werden die Stammdaten aus Supabase geladen (FA-01, TU-01).
Schadensfall an Avery übermittelt: Übergang in den dialoggeführten Schadenflow (FA-02, TU-02). Bei 5 Minuten Inaktivität endet die Session.
Schadendetails an Gemini senden: Das Backend reichert die Anfrage mit dem bisherigen Dialogverlauf an und übergibt sie an Gemini.
Foto-Walk durchführen: Sub-Prozess (Call Activity) mit eigenem BPMN-Diagramm (Abschnitt 2.3.2). Dort findet die iterative Videoaufnahme und KI-Analyse statt.
Pauschalsumme berechnen und Ergebnisse persistieren: Backend-seitige Verdichtung der Foto-Walk-Ergebnisse über die Pauschalmethode (TU-05) und Persistenz in Supabase (TU-06).

### 2.3.2 Sub-Prozess „Foto-Walk durchführen“
Der Foto-Walk ist der zentrale, iterative Sub-Prozess von Advansure. Er behandelt die Kamera-Berechtigung, das Aufnehmen und Übertragen von Videomaterial sowie die Auswertung durch Gemini. Über ein „Videomaterial genügt?“-Gateway entscheidet sich, ob der Walk endet oder eine erneute Aufnahme angefordert wird. Eine zweite Verzweigung („Mehr als 3 Versuche?“) bricht den Walk kontrolliert ab, wenn die Dokumentation auch nach mehreren Iterationen nicht ausreichend ist.
[IMAGE]
Abbildung 3: BPMN-Sub-Prozess „Foto-Walk durchführen“. Das Iterations-Gateway begrenzt die Anzahl Folgeaufnahmen, ein zweites Gateway behandelt die Kamera-Berechtigung.
Wichtige Verzweigungen im Sub-Prozess:
Zugriff erteilt? (XOR-Gateway): Bei „Nein“ wird der Foto-Walk kontrolliert abgebrochen und FA-06 ausgelöst (textbasierter Fallback).
Videomaterial genügt? (XOR-Gateway): Liefert die KI satisfied=true, wird die Kamera geschlossen und Avery meldet den Erfolg. Bei satisfied=false beginnt eine neue Iteration mit gezielter Folgeaufforderung.
Mehr als 3 Versuche? (XOR-Gateway): Notausgang aus dem Iterations-Loop. Im PoC ist die Maximalzahl auf 5 Iterationen konfigurierbar; im Diagramm symbolisiert „3 Versuche“ die Abbruchlogik gemäß FA-04 Alternativablauf 1.

### 2.3.3 Zuordnung zu fachlichen Use Cases
Die folgende Tabelle ordnet die Aktivitäten des BPMN-Modells den fachlichen Anwendungsfällen aus Kapitel 2.2 zu.
BPMN-Aktivität / Gateway
Use Case
Hinweis
Frontend laden / Startbildschirm anzeigen
FA-01
Stammdaten werden aus Supabase geladen.
Schadensfall an Avery übermittelt
FA-02
Übergang in den dialoggeführten Flow.
Foto-Walk durchführen (Call Activity)
FA-03 / FA-04 / FA-05 / FA-06
Sub-Prozess mit Iterationslogik.
Pauschalsumme berechnen
FA-07 (implizit), TU-05
Backend-Berechnung über Pauschalmethode.
Ergebnisse persistieren
FA-07, TU-06
Schreiben in claims/rooms.
Ergebnisbildschirm anzeigen
FA-07 / FA-08
Anzeige der Vorgangsnummer und Status.
5 Minuten Inaktivität (Timer)
FA-01 (negativ)
Session-Timeout, kontrollierter Abschluss.

## 2.4 Technische Anwendungsfälle
Die technischen Anwendungsfälle (TU-01 bis TU-06) übersetzen die fachlichen Use Cases in technische Verantwortlichkeiten der einzelnen Komponenten. Sie orientieren sich an der finalen Stack-Entscheidung (Next.js, Supabase, Google AI Studio) und sind so geschnitten, dass jede TUC einem konkreten Implementierungs-Artefakt entspricht.
Eine Übersicht über die TUCs gibt nachstehende Tabelle. Die Detailbeschreibungen folgen darunter.
ID
Titel
Hauptkomponente
TU-01
Session erzeugen und Stammdaten ausliefern
API Gateway, Supabase
TU-02
KI-Dialog-Endpunkt für Avery
API Gateway, Google AI Studio
TU-03
Videoaufnahme und Upload in den Cloud-Storage
Frontend, Supabase Storage
TU-04
Video-Analyse durch KI-Vision
Analyse-Service, Google AI Studio
TU-05
Schadenshöhe nach Pauschalmethode berechnen
Valuation-Service
TU-06
Schadenmeldung persistieren und Vorgangsnummer generieren
API Gateway, Supabase Postgres

### TU-01: Session erzeugen und Stammdaten ausliefern
Ziel
Das System erzeugt beim App-Start eine Session und liefert Stammdaten der zugeordneten Police an das Frontend.
Akteur
Frontend, Backend (Supabase), Stammdaten-Tabelle
Auslöser
Das Frontend ruft beim Laden der PWA den Session-Endpunkt mit einer Mock-User-ID auf.
Vorbedingungen
Die Tabellen für Personas und Policen sind in Supabase angelegt und mit Seed-Daten befüllt.
Nachbedingungen
Im Frontend liegen eine gültige Session sowie die Stammdaten der Police (Name, Wohnfläche, Versicherungssumme) vor.
#### Normalablauf
1.Das Frontend sendet einen Init-Request mit der Mock-User-ID.
2.Das Backend liest die zugehörige Persona und Police aus Supabase.
3.Das Backend erzeugt ein Session-Objekt mit der Persona-ID und einer Ablaufzeit.
4.Das Backend liefert Session und Stammdaten als JSON-Antwort an das Frontend.
5.Das Frontend speichert die Daten im Client-State und rendert den Startscreen.
Alternativablauf 1 - Persona ohne Police
Nach Schritt 2: Es existiert keine Police zur Persona. Das Backend antwortet mit einem 404-Fehler. Das Frontend zeigt die Fehlermeldung aus FA-01 an.
Umsetzung für den PoC
Implementierung als Next.js Route Handler. Die Session wird als signiertes Cookie oder als einfaches Token im Client-State gehalten. Zugriff auf Supabase über die offizielle JS-Client-Library.
Testszenarien
Existierende Persona: Mock-User-ID „Leon“ - Session und Police werden korrekt zurückgegeben.
Unbekannte Persona: Mock-User-ID „unbekannt“ - 404 wird zurückgegeben, Frontend zeigt Fehlermeldung.
Datenkonsistenz: Wohnfläche und Versicherungssumme stimmen mit Seed-Daten überein.
Mehrere Personas parallel: Drei Personas in drei Tabs - Sessions sind voneinander isoliert.

### TU-02: KI-Dialog-Endpunkt für Avery
Ziel
Das Backend leitet Nachrichten des Versicherungsnehmers an das Google AI Studio weiter und liefert die KI-Antwort strukturiert zurück.
Akteur
Frontend, Backend, Google AI Studio
Auslöser
Das Frontend sendet eine neue Nachricht aus dem Avery-Chat an den Dialog-Endpunkt.
Vorbedingungen
TU-01 ist erfolgreich abgeschlossen. Der API-Key für das KI-Modell ist konfiguriert. Der System-Prompt für Avery ist geladen.
Nachbedingungen
Die Nachricht und die KI-Antwort sind in der Tabelle conversations gespeichert. Eine erkennbare Intent-Struktur (Schadenstyp, Ursache) liegt vor.
#### Normalablauf
1.Das Frontend sendet die Nachricht zusammen mit der Walk-/Claim-ID an das Backend.
2.Das Backend lädt den bisherigen Dialogverlauf aus Supabase.
3.Das Backend ruft das Google AI Studio mit System-Prompt, Verlauf und neuer Nachricht auf.
4.Das Backend parst die KI-Antwort, extrahiert Intent-Felder und schreibt beides in Supabase.
5.Das Backend gibt die Antwort an das Frontend zurück.
Alternativablauf 1 - KI-API nicht erreichbar
Nach Schritt 3: Die Anfrage an das SDK schlägt fehl (Timeout, 5xx). Das Backend führt bis zu zwei Retries mit exponentiellem Backoff aus. Bleibt der Fehler bestehen, wird ein definierter Fehlercode an das Frontend zurückgegeben.
Alternativablauf 2 - Antwort nicht parsbar
Nach Schritt 4: Die KI-Antwort enthält kein gültiges JSON. Das Backend speichert den Rohtext und liefert eine generische Avery-Antwort zurück, ohne Intent-Felder zu setzen.
Umsetzung für den PoC
Implementierung als Next.js Route Handler mit Aufruf des Google AI Studio. Der System-Prompt ist als Konstante in der Codebasis abgelegt. Logging der Anfragen/Antworten erfolgt in einer audit_logs-Tabelle.
Testszenarien
Standardfall: Eingabe „Wasserschaden“ - KI-Antwort enthält strukturierten Intent.
Dialog-Kontext: Zweite Nachricht baut auf erster auf - Verlauf wird korrekt mitgesendet.
KI-Ausfall: API-Key invalidieren - Retry-Logik greift, danach saubere Fehlermeldung.
Antwort-Parsing: Bewusst fehlerhaften Mock einsetzen - generische Antwort wird ausgeliefert, kein Absturz.
Audit-Log: Nach jedem Aufruf existiert ein Log-Eintrag mit Request- und Response-Hash.

### TU-03: Videoaufnahme und Upload in den Cloud-Storage
Ziel
Das Frontend nimmt ein Video auf und überträgt es zuverlässig in den Supabase-Storage.
Akteur
Frontend, Browser (MediaRecorder-API), Supabase Storage
Auslöser
Das Frontend startet die Aufnahme nach dem Klick auf „Foto-Walk starten“ oder nach einer Folgeaufforderung.
Vorbedingungen
Kamera-Berechtigung ist erteilt. Eine gültige Walk-ID existiert. Eine Netzwerkverbindung besteht.
Nachbedingungen
Das Video liegt im Supabase Storage. Die zugehörige Storage-URL ist in der rooms-Tabelle gespeichert.
#### Normalablauf
1.Das Frontend initialisiert den MediaRecorder mit Kamera-Stream.
2.Der Versicherungsnehmer startet und stoppt die Aufnahme.
3.Das Frontend erzeugt einen Blob mit dem Videoinhalt.
4.Das Frontend lädt den Blob in den Supabase Storage hoch (Pfad: walks/{walk_id}/{iteration}.webm).
5.Das Frontend ruft den Backend-Endpunkt auf, der die Storage-URL in der rooms-Tabelle persistiert.
6.Das Frontend liefert die Storage-URL an den nächsten Verarbeitungsschritt weiter.
Alternativablauf 1 - Upload-Fehler
Nach Schritt 4: Der Upload schlägt fehl (Netzwerk, Speicherquote). Das Frontend versucht einen erneuten Upload und zeigt bei wiederholtem Fehlschlagen eine Fehlermeldung an.
Alternativablauf 2 - Aufnahme zu kurz
Nach Schritt 2: Die Aufnahme ist kürzer als 2 Sekunden. Das Frontend verwirft die Aufnahme und fordert eine neue an.
Umsetzung für den PoC
Aufnahme über die MediaRecorder-API (WebM/VP8). Upload über die offizielle Supabase Storage SDK. Die Storage-URL wird über einen Next.js Route Handler in die rooms-Tabelle geschrieben.
Testszenarien
Standardfall Aufnahme: 10-Sekunden-Video aufnehmen, abspielen, Upload erfolgreich.
Mehrere Iterationen: 3 Aufnahmen für einen Walk - alle 3 Dateien im Storage unter walks/{walk_id}/.
Upload-Fehler: Verbindung gezielt abbrechen - Retry-Mechanismus greift.
Zu kurze Aufnahme: 1-Sekunden-Clip - wird verworfen, neue Aufnahme angefordert.
Datenintegrität: Hochgeladenes Video ist abspielbar und entspricht dem aufgenommenen Inhalt.

### TU-04: Video-Analyse durch KI-Vision
Ziel
Das Backend übergibt ein Video an die KI-Vision-Komponente und erhält eine strukturierte Schadenseinschätzung zurück.
Akteur
Backend, Google AI Studio (Multimodal)
Auslöser
Das Backend wird nach erfolgreichem Video-Upload mit der Storage-URL aufgerufen.
Vorbedingungen
TU-03 ist abgeschlossen. Die Storage-URL ist gültig und das Video ist abrufbar.
Nachbedingungen
Eine strukturierte Schadenseinschätzung (Raumtyp, Schadensgrad, Schadensart, satisfied-Flag) liegt im Backend vor und ist in der rooms-Tabelle gespeichert.
#### Normalablauf
1.Das Backend lädt das Video aus Supabase Storage.
2.Das Backend baut einen Multimodal-Request mit System-Prompt und Video-Referenz.
3.Das Backend ruft das Google AI Studio auf und wartet bis zu 30 Sekunden auf die Antwort.
4.Das Backend validiert die Antwort gegen das vereinbarte JSON-Schema (damage_assessment, satisfied, next_request).
5.Das Backend persistiert die strukturierte Antwort in der rooms-Tabelle.
6.Das Backend liefert die strukturierte Antwort an das Frontend zurück.
Alternativablauf 1 - Timeout oder API-Fehler
Nach Schritt 3: Die KI antwortet nicht innerhalb 30 Sekunden oder liefert einen Fehler. Das Backend versucht bis zu 2 Retries mit exponentiellem Backoff. Bleibt der Fehler bestehen, wird der Walk-Status auf error_external_api gesetzt und das Frontend informiert.
Alternativablauf 2 - Antwort entspricht nicht dem Schema
Nach Schritt 4: Die KI-Antwort enthält ungültige Felder. Das Backend protokolliert den Vorfall im Audit-Log und gibt einen Schema-Fehler an das Frontend zurück, das die Iteration als unzureichend behandelt.
Umsetzung für den PoC
Multimodal-Aufrufe über das Google AI Studio. Validierung des JSON-Schemas mit zod im Next.js Route Handler. Alle Anfragen werden im Audit-Log gespeichert.
Testszenarien
Standardfall: Klar erkennbares Wasserschaden-Video - Schema-konforme Antwort, satisfied=true.
Unklares Video: Verwackeltes Video - satisfied=false mit konkretem next_request.
Timeout: API künstlich verzögern - Retry-Logik greift, ggf. Walk-Status auf error_external_api.
Schema-Fehler: Mock liefert ungültiges JSON - Backend reagiert kontrolliert, kein 500-Crash.
Persistenz: Antwort ist nach Aufruf in der rooms-Tabelle reproduzierbar.

### TU-05: Schadenshöhe nach Pauschalmethode berechnen
Ziel
Das Backend berechnet auf Basis der erkannten Räume und Schadensgrade die voraussichtliche Schadenshöhe nach der Pauschalmethode.
Akteur
Backend, Stammdaten-Konfiguration (Pauschalsätze)
Auslöser
Der Foto-Walk-Loop ist abgeschlossen (FA-03 oder FA-04 endet).
Vorbedingungen
Mindestens ein Raum mit Schadensgrad ist in der rooms-Tabelle gespeichert. Die Pauschalsätze pro Schadensgrad sind als Stammdaten konfiguriert (€80/€200/€450/€800 pro m²).
Nachbedingungen
Pro Raum ist ein berechneter Schadensbetrag in der rooms-Tabelle gespeichert. Eine Gesamtsumme für die Schadenmeldung liegt vor.
#### Normalablauf
1.Das Backend lädt alle Räume des Walks aus der rooms-Tabelle.
2.Das Backend ermittelt für jeden Raum die Raumgröße aus den Police-Stammdaten oder Defaultwerten.
3.Das Backend mappt den Schadensgrad pro Raum auf den hinterlegten Pauschalsatz.
4.Das Backend berechnet pro Raum: Raumgröße × Pauschalsatz.
5.Das Backend summiert alle Raumbeträge zu einer Gesamtsumme.
6.Das Backend speichert Einzelbeträge und Gesamtsumme in Supabase.
Alternativablauf 1 - Raumgröße nicht hinterlegt
Nach Schritt 2: Für einen Raumtyp ist keine Größe definiert. Das Backend nutzt einen konfigurierten Defaultwert pro Raumtyp (z. B. Küche: 8 m²).
Alternativablauf 2 - Unbekannter Schadensgrad
Nach Schritt 3: Der erkannte Schadensgrad ist nicht im Katalog enthalten. Das Backend markiert den Raum als „manuelle Prüfung erforderlich“ und schließt ihn aus der automatischen Berechnung aus.
Umsetzung für den PoC
Berechnungslogik als reine TypeScript-Funktion. Pauschalsätze und Default-Raumgrößen sind in einer Konfigurationsdatei abgelegt. Persistierung über Drizzle ORM in PostgreSQL.
Testszenarien
Ein Raum, Schadensgrad mittel: Küche 8 m² × €450 = 3.600 € - korrektes Ergebnis.
Mehrere Räume gemischt: Küche „mittel“ + Flur „leicht“ - Einzelbeträge und Summe korrekt.
Default-Raumgröße: Raum ohne hinterlegte Größe - Defaultwert greift, Berechnung erfolgreich.
Unbekannter Schadensgrad: KI liefert „katastrophal“ - Raum wird ausgeschlossen, Hinweis erscheint.
Persistenz: Nach Reload sind Einzelbeträge und Gesamtsumme identisch.

### TU-06: Schadenmeldung persistieren und Vorgangsnummer generieren
Ziel
Das Backend speichert eine vollständige Schadenmeldung atomar und liefert eine eindeutige Vorgangsnummer zurück.
Akteur
Backend, Supabase (PostgreSQL)
Auslöser
Das Frontend sendet den Submit-Aufruf für eine fertige Schadenmeldung (FA-07).
Vorbedingungen
Alle zugehörigen Datensätze (Dialog, Räume, berechnete Beträge) liegen in Supabase vor.
Nachbedingungen
In der claims-Tabelle existiert ein neuer Datensatz mit Status „Eingegangen“, eindeutiger Vorgangsnummer und Referenzen auf Räume und Dialog. Die Vorgangsnummer wurde an das Frontend ausgeliefert.
#### Normalablauf
1.Das Backend startet eine Datenbank-Transaktion.
2.Das Backend prüft die Vollständigkeit der referenzierten Daten (mindestens 1 Raum, gültige Police).
3.Das Backend zieht aus einer PostgreSQL-Sequenz die nächste Vorgangsnummer und formatiert sie als ADV-JJJJ-XXXX.
4.Das Backend legt den claims-Datensatz mit Status „Eingegangen“ an und verknüpft die zugehörigen rooms-Einträge.
5.Das Backend bestätigt die Transaktion (Commit).
6.Das Backend liefert Vorgangsnummer und Bestätigungszeitstempel an das Frontend.
Alternativablauf 1 - Validierung schlägt fehl
Nach Schritt 2: Es ist kein Raum referenziert oder die Police existiert nicht. Das Backend bricht die Transaktion ab und gibt einen 422-Fehler zurück.
Alternativablauf 2 - Datenbankfehler beim Commit
Nach Schritt 5: Der Commit schlägt fehl. Die Transaktion wird zurückgerollt, es entstehen keine Teildaten. Das Frontend erhält einen 5xx-Fehler und kann erneut einreichen.
Umsetzung für den PoC
Implementierung als Next.js Route Handler. Persistierung über Drizzle ORM mit Transaktionsklammern. Vorgangsnummern werden über eine PostgreSQL-Sequenz erzeugt und im Application Layer in das Anzeigeformat überführt.
Testszenarien
Standardfall Einreichung: Vollständige Daten - claims-Eintrag, Vorgangsnummer und Verknüpfungen sind korrekt.
Eindeutigkeit: 100 simulierte Einreichungen - 100 unterschiedliche Vorgangsnummern, keine Duplikate.
Validierungsfehler: Submit ohne Raum - 422, kein claims-Datensatz erzeugt.
Transaktionsfehler: Commit künstlich abbrechen - kein halber Datensatz in der Datenbank.

## 2.5 Kontextdiagramm, Datenflüsse, Kommunikationsstrukturen und Abhängigkeiten
Nachdem in den Kapiteln 2.2 bis 2.4 die fachliche und technische Logik beschrieben wurde, geht es in diesem Kapitel um die Außensicht und die Verbindungen der Lösung: Welche Komponenten gehören zum System? Welche externen Systeme sind eingebunden? Wie fließen die Daten zwischen ihnen? Welche Protokolle und Kommunikationsmuster kommen zum Einsatz? Und welche Abhängigkeiten ergeben sich daraus für den Betrieb?

### 2.5.1 Kontextdiagramm
Das Kontextdiagramm bildet die oberste Abstraktionsebene der Lösung. Es zeigt Advansure als System under Design im Zentrum, den Versicherungsnehmer (Persona Leon) als wesentlichen Akteur sowie die beiden externen Systeme Google AI Studio und Supabase, ohne die Advansure nicht funktionieren kann.
[IMAGE]
Abbildung 4: Kontextdiagramm Advansure. Der Versicherungsnehmer meldet einen Schaden über die PWA, das Backend leitet die Video-Analyse an das Google AI Studio weiter, persistente Daten landen in Supabase.
Die wesentlichen Schnittstellen aus dem Kontextdiagramm:
Endkunde → Advansure: Schadensmeldung über die PWA. Interaktionen über Browser-UI (HTTPS).
Advansure → Google AI Studio: Aufrufe an Gemini für Dialogsteuerung (TU-02) und Videoanalyse (TU-04). HTTPS-Aufrufe mit JSON und Base64-codierten Videoinhalten.
Advansure → Supabase: Persistenz von Stammdaten, Dialogen, Räumen, Schadenmeldungen sowie Speicherung der Videos im Storage und Auth-Validierung.

### 2.5.2 Datenflüsse
Während das Kontextdiagramm zeigt, welche Systeme miteinander sprechen, fokussiert das Datenflussdiagramm darauf, welche Daten zwischen ihnen fließen. Der für die Lösung zentrale Datenfluss ist der Foto-Walk-Loop: Eine einzelne Iteration umfasst das Hochladen eines Videos, die Analyse durch Gemini und die Rückgabe der nächsten Anweisung an den Versicherungsnehmer.
[IMAGE]
Abbildung 5: Datenfluss „Foto-Walk-Loop“. Eine vollständige Iteration besteht aus Video-Upload, Persistierung, History-Aggregation, multimodalem Gemini-Aufruf, Antwort-Validierung und State-Update. Bei satisfied=false beginnt die nächste Iteration.
Die acht im Diagramm nummerierten Schritte beschreiben den Loop wie folgt:
#
Quelle → Ziel
Inhalt
1
PWA → API Gateway
multipart/form-data mit Video, claimId und roomId.
2
API Gateway → Supabase
Video wird im Storage Bucket persistiert (walks/{walk_id}/{iteration}.webm).
3
API Gateway → Analyse-Service
Übergabe von video_id, context und iteration.
4
Analyse-Service → Supabase
Laden der bisherigen Turns (Dialog- und Foto-Walk-History) für den Prompt-Aufbau.
5
Analyse-Service → Google AI Studio
Multimodaler Prompt: System-Prompt + History + Video-Referenz.
6
Google AI Studio → Analyse-Service
JSON-Response mit den Feldern satisfied, user_message und damage_assessment.
7
Analyse-Service → Supabase
Turn speichern, State (Iterationszähler, Status) aktualisieren.
8
API Gateway → PWA
Avery-Antwort: nächste Anweisung an den Versicherungsnehmer.
Der Loop endet, sobald die KI in Schritt 6 satisfied=true zurückliefert oder die Maximalzahl der Iterationen erreicht ist. Bei satisfied=false beginnt der Loop erneut bei Schritt 1, mit erhöhtem Iterationszähler.

### 2.5.3 Kommunikationsstrukturen
Während das Datenflussdiagramm zeigt, welche Daten konkret fließen, beschreibt die folgende Tabelle, wie kommuniziert wird - also die Protokolle, Formate und ob synchron oder asynchron kommuniziert wird.
Alle Verbindungen sind synchron via HTTPS. Die bewusste Beschränkung auf synchrone Request-Response-Muster macht die Architektur transparent und im Rahmen der Konzept-Realisierung beherrschbar.
Verbindung
Protokoll
Format
Sync/Async
Pattern
PWA → API Gateway
HTTPS/REST
multipart, JSON
sync
Request/Response
Analyse-Service → Google AI Studio
HTTPS/REST
JSON + Base64 Video
sync
Request/Response (Google AI Studio)
Backend → Supabase Storage
HTTPS/REST
Binär (Video)
sync
Upload via Supabase Client
Backend → Supabase Postgres
HTTPS/REST
JSON (SQL via PostgREST)
sync
CRUD via Supabase Client
PWA ↔ Supabase Auth
HTTPS/OAuth2 + OIDC
JWT
sync
Auth-UI / supabase-js
API Gateway → Supabase Auth
HTTPS/REST
JWT-Validation
sync
Token-Verifikation (Server-Side)
#### Erkenntnisse und Implikationen
Aus der Kommunikationsstruktur ergeben sich drei zentrale Erkenntnisse für die Architektur:
Erstens: Bewusst reduzierter Scope. Alle Verbindungen sind synchron via HTTPS. Wir verzichten in der ersten Ausbaustufe bewusst auf asynchrone Event-Bus-Strukturen, Webhooks und Push-Notifications. Dies macht die Architektur transparent und im Rahmen der Konzept-Realisierung beherrschbar.
Zweitens: Google AI Studio-Aufruf als kritischer synchroner Pfad. Der Aufruf an Google AI Studio ist synchron und kann 5-12 Sekunden dauern. Dies ist der einzige Punkt in der Architektur, an dem der User aktiv auf eine externe Antwort wartet. Hier ist Timeout-Management essenziell; optional kann das Streaming-Feature des Google AI Studio genutzt werden, um die wahrgenommene Wartezeit zu reduzieren.
Drittens: Supabase als konsolidiertes Backend. Supabase bündelt drei Funktionen (PostgreSQL-Datenbank, Object Storage, Authentifizierung) in einem Service. Dies reduziert die Zahl der externen Abhängigkeiten erheblich, vereinfacht die Authentifizierung gegenüber separaten Identity Providern und liefert eine DSGVO-konforme EU-Hosting-Option out of the box.
#### Bewusst weggelassene Komponenten
Für die Realisierung im Projektzeitraum wurden folgende Komponenten bewusst aus dem Scope genommen:
Webhook-Empfänger für externe Status-Updates
Background-Job-Queue für aufwendige Bewertungsschritte
Push-Notification-Service für User-Benachrichtigungen
Anbindung an ein externes Bestandssystem (z. B. ReSy)
Eigene Sachbearbeiter-Ansicht (Cockpit)
Diese Komponenten sind explizit nicht Teil von MST02 und MST03 und würden in einer späteren Ausbaustufe ergänzt werden.

### 2.5.4 Abhängigkeitsdiagramm
Das Abhängigkeitsdiagramm fasst zusammen, welche Komponenten von welchen anderen Komponenten abhängen und wie kritisch der Ausfall einer Komponente für die Funktionsfähigkeit von Advansure ist. Es ergänzt das Kontext- und Architekturdiagramm um eine Risiko-/Kritikalitäts-Sicht.
[IMAGE]
Abbildung 6: Abhängigkeitsdiagramm Advansure. Vier Schichten (User-Facing, Application Logic, Foundation, Kritikalität). Rot markierte Komponenten sind kritisch (Ausfall = Stillstand), gelb markierte sind wichtig (Workaround möglich).
Aus dem Abhängigkeitsdiagramm ergeben sich vier kritische Pfade und ein wichtiger, aber substituierbarer Pfad:
Komponente
Kritikalität
Konsequenz und Mitigation
PWA (Frontend)
Kritisch
Ohne Frontend kein Endkundenzugang. Mitigation: Statische Auslieferung über Vercel (CDN) mit globaler Verfügbarkeit und automatischen Rollouts.
API Gateway / Analyse-Service
Kritisch
Beide Services sind Next.js Route Handler auf Vercel. Ein Ausfall bedeutet, dass keine Anfragen verarbeitet werden können. Mitigation: Vercels managed Hosting mit Auto-Scaling.
Google AI Studio (Gemini)
Kritisch
Ohne Gemini keine Dialogsteuerung und keine Videoanalyse. Mitigation: Retry-Logik, Timeout-Handling und kontrollierte Fehlerzustände (siehe TU-02 / TU-04 Alternativabläufe).
Supabase (BaaS)
Kritisch
Persistenz, Videospeicher und Authentifizierung in einem. Ein Ausfall bedeutet vollständigen Stillstand. Mitigation: Managed Service mit SLA und EU-Hosting; im Notfall stehen Backups zur Verfügung.
Valuation-Service (Pauschal-Logik)
Wichtig
Im Fehlerfall kann die Pauschalberechnung bis zur manuellen Prüfung verzögert werden, der Schaden lässt sich weiterhin erfassen und speichern. Workaround: Schadenmeldung wird ohne Schätzbetrag ausgespielt.

## 2.6 Architekturbild
Das Architekturbild fasst die finalen Entscheidungen aus den vorherigen Kapiteln in einer Schichtenarchitektur zusammen. Es gliedert die Lösung in drei Schichten - Anwendung (Frontend), Integration & Backend sowie externe Systeme - und macht explizit, welche Komponenten in der Verantwortung des Projektteams liegen und welche als Blackbox extern bezogen werden.
[IMAGE]
Abbildung 7: Architekturbild Advansure. Drei Schichten und ein Compliance-Pfad mit dem finalen Stack.

### 2.6.1 Schicht 1 - Anwendung (Frontend)
Die Frontend-Schicht ist eine mobile-first Progressive Web App, umgesetzt mit Next.js 14, Tailwind CSS und shadcn/ui. Die PWA wird über Vercel ausgeliefert und ist auf modernen Smartphone-Browsern installierbar.
Innerhalb der PWA gibt es drei zentrale UI-Komponenten:
Foto-Walk-UI: Kamera- und Recorder-Komponente auf Basis der MediaRecorder-API. Verantwortlich für Aufnahme, Stop, lokale Vorschau und Upload (TU-03).
Avery-Chat: Dialog-Komponente mit React-State. Hält den lokalen Verlauf und visualisiert KI-Antworten in einer chatähnlichen Oberfläche (FA-02, TU-02).
Review & Pauschal: Raumübersicht und Anzeige der vorläufigen Auszahlungssumme nach Pauschalmethode (FA-07). Liefert die Datengrundlage für den Submit-Aufruf.

### 2.6.2 Schicht 2 - Integration und Backend
Die Backend-Schicht ist als Next.js API Routes umgesetzt und läuft serverless auf Vercel. Sie ist in TypeScript geschrieben und in vier logische Services unterteilt:
Service
Verantwortlichkeit
API Gateway
Routing aller eingehenden Anfragen, Auth-Check über Supabase JWT, Weiterleitung an den jeweiligen Service. Implementiert als Next.js Route Handler.
Analyse-Service
Implementiert den Foto-Walk-Loop (TU-04). Aggregiert History, baut den multimodalen Prompt, ruft Gemini auf, validiert das Schema und persistiert die strukturierte Antwort.
Valuation-Service
Reine TypeScript-Funktionsbibliothek für die Pauschal-Berechnung (TU-05). Pauschalsätze und Default-Raumgrößen liegen als Stammdaten in einer Konfigurationsdatei.
Prompt-Builder
Multimodal-Assembly: Setzt System-Prompt, History und Videodaten zu einem Gemini-Request zusammen. Eigene Komponente, um Prompt-Engineering und Service-Logik getrennt zu halten.

### 2.6.3 Schicht 3 - Externe Systeme (Blackbox)
Die dritte Schicht besteht aus zwei extern bezogenen, managed Services. Beide werden bewusst als Blackbox behandelt: Das Projektteam verantwortet die Integration über offizielle SDKs, nicht aber die interne Funktionsweise oder Skalierung.
Google AI Studio (Gemini): Multimodales LLM für Dialog und Video-Analyse. Anbindung über das Google AI Studio SDK. Verantwortlich für die fachliche Schadeneinschätzung im Foto-Walk-Loop.
Supabase (BaaS): PostgreSQL-Datenbank, Object Storage und Authentifizierung in einem Service. Enthält die Tabellen claims, rooms, conversations, audit_logs sowie die Video-Buckets. DSGVO-konform in der EU gehostet.

### 2.6.4 Finaler Tech-Stack im Überblick
Die folgende Tabelle fasst die finalen technischen Entscheidungen zum Stack zusammen. Sie ergänzt das Architekturbild um konkrete Versions- und Tool-Angaben.
Bereich
Tool / Framework
Begründung
Frontend
Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
Aktueller PWA-Standard, mobiloptimiert, schnelle Implementierung.
Hosting
Vercel
Native Next.js-Plattform, Auto-Deployments, integriertes CDN.
Backend
Next.js API Routes (serverless)
Konsistenter Stack über Frontend hinaus, kein separater Server nötig.
Datenbank
Supabase Postgres (managed)
DSGVO-konform, EU-Hosting, ohne eigene Infrastruktur.
Object Storage
Supabase Storage
Im selben Service wie die Datenbank, einfache Verwaltung der Videos.
Auth
Supabase Auth (im PoC mit Mock-User-IDs)
Für echte Auth bereits integriert verfügbar, ohne zweiten Provider.
KI-Modell
Google AI Studio (Gemini multimodal)
Multimodale Eingabe (Text + Video) in einer API, gutes Preis-Leistungs-Verhältnis.

## 2.7 Testplanung auf Use-Case-Ebene
Die folgende Testplanung beschreibt, mit welchen fachlichen Szenarien die in Kapitel 2.2 und 2.4 dokumentierten Use Cases abgenommen werden sollen. Sie ist bewusst auf der Use-Case-Ebene angesiedelt und ersetzt keine Entwicklertests (Unit-, Integrationstests, etc.), die im Rahmen der Implementierung in MST03 ergänzt werden.
Methodisch orientiert sich die Testplanung an drei Prinzipien:
Akzeptanzkriterium statt Implementierungsdetail: Jedes Szenario formuliert ein nachvollziehbares Ergebnis aus Nutzersicht, nicht den technischen Schritt im Code.
Happy Path + relevante Alternativabläufe: Pro Use Case wird mindestens ein Standardfall und ein definierter Fehler-/Alternativfall getestet.
Demo-Personas als Testdatengrundlage: Die drei Personas Leon, Robert und Julia liefern die nötige Datenbreite für Wohnflächen, Versicherungssummen und Schadensszenarien.

### 2.7.1 Übersicht der Testszenarien je fachlichem Use Case
Die folgenden Tabellen listen pro fachlichem Use Case die geplanten Testszenarien mit erwartetem Ergebnis.
#### FA-01 - App-Start & Session-Initialisierung
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Persona Leon
App-Aufruf mit Mock-User-ID „Leon“
Startscreen „Hey Leon“ mit korrekten Stammdaten.
Mehrere Personas
Wechsel zwischen Leon, Robert, Julia
Jeweils korrekte Wohnfläche und Versicherungssumme angezeigt.
Fehlerfall keine Police
Mock-User-ID ohne Policendatensatz
Fehlermeldung wird angezeigt, kein Schadenflow startbar.
Offline-Verhalten
Browser im Flugmodus
Offline-Hinweis erscheint, keine App-Abstürze.
#### FA-02 - Schaden über Avery-Dialog melden
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Wasserschaden
„Wasserschaden durch Waschmaschine“
Avery erkennt Schadenstyp und Ursache korrekt.
Standardfall Feuerschaden
„Kerze umgefallen, Sofa angekohlt“
Avery erkennt Brand-/Feuerschaden korrekt.
Vager Input
„Es ist was passiert“
Avery stellt eine sinnvolle Rückfrage.
Nicht abgedeckter Schaden
„Mein Auto wurde zerkratzt“
Avery erklärt, dass dies kein Hausrat-Fall ist.
Dialog-Persistenz
Reload der Seite nach Eingabe
Bisheriger Verlauf ist wiederherstellbar.
#### FA-03 - Foto-Walk durchführen (Happy Path)
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall ein Raum
Wasserschaden in Küche, ein Video
Schadensgrad „mittel“ wird erkannt.
Standardfall mehrere Räume
Wasserschaden in Küche und Flur
Zwei separate Videos werden korrekt den Räumen zugeordnet.
Leichter Schaden
Kleiner Fleck im Wohnzimmer
KI klassifiziert als „leicht“.
Schwerer Schaden
Komplett überflutetes Bad
KI klassifiziert als „schwer“ oder „Totalschaden“.
Video-Persistenz
Wiederabruf nach Walk-Abschluss
Videos sind über die Walk-ID wiederabrufbar.
#### FA-04 - Foto-Walk mit erneuter Aufforderung (Iteration)
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Iteration
Erstes Video unscharf, zweites klar
KI wechselt nach Iteration 2 auf „zufrieden“.
Maximalzahl erreicht
5 unzureichende Videos in Folge
Walk endet mit Warnhinweis, Schadenseinschätzung wird trotzdem erstellt.
Sinnvolle Folgeaufforderung
Beobachtung der next_request-Texte
KI fordert spezifisch („Boden zeigen“), nicht generisch („nochmal filmen“).
Iterationszähler korrekt
Nach jeder Aufnahme prüfen
Zähler wird sichtbar/abrufbar jeweils um 1 erhöht.
#### FA-05 - Foto-Walk abbrechen
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Abbruch
Walk nach Iteration 1 abbrechen
Status „cancelled“, keine Schadenmeldung erzeugt.
Abbruch zurücknehmen
„Nein, weitermachen“ wählen
Walk läuft ohne Datenverlust weiter.
Mehrfacher Abbruch
Drei Walks hintereinander abbrechen
Jeder Walk erhält eigene cancelled-Markierung.
Datenintegrität
Storage-Inhalt nach Abbruch prüfen
Bisherige Videos sind im Storage noch vorhanden.
#### FA-06 - Kamera-Berechtigung verweigert
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Verweigerung
Browser-Dialog ablehnen
Verständliche Fehlermeldung, kein Absturz.
Berechtigung nachholen
Nach Verweigerung erneut anfragen
Dialog erscheint wieder, bei Zustimmung läuft Walk weiter.
Textbasierter Fallback
„Schaden textbasiert beschreiben“ wählen
Avery führt strukturiertes Frage-Antwort-Gespräch.
Browser ohne Kamera
Desktop ohne Webcam
Gleiche Fehlerbehandlung wie bei Verweigerung.
#### FA-07 - Schadenmeldung abschicken & Vorgangsnummer erhalten
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Einreichung
Komplette Meldung absenden
Vorgangsnummer ADV-2026-XXXX wird angezeigt und ist eindeutig.
Mehrere Räume
Schaden in 3 Räumen
Alle Raumeinschätzungen sind im gespeicherten Datensatz enthalten.
Korrektur vor Absenden
Raum aus Zusammenfassung entfernen
Nur die finalen Räume werden gespeichert.
Speicherfehler
Supabase nicht erreichbar
Retry-Button erscheint, keine doppelte Speicherung bei Retry.
Eindeutigkeit
100 simulierte Einreichungen
100 verschiedene Vorgangsnummern.
#### FA-08 - Status der Schadenmeldung verfolgen
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall direkt nach Absenden
Status-Screen aufrufen
Status „Eingegangen“ und Timeline-Beginn korrekt.
Statuswechsel simulieren
Status auf „In Bearbeitung“ setzen
Timeline aktualisiert sich nach Refresh.
Abschluss-Status
Status „Abgeschlossen“
Alle Timeline-Stufen sind aktiv markiert.
Unbekannte Vorgangsnummer
Aufruf mit ungültiger ID
Freundlicher Hinweis erscheint.
Mehrere Meldungen
Persona mit zwei Vorgängen
Beide Vorgänge sind unabhängig voneinander aufrufbar.

### 2.7.2 Übersicht der Testszenarien je technischem Use Case
Auch die technischen Use Cases werden auf Use-Case-Ebene fachlich abgenommen - das heißt, es wird nicht die einzelne Funktion getestet, sondern das von der Komponente erwartete Verhalten.
#### TU-01 - Session erzeugen und Stammdaten ausliefern
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Existierende Persona
Mock-User-ID „Leon“
Session und Police werden korrekt zurückgegeben.
Unbekannte Persona
Mock-User-ID „unbekannt“
404 wird zurückgegeben, Frontend zeigt Fehlermeldung.
Datenkonsistenz
Stammdaten gegen Seed prüfen
Wohnfläche und Versicherungssumme stimmen mit Seed-Daten überein.
Parallelität
Drei Personas in drei Tabs
Sessions sind voneinander isoliert.
#### TU-02 - KI-Dialog-Endpunkt für Avery
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall
Eingabe „Wasserschaden“
KI-Antwort enthält strukturierten Intent.
Dialog-Kontext
Zweite Nachricht baut auf erster auf
Verlauf wird korrekt mitgesendet.
KI-Ausfall
API-Key invalidieren
Retry-Logik greift, danach saubere Fehlermeldung.
Antwort-Parsing
Fehlerhaften Mock einsetzen
Generische Antwort wird ausgeliefert, kein Absturz.
Audit-Log
Nach jedem Aufruf Log prüfen
Log-Eintrag mit Request- und Response-Hash existiert.
#### TU-03 - Videoaufnahme und Upload
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Aufnahme
10-Sekunden-Video aufnehmen
Wiedergabe und Upload erfolgreich.
Mehrere Iterationen
3 Aufnahmen für einen Walk
Alle Dateien im Storage unter walks/{walk_id}/.
Upload-Fehler
Verbindung gezielt abbrechen
Retry-Mechanismus greift.
Zu kurze Aufnahme
1-Sekunden-Clip
Wird verworfen, neue Aufnahme angefordert.
Datenintegrität
Video aus Storage abspielen
Hochgeladenes Video entspricht dem aufgenommenen Inhalt.
#### TU-04 - Video-Analyse durch KI-Vision
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall
Klar erkennbares Wasserschaden-Video
Schema-konforme Antwort, satisfied=true.
Unklares Video
Verwackeltes Video
satisfied=false mit konkretem next_request.
Timeout
API künstlich verzögern
Retry-Logik greift, ggf. Walk-Status auf error_external_api.
Schema-Fehler
Mock liefert ungültiges JSON
Backend reagiert kontrolliert, kein 500-Crash.
Persistenz
rooms-Tabelle nach Aufruf prüfen
Antwort ist reproduzierbar gespeichert.
#### TU-05 - Schadenshöhe nach Pauschalmethode berechnen
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Ein Raum, Grad mittel
Küche 8 m², Schadensgrad „mittel“
8 m² × €450 = 3.600 €.
Mehrere Räume gemischt
Küche „mittel“ + Flur „leicht“
Einzelbeträge und Summe korrekt berechnet.
Default-Raumgröße
Raum ohne hinterlegte Größe
Defaultwert greift, Berechnung erfolgreich.
Unbekannter Schadensgrad
KI liefert „katastrophal“
Raum wird ausgeschlossen, Hinweis erscheint.
Persistenz
Reload nach Berechnung
Einzelbeträge und Gesamtsumme sind identisch.
#### TU-06 - Schadenmeldung persistieren und Vorgangsnummer generieren
Szenario
Eingabe / Setup
Erwartetes Ergebnis
Standardfall Einreichung
Vollständige Daten
claims-Eintrag, Vorgangsnummer und Verknüpfungen sind korrekt.
Eindeutigkeit
100 simulierte Einreichungen
100 unterschiedliche Vorgangsnummern, keine Duplikate.
Validierungsfehler
Submit ohne Raum
422-Fehler, kein claims-Datensatz erzeugt.
Transaktionsfehler
Commit künstlich abbrechen
Kein halber Datensatz in der Datenbank.

# 3. Zusammenfassung und Ausblick
Mit dieser Konzeption ist die fachliche und technische Lösung für Advansure auf dem Stand des Meilensteins MST02 vollständig beschrieben. Das Dokument liefert eine Grundlage, anhand derer das Projektteam die Implementierungsphase strukturiert angehen und die Lösung in der Abschlusspräsentation MST03 nachvollziehbar präsentieren kann.

## 3.1 Kerngedanke der Lösung
Advansure zeigt prototypisch, wie eine dialoggeführte, KI-gestützte Schadenmeldung in der Hausratversicherung aussehen kann. Drei Entwurfsentscheidungen tragen den Kern der Lösung:
Eine PWA als mobiler, install-fähiger Endkundenkanal, der ohne App-Store auskommt.
Eine multimodale KI im Backend, die Videoaufnahmen pro Raum analysiert und strukturiert klassifiziert.
Eine Pauschalmethode (Wohnfläche × Pauschalsatz pro m²) als pragmatischer Ansatz für die erste Schadenshöhe, die ohne aufwendige Einzelpostenbewertung auskommt.

## 3.2 Bewusste Reduktion auf das Notwendige
Im Verlauf der Konzeption wurden mehrfach Optionen geprüft (asynchrone Komponenten, eigene Auth-Stacks, Sachbearbeiter-Cockpit, Anbindung an ein externes Bestandssystem) und bewusst zugunsten eines schlankeren Scope verworfen. Diese Entscheidungen sind in Kapitel 2.5.3 dokumentiert und sollten in einer späteren Ausbaustufe wieder aufgegriffen werden.

## 3.3 Nächste Schritte
Auf Basis dieser Konzeption ergeben sich für die Implementierungsphase bis zum Abschlussmeilenstein die folgenden Schwerpunkte:
1.Aufbau des Supabase-Backends mit den vier zentralen Tabellen claims, rooms, conversations, audit_logs sowie der Storage-Buckets für Videos.
2.Implementierung der Next.js Route Handler für TU-01 bis TU-06 inklusive Anbindung des Google AI Studio.
3.Aufbau der drei UI-Komponenten (Foto-Walk-UI, Avery-Chat, Review & Pauschal) und Integration in einen durchgängigen Flow.
4.Durchführung der in Kapitel 2.7 beschriebenen Use-Case-Szenarien anhand der drei Demo-Personas.
5.Vorbereitung der Abschlusspräsentation MST03 inklusive Live-Demo und einer überblickartigen Lessons-Learned-Sicht.