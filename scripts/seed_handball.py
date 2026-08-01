"""Seed curado del universo de clubes de handball masculino (temporada 2025-26).

Formato de cada club:  (nombre, fuerza 1-5, titulo_wikipedia_o_None)

`fuerza` es el escalon del club dentro de la escalera global del juego, igual que
`level` en Copero:
    5 = candidato a Champions / top mundial
    4 = potencia nacional, habitual en Europa
    3 = mitad de tabla de primera division fuerte
    2 = primera division menor o segunda division fuerte
    1 = ascenso / semiprofesional

`verified` indica si la nomina salio de una fuente comprobada (Wikipedia de la
temporada en curso) o si es una lista indicativa que hay que auditar contra la
federacion antes de publicar.  Ver docs/FUENTES.md.
"""

# --------------------------------------------------------------------------
# Confederaciones IHF
# --------------------------------------------------------------------------
CONFEDERATIONS = {
    "EHF": {"name": "Europa", "continental": "EHF Champions League",
            "continental_2": "EHF European League", "national": "EHF Euro"},
    "PATHF": {"name": "America", "continental": "Copa Panamericana de Clubes",
              "continental_2": "Sudamericano de Clubes", "national": "Campeonato Panamericano"},
    "AHF": {"name": "Asia", "continental": "Asian Club League Championship",
            "continental_2": None, "national": "Campeonato Asiatico"},
    "CAHB": {"name": "Africa", "continental": "African Handball Champions League",
             "continental_2": None, "national": "Campeonato Africano (CAN)"},
    "OCHF": {"name": "Oceania", "continental": None,
             "continental_2": None, "national": "Oceania Handball Nations Cup"},
}

COUNTRIES = {
    "FRA": dict(name="Francia", flag="\U0001F1EB\U0001F1F7", conf="EHF", startable=True,
                cup="Coupe de France", supercup="Trophee des Champions"),
    "GER": dict(name="Alemania", flag="\U0001F1E9\U0001F1EA", conf="EHF", startable=True,
                cup="DHB-Pokal", supercup="Supercup"),
    "ARG": dict(name="Argentina", flag="\U0001F1E6\U0001F1F7", conf="PATHF", startable=True,
                cup="Copa Argentina", supercup="Supercopa"),
    "ESP": dict(name="España", flag="\U0001F1EA\U0001F1F8", conf="EHF", cup="Copa del Rey",
                supercup="Supercopa ASOBAL"),
    "DEN": dict(name="Dinamarca", flag="\U0001F1E9\U0001F1F0", conf="EHF", cup="Santander Cup"),
    "HUN": dict(name="Hungría", flag="\U0001F1ED\U0001F1FA", conf="EHF", cup="Magyar Kupa"),
    "POL": dict(name="Polonia", flag="\U0001F1F5\U0001F1F1", conf="EHF", cup="Puchar Polski"),
    "POR": dict(name="Portugal", flag="\U0001F1F5\U0001F1F9", conf="EHF", cup="Taca de Portugal"),
    "SWE": dict(name="Suecia", flag="\U0001F1F8\U0001F1EA", conf="EHF", cup="Svenska Cupen"),
    "NOR": dict(name="Noruega", flag="\U0001F1F3\U0001F1F4", conf="EHF", cup="NM Cupen"),
    "ROU": dict(name="Rumanía", flag="\U0001F1F7\U0001F1F4", conf="EHF", cup="Cupa Romaniei"),
    "SLO": dict(name="Eslovenia", flag="\U0001F1F8\U0001F1EE", conf="EHF", cup="Pokal Slovenije"),
    "CRO": dict(name="Croacia", flag="\U0001F1ED\U0001F1F7", conf="EHF", cup="Hrvatski kup"),
    "MKD": dict(name="Macedonia del Norte", flag="\U0001F1F2\U0001F1F0", conf="EHF", cup="Kup na Makedonija"),
    "SUI": dict(name="Suiza", flag="\U0001F1E8\U0001F1ED", conf="EHF", cup="Schweizer Cup"),
    "AUT": dict(name="Austria", flag="\U0001F1E6\U0001F1F9", conf="EHF", cup="OHB-Cup"),
    "ISL": dict(name="Islandia", flag="\U0001F1EE\U0001F1F8", conf="EHF", cup="Coca-Cola bikarinn"),
    "QAT": dict(name="Qatar", flag="\U0001F1F6\U0001F1E6", conf="AHF", cup="Emir Cup"),
    "EGY": dict(name="Egipto", flag="\U0001F1EA\U0001F1EC", conf="CAHB", cup="Copa de Egipto"),
    "TUN": dict(name="Túnez", flag="\U0001F1F9\U0001F1F3", conf="CAHB", cup="Coupe de Tunisie"),
    "BRA": dict(name="Brasil", flag="\U0001F1E7\U0001F1F7", conf="PATHF", cup="Copa Brasil"),
    "JPN": dict(name="Japón", flag="\U0001F1EF\U0001F1F5", conf="AHF", cup="All Japan Handball Championship"),
}

# --------------------------------------------------------------------------
# FRANCIA - piramide completa (pais jugable)
# --------------------------------------------------------------------------
FRA_STARLIGUE = [
    ("Paris Saint-Germain Handball", 5, "fr:Paris Saint-Germain (handball)"),
    ("HBC Nantes", 5, "fr:Handball Club de Nantes"),
    ("Montpellier Handball", 4, "fr:Montpellier Handball"),
    ("Fenix Toulouse Handball", 4, "fr:Fenix Toulouse Handball"),
    ("Saint-Raphaël Var Handball", 4, "fr:Saint-Raphaël Var Handball"),
    ("USAM Nîmes Gard", 4, "fr:USAM Nîmes Gard"),
    ("Chambéry Savoie Mont Blanc", 3, "fr:Chambéry Savoie Mont Blanc Handball"),
    ("Limoges Handball", 3, "fr:Limoges Handball"),
    ("Pays d'Aix Universite Club", 3, "fr:Provence Aix Université Club handball"),
    ("Cesson-Rennes Métropole HB", 3, "fr:Cesson Rennes Métropole Handball"),
    ("C' Chartres Métropole Handball", 3, "fr:C' Chartres Métropole handball"),
    ("Dunkerque HB Grand Littoral", 3, "fr:Dunkerque Handball Grand Littoral"),
    ("Tremblay-en-France Handball", 3, "fr:Tremblay Handball"),
    ("Istres Provence Handball", 3, "fr:Istres Provence Handball"),
    ("Dijon Métropole Handball", 2, "fr:Dijon Métropole Handball"),
    ("Sélestat Alsace Handball", 2, "fr:Sélestat Alsace Handball"),
]

FRA_PROLIGUE = [
    ("US Créteil Handball", 2, "fr:Union sportive de Créteil handball"),
    ("US Ivry Handball", 2, "fr:Union sportive d'Ivry (handball)"),
    ("Caen Handball", 2, "fr:Caen Handball"),
    ("Pau Billère Handball", 2, "fr:Pau Billère Handball"),
    ("Massy Essonne Handball", 2, "fr:Massy Essonne Handball"),
    ("Pontault-Combault Handball", 2, "fr:Pontault-Combault Handball"),
    ("JS Cherbourg Handball", 2, "fr:Jeunesse sportive de Cherbourg"),
    ("Grand Besançon Doubs Handball", 2, "fr:Grand Besançon Doubs Handball"),
    ("Frontignan Thau Handball", 2, "fr:Frontignan Handball"),
    ("Saran Loiret Handball", 2, "fr:Saran Loiret Handball"),
    ("Valence Handball", 2, "fr:Valence Handball"),
    ("Angers SCO Handball", 2, "fr:Angers SCO Handball"),
    ("HBC Cournon-d'Auvergne", 1, "fr:Handball Club Cournon-d'Auvergne"),
    ("Sarrebourg Moselle Sud HB", 1, "fr:Sarrebourg Moselle-Sud Handball"),
    ("US Saintes Handball", 1, "fr:Union sportive de Saintes handball"),
]

# Nationale 1 - lista indicativa, auditar contra ffhandball.fr
FRA_N1 = [
    ("Grand Poitiers Handball 86", 1, "fr:Grand Poitiers Handball 86"),
    ("Villeurbanne Handball Association", 1, "fr:Villeurbanne Handball Association"),
    ("Saint-Marcel Vernon HB", 1, "fr:Saint-Marcel Vernon Handball"),
    ("Mulhouse Handball Sud Alsace", 1, "fr:Mulhouse Handball Sud Alsace"),
    ("Strasbourg Eurometropole Handball", 1, "fr:Strasbourg Eurométropole Handball"),
    ("Grand Nancy Metropole Handball", 1, "fr:Grand Nancy Métropole Handball"),
    ("Le Havre Athletic Club Handball", 1, None),
    ("Dreux Agglomeration Chartres HB", 1, None),
    ("JSA Bordeaux Handball", 1, "fr:JSA Bordeaux Handball"),
    ("Nice Handball", 1, "fr:Nice Handball"),
    ("Amiens Picardie Handball", 1, None),
    ("Torcy Handball", 1, None),
]

# --------------------------------------------------------------------------
# ALEMANIA - piramide completa (pais jugable)
# --------------------------------------------------------------------------
GER_HBL = [
    ("Füchse Berlin", 5, "de:Füchse Berlin"),
    ("SC Magdeburg", 5, "de:SC Magdeburg (Handball)"),
    ("THW Kiel", 5, "de:THW Kiel"),
    ("MT Melsungen", 5, "de:MT Melsungen"),
    ("SG Flensburg-Handewitt", 4, "de:SG Flensburg-Handewitt"),
    ("Rhein-Neckar Löwen", 4, "de:Rhein-Neckar Löwen"),
    ("TSV Hannover-Burgdorf", 4, "de:TSV Hannover-Burgdorf"),
    ("VfL Gummersbach", 4, "de:VfL Gummersbach"),
    ("TBV Lemgo Lippe", 3, "de:TBV Lemgo"),
    ("HSV Hamburg", 3, "de:Handball Sport Verein Hamburg"),
    ("Frisch Auf Göppingen", 3, "de:Frisch Auf Göppingen"),
    ("SC DHfK Leipzig", 3, "de:SC DHfK Leipzig Handball"),
    ("HSG Wetzlar", 2, "de:HSG Wetzlar"),
    ("HC Erlangen", 2, "de:HC Erlangen"),
    ("TVB Stuttgart", 2, "de:TV Bittenfeld"),
    ("ThSV Eisenach", 2, "de:ThSV Eisenach"),
    ("Bergischer HC", 2, "de:Bergischer HC"),
    ("GWD Minden", 2, "de:GWD Minden"),
]

GER_2HBL = [
    ("SG BBM Bietigheim", 2, "de:SG BBM Bietigheim"),
    ("1. VfL Potsdam", 2, "de:1. VfL Potsdam"),
    ("TV Hüttenberg", 2, "de:TV Hüttenberg"),
    ("HBW Balingen-Weilstetten", 2, "de:HBW Balingen-Weilstetten"),
    ("HC Elbflorenz Dresden", 2, "de:HC Elbflorenz"),
    ("HSC 2000 Coburg", 2, "de:HSC 2000 Coburg"),
    ("HSG Nordhorn-Lingen", 2, "de:HSG Nordhorn-Lingen"),
    ("VfL Eintracht Hagen", 2, "de:VfL Eintracht Hagen"),
    ("TSV Bayer Dormagen", 2, "de:TSV Bayer Dormagen"),
    ("Dessau-Roßlauer HV", 1, "de:Dessau-Roßlauer HV"),
    ("TV Großwallstadt", 1, "de:TV Großwallstadt"),
    ("VfL Lübeck-Schwartau", 1, "de:VfL Lübeck-Schwartau"),
    ("Die Eulen Ludwigshafen", 1, "de:Die Eulen Ludwigshafen"),
    ("TuS Ferndorf", 1, "de:TuS Ferndorf"),
    ("TuS N-Lübbecke", 1, "de:TuS N-Lübbecke"),
    ("TUSEM Essen", 1, "de:TUSEM Essen"),
    ("HSG Krefeld Niederrhein", 1, "de:HSG Krefeld"),
    ("HC Oppenweiler/Backnang", 1, "de:HC Oppenweiler/Backnang"),
]

GER_3LIGA = [
    ("EHV Aue", 1, "de:EHV Aue"),
    ("MTV Braunschweig", 1, "de:MTV Braunschweig"),
    ("TSV Altenholz", 1, "de:TSV Altenholz"),
    ("HC Empor Rostock", 1, "de:HC Empor Rostock"),
    ("Stralsunder HV", 1, "de:Stralsunder HV"),
    ("Oranienburger HC", 1, "de:Oranienburger HC"),
    ("SV 04 Plauen-Oberlosa", 1, "de:SV 04 Plauen-Oberlosa"),
    ("TV Emsdetten", 1, "de:TV Emsdetten"),
    ("ASV Hamm-Westfalen", 1, "de:ASV Hamm-Westfalen"),
    ("TuS Vinnhorst", 1, "de:TuS Vinnhorst"),
    ("VfL Fredenbeck", 1, "de:VfL Fredenbeck"),
    ("Wilhelmshavener HV", 1, "de:Wilhelmshavener HV"),
    ("OHV Aurich", 1, "de:OHV Aurich"),
    ("ATSV Habenhausen", 1, "de:ATSV Habenhausen"),
    ("Ahlener SG", 1, "de:Ahlener SG"),
    ("TSV Anderten", 1, "de:TSV Anderten"),
    ("VfL Pfullingen", 1, "de:VfL Pfullingen"),
    ("HSG Konstanz", 1, "de:HSG Konstanz"),
    ("TSB Heilbronn-Horkheim", 1, "de:TSB Heilbronn-Horkheim"),
    ("Wölfe Würzburg", 1, "de:Wölfe Würzburg"),
    ("HG Saarlouis", 1, "de:HG Saarlouis"),
    ("Longericher SC Köln", 1, "de:Longericher SC Köln"),
    ("Bergische Panther", 1, "de:Bergische Panther"),
    ("TV Kirchzell", 1, "de:TV Kirchzell"),
]

# --------------------------------------------------------------------------
# ARGENTINA - piramide completa (pais jugable)
# --------------------------------------------------------------------------
ARG_LIGA_HONOR = [
    ("River Plate", 4, "es:Club Atlético River Plate (handball)"),
    ("SAG Villa Ballester", 4, "es:SAG Ballester (club de balonmano)"),
    ("SEDALO", 4, "es:Sociedad Escolar y Deportiva Alemana Lanús Oeste"),
    ("Ferro Carril Oeste", 3, "es:Club Ferro Carril Oeste (Handball)"),
    ("Dorrego", 3, "es:Dorrego Handball"),
    ("UNLu", 3, "es:UNLu (Handball)"),
    ("Colegio Ward", 3, "es:Colegio Ward Handball"),
    ("SAG Lomas de Zamora", 3, "es:S.A.G. LOMAS DE ZAMORA HANDBALL"),
    ("SAG Los Polvorines", 3, "es:Sociedad Alemana de Gimnasia de Los Polvorines"),
    ("Argentinos Juniors", 3, "es:Asociación Atlética Argentinos Juniors"),
    ("Municipalidad de Vicente Lopez", 3, None),
    ("Asociacion Alemana de Quilmes", 2, "es:Asociación Alemana de Quilmes"),
    ("Defensa y Justicia", 2, "es:Club Social y Deportivo Defensa y Justicia"),
    ("Ferrocarril Mitre", 2, "es:Club Ferrocarril Mitre"),
]

ARG_LIGA_HONOR_PLATA = [
    ("Independiente de Lomas", 2, None),
    ("Estudiantes de La Plata", 2, "es:Club Estudiantes de La Plata"),
    ("Club Atletico Lanus", 2, "es:Club Atlético Lanús"),
    ("Municipalidad de Almirante Brown", 2, None),
    ("Municipalidad de San Miguel", 2, None),
    ("Municipalidad de Escobar", 2, None),
    ("Municipalidad de Hurlingham", 2, None),
    ("Municipalidad de Pilar", 2, None),
    ("Comunicaciones", 2, "es:Club Comunicaciones"),
    ("Club Atletico Platense", 2, "es:Club Atlético Platense"),
    ("Deportivo Laferrere", 1, None),
    ("Club Atletico Banfield", 2, "es:Club Atlético Banfield"),
    ("Velez Sarsfield", 2, "es:Club Atlético Vélez Sarsfield"),
    ("Club Atletico Huracan", 2, "es:Club Atlético Huracán"),
    ("San Lorenzo de Almagro", 2, "es:Club Atlético San Lorenzo de Almagro"),
    ("UAI Urquiza", 1, "es:Club Deportivo UAI Urquiza"),
]

ARG_METROPOLITANO_A = [
    ("Club Atletico All Boys", 1, "es:Club Atlético All Boys"),
    ("Club Atletico Atlanta", 1, "es:Club Atlético Atlanta"),
    ("Chacarita Juniors", 1, "es:Club Atlético Chacarita Juniors"),
    ("Racing Club", 1, "es:Racing Club"),
    ("Club Atletico Temperley", 1, "es:Club Atlético Temperley"),
    ("Club Atletico San Telmo", 1, "es:Club Atlético San Telmo"),
    ("General Lamadrid", 1, "es:Club Atlético General Lamadrid"),
    ("Yupanqui", 1, "es:Club Atlético Yupanqui"),
    ("Ateneo Don Bosco", 1, None),
    ("Asociacion Escolar Goethe", 1, None),
    ("Centro Asturiano", 1, None),
    ("Circulo Devoto", 1, None),
    ("Colegio Guadalupe", 1, None),
    ("Defensores de Glew", 1, None),
    ("Defensores de Moreno", 1, "es:Club Atlético Defensores de Moreno"),
    ("Municipalidad de Quilmes", 1, None),
    ("Nautico Arsenal Zarate", 1, None),
    ("Paso del Rey Social Club", 1, None),
    ("SECLA", 1, None),
    ("Universidad de Buenos Aires", 1, None),
]

# --------------------------------------------------------------------------
# Ligas destino
# --------------------------------------------------------------------------
ESP_ASOBAL = [
    ("Barça", 5, "es:Fútbol Club Barcelona (balonmano)"),
    ("Bidasoa Irun", 3, "es:Sociedad Deportiva Bidasoa"),
    ("Abanca Ademar León", 3, "es:Club Balonmano Ademar León"),
    ("Fraikin BM Granollers", 3, "es:Club Balonmano Granollers"),
    ("BM Logroño La Rioja", 3, "es:Club Balonmano Logroño La Rioja"),
    ("Bathco BM Torrelavega", 2, "es:Balonmano Torrelavega"),
    ("Bada Huesca", 2, "es:Club Balonmano Huesca"),
    ("Ángel Ximénez Puente Genil", 2, "es:Ángel Ximénez Puente Genil"),
    ("Frigoríficos del Morrazo", 2, "es:Club Balonmano Cangas"),
    ("Horneo EON Alicante", 2, None),
    ("BM Caserío Ciudad Real", 2, None),
    ("Viveros Herol Nava", 2, "es:Balonmano Nava"),
    ("Incarlopsa Cuenca", 2, "es:Club Balonmano Cuenca"),
    ("Recoletas Atletico Valladolid", 2, "es:Club Balonmano Valladolid"),
    ("BM Benidorm", 2, "es:Club Balonmano Benidorm"),
    ("Helvetia Anaitasuna", 2, "es:Club Deportivo Anaitasuna"),
]

ESP_PLATA = [
    ("BM Villa de Aranda", 1, None),
    ("Trops Malaga", 1, None),
    ("BM Alarcos Ciudad Real", 1, None),
    ("Zamora Balonmano", 1, None),
    ("BM Soria", 1, None),
    ("Agustinos Alicante", 1, None),
    ("BM Torrelavega B", 1, None),
    ("Cisne Pontevedra", 1, "es:Club Balonmano Cisne"),
    ("Barça B", 2, None),
    ("Sinfin Santander", 1, "es:Balonmano Sinfín"),
]

DEN_LIGA = [
    ("Aalborg Håndbold", 5, "en:Aalborg Håndbold"),
    ("GOG", 4, "en:GOG Håndbold"),
    ("Bjerringbro-Silkeborg", 4, "en:Bjerringbro-Silkeborg Håndbold"),
    ("Skjern Håndbold", 4, "en:Skjern Håndbold"),
    ("Fredericia HK", 3, "en:Fredericia HK"),
    ("Mors-Thy Håndbold", 3, "en:Mors-Thy Håndbold"),
    ("Nordsjælland Håndbold", 3, "en:Nordsjælland Håndbold"),
    ("Ribe-Esbjerg HH", 3, "en:Ribe-Esbjerg HH"),
    ("TTH Holstebro", 3, "en:TTH Holstebro"),
    ("KIF Kolding", 3, "en:KIF Kolding"),
    ("SønderjyskE Håndbold", 3, "en:SønderjyskE Håndbold"),
    ("TMS Ringsted", 2, "en:TMS Ringsted"),
    ("HØJ Elite", 2, None),
    ("Grindsted GIF Handbold", 2, None),
]

HUN_NBI = [
    ("Telekom Veszprém", 5, "en:Veszprém KC"),
    ("Pick Szeged", 5, "en:SC Pick Szeged"),
    ("Tatabánya KC", 4, "en:Tatabánya KC"),
    ("Ferencvárosi TC", 3, "en:Ferencvárosi TC (handball)"),
    ("Csurgói KK", 3, "en:Csurgói KK"),
    ("Balatonfüredi KSE", 3, "en:Balatonfüredi KSE"),
    ("Győri ETO-UNI FKC", 2, None),
    ("Komlói BSK", 2, "en:Komlói BSK"),
    ("NEKA", 2, "en:NEKA"),
    ("Budakalász FKC", 2, "en:Budakalász FKC"),
    ("PLER-Budapest", 2, "en:PLER KC"),
    ("Gyöngyösi KK", 2, None),
    ("Dabas KC", 2, None),
    ("Szigetszentmiklosi KSK", 2, None),
]

POL_SUPERLIGA = [
    ("Industria Kielce", 5, "en:Vive Kielce"),
    ("Orlen Wisła Płock", 5, "en:Wisła Płock (handball)"),
    ("Azoty-Pulawy", 3, "en:Azoty-Puławy"),
    ("Chrobry Głogów", 3, "en:Chrobry Głogów (handball)"),
    ("Stal Mielec", 3, "en:Stal Mielec (handball)"),
    ("MKS Kalisz", 3, None),
    ("Wybrzeże Gdańsk", 2, "en:Wybrzeże Gdańsk"),
    ("MMTS Kwidzyn", 2, "en:MMTS Kwidzyn"),
    ("Arged KPR Ostrovia Ostrow", 2, None),
    ("Zagłębie Lubin", 2, "en:Zagłębie Lubin (handball)"),
    ("Górnik Zabrze", 2, "en:Górnik Zabrze (handball)"),
    ("Piotrkowianin Piotrkow", 2, None),
    ("Śląsk Wrocław", 2, "en:Śląsk Wrocław (handball)"),
    ("Nielba Wągrowiec", 1, None),
]

POR_ANDEBOL1 = [
    ("Sporting CP", 4, "en:Sporting CP (handball)"),
    ("FC Porto", 4, "en:FC Porto (handball)"),
    ("SL Benfica", 4, "en:S.L. Benfica (handball)"),
    ("ABC Braga", 3, "en:ABC Braga"),
    ("Águas Santas Milaneza", 2, None),
    ("Madeira SAD", 2, "en:Madeira Andebol SAD"),
    ("AC Fafe", 2, None),
    ("Belenenses", 2, "en:C.F. Os Belenenses (handball)"),
    ("Sanjoanense", 2, None),
    ("AA Avanca", 2, None),
    ("Póvoa AC", 2, None),
    ("Boa Hora FC", 1, None),
]

SWE_LIGAN = [
    ("Ystads IF", 4, "en:Ystads IF"),
    ("IFK Kristianstad", 4, "en:IFK Kristianstad"),
    ("IK Sävehof", 4, "en:IK Sävehof"),
    ("Alingsås HK", 3, "en:Alingsås HK"),
    ("Redbergslids IK", 3, "en:Redbergslids IK"),
    ("Lugi HF", 3, "en:Lugi HF"),
    ("IFK Skövde", 3, "en:IFK Skövde"),
    ("Hammarby IF", 3, "en:Hammarby IF HF"),
    ("HK Malmö", 3, "en:HK Malmö"),
    ("Eskilstuna Guif", 3, "en:Eskilstuna Guif"),
    ("Önnereds HK", 2, None),
    ("IF Hallby HK", 2, "en:IF Hallby HK"),
    ("OV Helsingborg", 2, "en:OV Helsingborg"),
    ("HIF Karlskrona", 2, "en:HIF Karlskrona"),
]

NOR_LIGAEN = [
    ("Kolstad Håndball", 5, "en:Kolstad Håndball"),
    ("Elverum Håndball", 4, "en:Elverum Håndball"),
    ("ØIF Arendal", 3, "en:ØIF Arendal"),
    ("Nærbø IL", 3, "en:Nærbø IL"),
    ("Halden Topphåndball", 3, "en:Halden Topphåndball"),
    ("Bækkelagets SK", 3, "en:Bækkelagets SK"),
    ("Haslum HK", 3, "en:Haslum HK"),
    ("Drammen HK", 2, "en:Drammen HK"),
    ("Runar Sandefjord", 2, "en:Runar Sandefjord"),
    ("Fjellhammer IL", 2, "en:Fjellhammer IL"),
    ("Follo HK", 2, None),
    ("Sandefjord TIF", 2, None),
]

ROU_LIGA = [
    ("Dinamo București", 4, "en:CS Dinamo București (handball)"),
    ("CSM Constanța", 3, "en:HC Dobrogea Sud Constanța"),
    ("Minaur Baia Mare", 3, "en:CS Minaur Baia Mare (handball)"),
    ("Steaua București", 3, "en:CSA Steaua București (handball)"),
    ("Politehnica Timișoara", 3, "en:SCM Politehnica Timișoara (handball)"),
    ("CSM București", 3, "en:CSM București (men's handball)"),
    ("CSM Focșani", 2, None),
    ("HC Buzau", 2, None),
    ("Potaissa Turda", 2, "en:CS Potaissa Turda"),
    ("Odorheiu Secuiesc", 2, None),
]

SLO_LIGA = [
    ("Celje Pivovarna Laško", 4, "en:RK Celje"),
    ("RK Gorenje Velenje", 3, "en:RK Gorenje Velenje"),
    ("RK Trimo Trebnje", 3, "en:RK Trimo Trebnje"),
    ("RK Maribor Branik", 2, None),
    ("RK Krka", 2, "en:RK Krka"),
    ("RK Slovan", 2, "en:RK Slovan"),
    ("RK Ribnica", 2, "en:RK Ribnica"),
    ("RK Koper", 2, "en:RK Koper"),
]

CRO_LIGA = [
    ("RK Zagreb", 4, "en:RK Zagreb"),
    ("RK Nexe Našice", 4, "en:RK Nexe"),
    ("RK Sesvete", 2, "en:RK Sesvete"),
    ("RK Dubrava", 2, "en:RK Dubrava"),
    ("RK Poreč", 2, "en:RK Poreč"),
    ("RK Split", 2, "en:RK Split"),
    ("RK Metković", 2, "en:RK Metković"),
    ("RK Bjelovar", 2, "en:RK Bjelovar"),
]

MKD_LIGA = [
    ("RK Vardar 1961", 4, "en:RK Vardar"),
    ("Eurofarm Pelister", 4, "en:RK Pelister"),
    ("RK Metalurg Skopje", 3, "en:RK Metalurg Skopje"),
    ("RK Alkaloid", 2, "en:RK Alkaloid"),
    ("RK Butel Skopje", 2, None),
    ("RK Ohrid", 1, None),
]

SUI_QHL = [
    ("Kadetten Schaffhausen", 4, "de:Kadetten Schaffhausen"),
    ("Pfadi Winterthur", 3, "de:Pfadi Winterthur"),
    ("HC Kriens-Luzern", 3, "de:HC Kriens-Luzern"),
    ("Wacker Thun", 3, "de:Wacker Thun"),
    ("BSV Bern", 3, "de:BSV Bern"),
    ("TSV St. Otmar St. Gallen", 3, "de:TSV St. Otmar St. Gallen"),
    ("GC Amicitia Zürich", 2, "de:Grasshopper Club Zürich (Handball)"),
    ("HSC Suhr Aarau", 2, "de:HSC Suhr Aarau"),
    ("RTV 1879 Basel", 2, "de:RTV 1879 Basel"),
    ("HC Endingen", 2, None),
]

AUT_HLA = [
    ("Fivers Margareten", 3, "de:Handballclub Fivers Margareten"),
    ("HC Linz AG", 3, "de:HC Linz AG"),
    ("Alpla HC Hard", 3, "de:Alpla HC Hard"),
    ("Bregenz Handball", 3, "de:Bregenz Handball"),
    ("Handball West Wien", 2, "de:Handball West Wien"),
    ("Sparkasse Schwaz Handball Tirol", 2, "de:Sparkasse Schwaz Handball Tirol"),
    ("Union Leoben", 2, None),
    ("HSG Graz", 2, None),
    ("SG Insignis Handball West Wien", 2, None),
    ("UHK Krems", 2, "de:UHK Krems"),
]

ISL_URVALSDEILD = [
    ("Valur", 3, "en:Valur (handball)"),
    ("FH Hafnarfjörður", 3, "en:FH Hafnarfjörður"),
    ("KA Akureyri", 3, "en:KA (sports club)"),
    ("Haukar", 2, "en:Haukar"),
    ("Stjarnan", 2, "en:Stjarnan"),
    ("ÍBV Vestmannaeyjar", 2, "en:ÍBV"),
    ("Afturelding", 2, "en:Afturelding"),
    ("Selfoss", 2, "en:Selfoss (handball)"),
    ("Fram Reykjavík", 2, "en:Knattspyrnufélagið Fram"),
    ("Grótta", 1, "en:Grótta"),
]

QAT_LEAGUE = [
    ("Al Duhail SC", 4, "en:Al-Duhail SC"),
    ("Al Rayyan SC", 3, "en:Al-Rayyan SC"),
    ("Al Arabi SC", 3, "en:Al-Arabi SC (Qatar)"),
    ("Al Sadd SC", 3, "en:Al Sadd SC"),
    ("Qatar SC", 2, "en:Qatar SC"),
    ("Al Wakrah SC", 2, "en:Al-Wakrah SC"),
    ("Al Gharafa SC", 2, "en:Al-Gharafa SC"),
    ("Al Ahli SC", 2, "en:Al Ahli SC (Qatar)"),
]

EGY_LEAGUE = [
    ("Al Ahly SC", 4, "en:Al Ahly SC (handball)"),
    ("Zamalek SC", 4, "en:Zamalek SC Handball"),
    ("Sporting Alexandria", 3, "en:Sporting Club (Alexandria)"),
    ("Smouha SC", 2, "en:Smouha SC"),
    ("Al Ittihad Alexandria", 2, "en:Al Ittihad Alexandria Club"),
    ("Heliopolis SC", 2, None),
]

TUN_LEAGUE = [
    ("Espérance de Tunis", 3, "en:Espérance Sportive de Tunis (handball)"),
    ("Club Africain", 3, "en:Club Africain (handball)"),
    ("Étoile du Sahel", 3, "en:Étoile Sportive du Sahel"),
    ("El Makarem Mahdia", 2, None),
    ("CS Sakiet Ezzit", 2, None),
    ("Stade Tunisien", 2, "en:Stade Tunisien"),
]

BRA_LIGA = [
    ("EC Pinheiros", 3, "pt:Esporte Clube Pinheiros"),
    ("Handebol Taubaté", 3, "pt:Taubaté Handebol"),
    ("São Caetano", 2, None),
    ("Maringá Handebol", 2, None),
    ("Blumenau Handebol", 2, None),
    ("Cascavel Handebol", 2, None),
    ("ADC Metodista", 2, None),
    ("Londrina Handebol", 2, None),
]

JPN_LEAGUE_H = [
    ("Daido Steel Phoenix", 3, None),
    ("Toyoda Gosei Bluefalcon", 3, None),
    ("Osaki Electric OSOL", 3, None),
    ("Toyota Auto Body Brave Kings", 3, None),
    ("Golden Wolves Fukuoka", 2, None),
    ("Ryukyu Corazon", 2, "en:Ryukyu Corazon"),
    ("Solage Kumagaya", 2, None),
    ("Hokuriku Denryoku Blue Thunder", 2, None),
]

# --------------------------------------------------------------------------
# Tabla de ligas
# --------------------------------------------------------------------------
LEAGUES = [
    # pais jugable: Francia
    dict(id="fra-starligue", name="Starligue", country="FRA", tier=1, teams=FRA_STARLIGUE, verified=True),
    dict(id="fra-proligue", name="Proligue", country="FRA", tier=2, teams=FRA_PROLIGUE, verified=True),
    dict(id="fra-nationale-1", name="Nationale 1", country="FRA", tier=3, teams=FRA_N1, verified=False),
    # pais jugable: Alemania
    dict(id="ger-hbl", name="Handball-Bundesliga", country="GER", tier=1, teams=GER_HBL, verified=True),
    dict(id="ger-2hbl", name="2. Handball-Bundesliga", country="GER", tier=2, teams=GER_2HBL, verified=True),
    dict(id="ger-3liga", name="3. Liga", country="GER", tier=3, teams=GER_3LIGA, verified=True),
    # pais jugable: Argentina
    dict(id="arg-liga-honor", name="Liga de Honor", country="ARG", tier=1, teams=ARG_LIGA_HONOR, verified=False),
    dict(id="arg-liga-honor-plata", name="Liga de Honor Plata", country="ARG", tier=2,
         teams=ARG_LIGA_HONOR_PLATA, verified=False),
    dict(id="arg-metropolitano-a", name="Metropolitano Primera A", country="ARG", tier=3,
         teams=ARG_METROPOLITANO_A, verified=False),
    # destinos
    dict(id="esp-asobal", name="Liga ASOBAL", country="ESP", tier=1, teams=ESP_ASOBAL, verified=True),
    dict(id="esp-plata", name="División de Honor Plata", country="ESP", tier=2, teams=ESP_PLATA, verified=False),
    dict(id="den-handboldligaen", name="Håndboldligaen", country="DEN", tier=1, teams=DEN_LIGA, verified=True),
    dict(id="hun-nbi", name="Nemzeti Bajnokság I", country="HUN", tier=1, teams=HUN_NBI, verified=True),
    dict(id="pol-superliga", name="Orlen Superliga", country="POL", tier=1, teams=POL_SUPERLIGA, verified=False),
    dict(id="por-andebol-1", name="Andebol 1", country="POR", tier=1, teams=POR_ANDEBOL1, verified=False),
    dict(id="swe-handbollsligan", name="Handbollsligan", country="SWE", tier=1, teams=SWE_LIGAN, verified=False),
    dict(id="nor-ligaen", name="REMA 1000-ligaen", country="NOR", tier=1, teams=NOR_LIGAEN, verified=False),
    dict(id="rou-liga-nationala", name="Liga Naţională", country="ROU", tier=1, teams=ROU_LIGA, verified=False),
    dict(id="slo-liga-nlb", name="Liga NLB", country="SLO", tier=1, teams=SLO_LIGA, verified=False),
    dict(id="cro-premijer-liga", name="Premijer liga", country="CRO", tier=1, teams=CRO_LIGA, verified=False),
    dict(id="mkd-super-liga", name="Super Liga", country="MKD", tier=1, teams=MKD_LIGA, verified=False),
    dict(id="sui-qhl", name="Quickline Handball League", country="SUI", tier=1, teams=SUI_QHL, verified=False),
    dict(id="aut-hla", name="Handball Liga Austria", country="AUT", tier=1, teams=AUT_HLA, verified=False),
    dict(id="isl-urvalsdeild", name="Olis deild", country="ISL", tier=1, teams=ISL_URVALSDEILD, verified=False),
    dict(id="qat-league", name="Qatar Handball League", country="QAT", tier=1, teams=QAT_LEAGUE, verified=False),
    dict(id="egy-league", name="Egyptian Handball League", country="EGY", tier=1, teams=EGY_LEAGUE, verified=False),
    dict(id="tun-nationale-a", name="Championnat de Tunisie", country="TUN", tier=1, teams=TUN_LEAGUE, verified=False),
    dict(id="bra-liga-nacional", name="Liga Nacional de Handebol", country="BRA", tier=1, teams=BRA_LIGA, verified=False),
    dict(id="jpn-league-h", name="League H", country="JPN", tier=1, teams=JPN_LEAGUE_H, verified=False),
]
