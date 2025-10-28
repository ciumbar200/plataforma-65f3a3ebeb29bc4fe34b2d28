import {
  UserRole, RentalGoal, PropertyType, NotificationType
} from './types';
import type {
  User, Property, OwnerStats, Notification, SavedSearch, BlogPost
} from './types';

const BLOG_IMAGE_URLS = {
  mooners: [
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  ],
  owners: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80',
  ],
  silver: [
    'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&w=1400&q=80',
  ],
};

// --- START: Supabase URL Helper ---
// This helper function constructs the public URL for files stored in Supabase Storage.
// It uses the project URL from your supabaseClient.ts and the specified bucket name.
const SUPABASE_PROJECT_URL = "https://vogzzdnxoldgfpsrobps.supabase.co";

export const getSupabaseUrl = (bucket: 'avatars' | 'property-media', path: string) => {
  // Removes any leading slashes from the path to prevent double slashes in the URL
  const cleanedPath = path.startsWith('/') ? path.substring(1) : path;
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${cleanedPath}`;
};
// --- END: Supabase URL Helper ---


export const CITIES_DATA: { [key: string]: string[] } = {
  'Madrid': [
    'Todas las localidades',
    'Acebeda (La)', 'Ajalvir', 'Alameda del Valle', 'Álamo (El)', 'Alcalá de Henares', 'Alcobendas', 'Alcorcón', 'Aldea del Fresno', 'Algete', 'Alpedrete', 'Ambite', 'Anchuelo', 'Aranjuez', 'Arganda del Rey', 'Arroyomolinos', 'Atazar (El)', 'Batres', 'Becerril de la Sierra', 'Belmonte de Tajo', 'Berrueco (El)', 'Berzosa del Lozoya', 'Boadilla del Monte', 'Boalo (El)', 'Braojos de la Sierra', 'Brea de Tajo', 'Brunete', 'Buitrago del Lozoya', 'Bustarviejo', 'Cabanillas de la Sierra', 'Cabrera (La)', 'Cadalso de los Vidrios', 'Camarma de Esteruelas', 'Campo Real', 'Canencia', 'Carabaña', 'Casarrubuelos', 'Cenicientos', 'Cercedilla', 'Cervera de Buitrago', 'Chapinería', 'Chinchón', 'Ciempozuelos', 'Cobeña', 'Collado Mediano', 'Collado Villalba', 'Colmenar de Oreja', 'Colmenar del Arroyo', 'Colmenar Viejo', 'Colmenarejo', 'Corpa', 'Coslada', 'Cubas de la Sagra', 'Daganzo de Arriba', 'Escorial (El)', 'Estremera', 'Fresnedillas de la Oliva', 'Fresno de Torote', 'Fuenlabrada', 'Fuente el Saz de Jarama', 'Fuentidueña de Tajo', 'Galapagar', 'Garganta de los Montes', 'Gargantilla del Lozoya y Pinilla de Buitrago', 'Gascones', 'Getafe', 'Griñón', 'Guadalix de la Sierra', 'Guadarrama', 'Hiruela (La)', 'Horcajo de la Sierra-Aoslos', 'Horcajuelo de la Sierra', 'Hoyo de Manzanares', 'Humanes de Madrid', 'Leganés', 'Loeches', 'Lozoya', 'Lozoyuela-Navas-Sieteiglesias', 'Madarcos', 'Madrid', 'Majadahonda', 'Manzanares el Real', 'Meco', 'Mejorada del Campo', 'Miraflores de la Sierra', 'Molar (El)', 'Molinos (Los)', 'Montejo de la Sierra', 'Moraleja de Enmedio', 'Moralzarzal', 'Morata de Tajuña', 'Móstoles', 'Navacerrada', 'Navalafuente', 'Navalagamella', 'Navalcarnero', 'Navarredonda y San Mamés', 'Navas del Rey', 'Nuevo Baztán', 'Olmeda de las Fuentes', 'Orusco de Tajuña', 'Paracuellos de Jarama', 'Parla', 'Patones', 'Pedrezuela', 'Pelayos de la Presa', 'Perales de Tajuña', 'Pezuela de las Torres', 'Pinilla del Valle', 'Pinto', 'Piñuécar-Gandullas', 'Pozuelo de Alarcón', 'Pozuelo del Rey', 'Prádena del Rincón', 'Puebla de la Sierra', 'Puentes Viejas', 'Quijorna', 'Rascafría', 'Redueña', 'Ribatejada', 'Rivas-Vaciamrid', 'Robledillo de la Jara', 'Robledo de Chavela', 'Robregordo', 'Rozas de Madrid (Las)', 'Rozas de Puerto Real', 'San Agustín del Guadalix', 'San Fernando de Henares', 'San Lorenzo de El Escorial', 'San Martín de la Vega', 'San Martín de Valdeiglesias', 'San Sebastián de los Reyes', 'Santa María de la Alameda', 'Santorcaz', 'Santos de la Humosa (Los)', 'Serna del Monte (La)', 'Serranillos del Valle', 'Sevilla la Nueva', 'Somosierra', 'Soto del Real', 'Talamanca de Jarama', 'Tielmes', 'Titulcia', 'Torrejón de Ardoz', 'Torrejón de la Calzada', 'Torrejón de Velasco', 'Torrelaguna', 'Torrelodones', 'Torremocha de Jarama', 'Torres de la Alameda', 'Tres Cantos', 'Valdaracete', 'Valdeavero', 'Valdelaguna', 'Valdemanco', 'Valdemaqueda', 'Valdemorillo', 'Valdemoro', 'Valdeolmos-Alalpardo', 'Valdepiélagos', 'Valdetorres de Jarama', 'Valdilecha', 'Valverde de Alcalá', 'Velilla de San Antonio', 'Vellón (El)', 'Venturada', 'Villa del Prado', 'Villaconejos', 'Villalbilla', 'Villamanrique de Tajo', 'Villamanta', 'Villamantilla', 'Villanueva de la Cañada', 'Villanueva de Perales', 'Villanueva del Pardillo', 'Villar del Olmo', 'Villarejo de Salvanés', 'Villaviciosa de Odón', 'Villavieja del Lozoya', 'Zarzalejo'
  ],
  'Barcelona': [
    'Todas las localidades',
    'Abrera', 'Aguilar de Segarra', 'Aiguafreda', 'Alella', 'Alpens', 'Ametlla del Vallès (L\')', 'Arenys de Mar', 'Arenys de Munt', 'Argençola', 'Argentona', 'Artés', 'Avià', 'Avinyó', 'Avinyonet del Penedès', 'Badalona', 'Badia del Vallès', 'Bagà', 'Balenyà', 'Balsareny', 'Barberà del Vallès', 'Barcelona', 'Begues', 'Bellprat', 'Berga', 'Bigues i Riells', 'Borredà', 'Bruc (El)', 'Brull (El)', 'Cabanyes (Les)', 'Cabrera d\'Anoia', 'Cabrera de Mar', 'Cabrils', 'Calaf', 'Calders', 'Caldes d\'Estrac', 'Caldes de Montbui', 'Calella', 'Calldetenes', 'Callús', 'Calonge de Segarra', 'Campins', 'Canet de Mar', 'Canovelles', 'Cànoves i Samalús', 'Canyelles', 'Capellades', 'Capolat', 'Cardedeu', 'Cardona', 'Carme', 'Casserres', 'Castell de l\'Areny', 'Castellar de n\'Hug', 'Castellar del Riu', 'Castellar del Vallès', 'Castellbell i el Vilar', 'Castellbisbal', 'Castellcir', 'Castelldefels', 'Castellet i la Gornal', 'Castellfollit de Riubregós', 'Castellfollit del Boix', 'Castellgalí', 'Castellnou de Bages', 'Castellolí', 'Castellterçol', 'Castellví de la Marca', 'Castellví de Rosanes', 'Centelles', 'Cercs', 'Cerdanyola del Vallès', 'Cervelló', 'Collbató', 'Collsuspina', 'Copons', 'Corbera de Llobregat', 'Cornellà de Llobregat', 'Cubelles', 'Dosrius', 'Esparreguera', 'Esplugues de Llobregat', 'Espunyola (L\')', 'Estany (L\')', 'Figaró-Montmany', 'Fígols', 'Fogars de la Selva', 'Fogars de Montclús', 'Folgueroles', 'Fonollosa', 'Font-rubí', 'Franqueses del Vallès (Les)', 'Gaià', 'Gallifa', 'Garriga (La)', 'Gavà', 'Gelida', 'Gironella', 'Gisclareny', 'Granada (La)', 'Granera', 'Granollers', 'Gualba', 'Guardiola de Berguedà', 'Gurb', 'Hospitalet de Llobregat (L\')', 'Hostalets de Pierola (Els)', 'Igualada', 'Jorba', 'Llacuna (La)', 'Llagosta (La)', 'Lliçà d\'Amunt', 'Lliçà de Vall', 'Llinars del Vallès', 'Lluçà', 'Malgrat de Mar', 'Malla', 'Manlleu', 'Manresa', 'Marganell', 'Martorell', 'Martorelles', 'Masies de Roda (Les)', 'Masies de Voltregà (Les)', 'Masnou (El)', 'Masquefa', 'Matadepera', 'Mataró', 'Mediona', 'Moià', 'Molins de Rei', 'Mollet del Vallès', 'Monistrol de Calders', 'Monistrol de Montserrat', 'Montcada i Reixac', 'Montclar', 'Montesquiu', 'Montgat', 'Montmajor', 'Montmaneu', 'Montmeló', 'Montornès del Vallès', 'Montseny', 'Muntanyola', 'Mura', 'Navarcles', 'Navàs', 'Nou de Berguedà (La)', 'Òdena', 'Olèrdola', 'Olesa de Bonesvalls', 'Olesa de Montserrat', 'Olivella', 'Olost', 'Olvan', 'Orís', 'Oristà', 'Orpí', 'Òrrius', 'Pacs del Penedès', 'Palafolls', 'Palau-solità i Plegamans', 'Pallejà', 'Palma de Cervelló (La)', 'Papiol (El)', 'Paredes del Vallès', 'Parets del Vallès', 'Perafita', 'Piera', 'Pineda de Mar', 'Pla del Penedès (El)', 'Pobla de Claramunt (La)', 'Pobla de Lillet (La)', 'Polinyà', 'Pont de Vilomara i Rocafort (El)', 'Pontons', 'Prat de Llobregat (El)', 'Prats de Lluçanès', 'Prats de Rei (Els)', 'Premià de Dalt', 'Premià de Mar', 'Puigdàlber', 'Puig-reig', 'Pujalt', 'Quar (La)', 'Rajadell', 'Rellinars', 'Ripollet', 'Roca del Vallès (La)', 'Roda de Ter', 'Rubí', 'Rubió', 'Rupit i Pruit', 'Sabadell', 'Sagàs', 'Saldes', 'Sallent', 'Sant Adrià de Besòs', 'Sant Agustí de Lluçanès', 'Sant Andreu de la Barca', 'Sant Andreu de Llavaneres', 'Sant Antoni de Vilamajor', 'Sant Bartomeu del Grau', 'Sant Boi de Llobregat', 'Sant Boi de Lluçanès', 'Sant Cebrià de Vallalta', 'Sant Celoni', 'Sant Climent de Llobregat', 'Sant Cugat del Vallès', 'Sant Cugat Sesgarrigues', 'Sant Esteve de Palautordera', 'Sant Esteve Sesrovires', 'Sant Feliu de Codines', 'Sant Feliu de Llobregat', 'Sant Feliu Sasserra', 'Sant Fost de Campsentelles', 'Sant Fruitós de Bages', 'Sant Hipòlit de Voltregà', 'Sant Iscle de Vallalta', 'Sant Jaume de Frontanyà', 'Sant Joan de Vilatorrada', 'Sant Joan Despí', 'Sant Julià de Cerdanyola', 'Sant Julià de Vilatorta', 'Sant Just Desvern', 'Sant Llorenç d\'Hortons', 'Sant Llorenç Savall', 'Sant Martí d\'Albars', 'Sant Martí de Centelles', 'Sant Martí de Tous', 'Sant Martí Sarroca', 'Sant Martí Sesgueioles', 'Sant Mateu de Bages', 'Sant Pere de Ribes', 'Sant Pere de Riudebitlles', 'Sant Pere de Torelló', 'Sant Pere de Vilamajor', 'Sant Pere Sallavinera', 'Sant Pol de Mar', 'Sant Quintí de Mediona', 'Sant Quirze de Besora', 'Sant Quirze del Vallès', 'Sant Quirze Safaja', 'Sant Sadurní d\'Anoia', 'Sant Sadurní d\'Osormort', 'Sant Salvador de Guardiola', 'Sant Vicenç de Castellet', 'Sant Vicenç de Montalt', 'Sant Vicenç de Torelló', 'Sant Vicenç dels Horts', 'Santa Cecília de Voltregà', 'Santa Coloma de Cervelló', 'Santa Coloma de Gramenet', 'Santa Eugènia de Berga', 'Santa Eulàlia de Riuprimer', 'Santa Eulàlia de Ronçana', 'Santa Fe del Penedès', 'Santa Margarida de Montbui', 'Santa Margarida i els Monjos', 'Santa Maria de Besora', 'Santa Maria de Corcó', 'Santa Maria de Martorelles', 'Santa Maria de Merlès', 'Santa Maria de Miralles', 'Santa Maria d\'Oló', 'Santa Maria de Palautordera', 'Santa Perpètua de Mogoda', 'Santa Susanna', 'Santpedor', 'Sentmenat', 'Seva', 'Sitges', 'Sobremunt', 'Sora', 'Subirats', 'Súria', 'Tagamanent', 'Talamanca', 'Taradell', 'Tavèrnoles', 'Tavertet', 'Teià', 'Terrassa', 'Tiana', 'Tona', 'Tordera', 'Torelló', 'Torre de Claramunt (La)', 'Torrelavit', 'Torrelles de Foix', 'Torrelles de Llobregat', 'Ullastrell', 'Vacarisses', 'Vallbona d\'Anoia', 'Vallcebre', 'Vallgorguina', 'Vallirana', 'Vallromanes', 'Veciana', 'Vic', 'Vilada', 'Viladecavalls', 'Viladecans', 'Vilanova de Sau', 'Vilanova del Camí', 'Vilanova del Vallès', 'Vilanova i la Geltrú', 'Vilassar de Dalt', 'Vilassar de Mar', 'Vilobí del Penedès', 'Vinyols i els Arcs'
  ],
  'Valencia': [
    'Todas las localidades',
    'Ademuz', 'Ador', 'Agullent', 'Aielo de Malferit', 'Aielo de Rugat', 'Alaquàs', 'Albaida', 'Albal', 'Albalat de la Ribera', 'Albalat dels Sorells', 'Albalat dels Tarongers', 'Alberic', 'Alborache', 'Alboraya', 'Albuixech', 'Alcàntera de Xúquer', 'Alcàsser', 'Alcublas', 'Aldaia', 'Alfafar', 'Alfara de la Baronia', 'Alfara del Patriarca', 'Alfarp', 'Alfarrasí', 'Alfauir', 'Algar de Palancia', 'Algemesí', 'Algimia de Alfara', 'Alginet', 'Almàssera', 'Almiserà', 'Almoines', 'Almussafes', 'Alpuente', 'Alqueria de la Comtessa (l\')', 'Alzira', 'Andilla', 'Anna', 'Antella', 'Aras de los Olmos', 'Atzeneta d\'Albaida', 'Ayora', 'Barx', 'Barxeta', 'Bèlgida', 'Bellreguard', 'Bellús', 'Benagéber', 'Benaguasil', 'Benavites', 'Beneixida', 'Benetússer', 'Beniarjó', 'Beniatjar', 'Benicolet', 'Benicull de Xúquer', 'Benifaió', 'Benifairó de la Valldigna', 'Benifairó de les Valls', 'Beniflá', 'Benigànim', 'Benimodo', 'Benimuslem', 'Beniparrell', 'Benirredrà', 'Benissanó', 'Benissoda', 'Benissuera', 'Bétera', 'Bicorp', 'Bocairent', 'Bolbaite', 'Bonrepòs i Mirambell', 'Bufali', 'Bugarra', 'Buñol', 'Burjassot', 'Calles', 'Camporrobles', 'Canals', 'Canet d\'En Berenguer', 'Carcaixent', 'Càrcer', 'Carlet', 'Carrícola', 'Casas Altas', 'Casas Bajas', 'Casinos', 'Castelló de Rugat', 'Castellonet de la Conquesta', 'Castielfabib', 'Catadau', 'Catarroja', 'Caudete de las Fuentes', 'Cerdà', 'Chella', 'Chelva', 'Chera', 'Chest', 'Chiva', 'Chulilla', 'Cofrentes', 'Corbera', 'Cortes de Pallás', 'Cotes', 'Cullera', 'Daimús', 'Domeño', 'Dos Aguas', 'Eliana (l\')', 'Emperador', 'Enguera', 'Ènova (l\')', 'Estivella', 'Estubeny', 'Faura', 'Favara', 'Foios', 'Font de la Figuera (la)', 'Font d\'En Carròs (la)', 'Fontanars dels Alforins', 'Fortaleny', 'Fuenterrobles', 'Gandia', 'Gátova', 'Gavarda', 'Genovés', 'Gestalgar', 'Gilet', 'Godella', 'Godelleta', 'Granja de la Costera (la)', 'Guadasséquies', 'Guadassuar', 'Guardamar de la Safor', 'Higueruelas', 'Jalance', 'Jarafuel', 'Llanera de Ranes', 'Llaurí', 'Llíria', 'Llocnou de la Corona', 'Llocnou de Sant Jeroni', 'Llocnou d\'En Fenollet', 'Llombai', 'Llosa de Ranes (la)', 'Llutxent', 'Loriguilla', 'Losa del Obispo', 'Macastre', 'Manises', 'Manuel', 'Marines', 'Massalavés', 'Massalfassar', 'Massamagrell', 'Massanassa', 'Meliana', 'Millares', 'Miramar', 'Mislata', 'Mogente', 'Moncada', 'Montserrat', 'Montaverner', 'Montesa', 'Montitxelvo', 'Montroy', 'Museros', 'Náquera', 'Navarrés', 'Novelé', 'Oliva', 'Olocau', 'Olleria (l\')', 'Ontinyent', 'Otos', 'Paiporta', 'Palma de Gandía', 'Palmera', 'Palomar (el)', 'Paterna', 'Pedralba', 'Petrés', 'Picanya', 'Picassent', 'Piles', 'Pinet', 'Pobla de Farnals (la)', 'Pobla de Vallbona (la)', 'Pobla del Duc (la)', 'Pobla Llarga (la)', 'Polinyà de Xúquer', 'Potries', 'Puçol', 'Puebla de San Miguel', 'Puig de Santa Maria', 'Quart de les Valls', 'Quart de Poblet', 'Quartell', 'Quatretonda', 'Quesa', 'Rafelbunyol', 'Rafelcofer', 'Rafelguaraf', 'Ráfol de Salem', 'Real', 'Real de Gandía', 'Requena', 'Riba-roja de Túria', 'Riola', 'Rocafort', 'Rotglà i Corberà', 'Rótova', 'Rugat', 'Sagunto', 'Salem', 'San Antonio de Benagéber', 'Sant Joanet', 'Sedaví', 'Segart', 'Sellent', 'Sempere', 'Senyera', 'Serra', 'Siete Aguas', 'Silla', 'Simat de la Valldigna', 'Sinarcas', 'Sollana', 'Sot de Chera', 'Sueca', 'Sumacàrcer', 'Tavernes Blanques', 'Tavernes de la Valldigna', 'Teresa de Cofrentes', 'Terrateig', 'Titaguas', 'Torrebaja', 'Torrella', 'Torrent', 'Torres Torres', 'Tous', 'Tuéjar', 'Turís', 'Utiel', 'Valencia', 'Vallada', 'Vallanca', 'Vallés', 'Venta del Moro', 'Vilamarxant', 'Villalonga', 'Villar del Arzobispo', 'Villargordo del Cabriel', 'Vinalesa', 'Xàtiva', 'Xeraco', 'Xeresa', 'Xirivella', 'Yátova', 'Yesa (la)', 'Zarra'
  ],
  'Sevilla': [
    'Todas las localidades',
    'Aguadulce', 'Alanís', 'Albaida del Aljarafe', 'Alcalá de Guadaíra', 'Alcalá del Río', 'Alcolea del Río', 'Algaba (La)', 'Algámitas', 'Almadén de la Plata', 'Almensilla', 'Arahal', 'Aznalcázar', 'Aznalcóllar', 'Badolatosa', 'Benacazón', 'Bollullos de la Mitación', 'Bormujos', 'Brenes', 'Burguillos', 'Cabezas de San Juan (Las)', 'Camas', 'Campana (La)', 'Cantillana', 'Cañada Rosal', 'Carmona', 'Carrión de los Céspedes', 'Casariche', 'Castilblanco de los Arroyos', 'Castilleja de Guzmán', 'Castilleja de la Cuesta', 'Castilleja del Campo', 'Castillo de las Guardas (El)', 'Cazalla de la Sierra', 'Constantina', 'Coria del Río', 'Coripe', 'Coronil (El)', 'Corrales (Los)', 'Cuervo de Sevilla (El)', 'Dos Hermanas', 'Écija', 'Espartinas', 'Estepa', 'Fuentes de Andalucía', 'Garrobo (El)', 'Gelves', 'Gerena', 'Gilena', 'Gines', 'Guadalcanal', 'Guillena', 'Herrera', 'Huévar del Aljarafe', 'Isla Mayor', 'Lantejuela (La)', 'Lebrija', 'Lora de Estepa', 'Lora del Río', 'Luisiana (La)', 'Madroño (El)', 'Mairena del Alcor', 'Mairena del Aljarafe', 'Marchena', 'Marinaleda', 'Martín de la Jara', 'Molares (Los)', 'Montellano', 'Morón de la Frontera', 'Navas de la Concepción (Las)', 'Olivares', 'Osuna', 'Palacios y Villafranca (Los)', 'Palomares del Río', 'Paradas', 'Pedrera', 'Pedroso (El)', 'Peñaflor', 'Pilas', 'Pruna', 'Puebla de Cazalla (La)', 'Puebla de los Infantes (La)', 'Puebla del Río (La)', 'Real de la Jara (El)', 'Rinconada (La)', 'Roda de Andalucía (La)', 'Ronquillo (El)', 'Rubio (El)', 'Salteras', 'San Juan de Aznalfarache', 'San Nicolás del Puerto', 'Sanlúcar la Mayor', 'Santiponce', 'Saucejo (El)', 'Sevilla', 'Tocina', 'Tomares', 'Umbrete', 'Utrera', 'Valencina de la Concepción', 'Villamanrique de la Condesa', 'Villanueva de San Juan', 'Villanueva del Ariscal', 'Villanueva del Río y Minas', 'Villaverde del Río', 'Viso del Alcor (El)'
  ],
};

export const COUNTRIES = ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guyana", "Guinea", "Guinea ecuatorial", "Guinea-Bisáu", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana", "República Sudafricana", "Ruanda", "Rumanía", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"];
export const RELIGIONS = ["Cristiana", "Musulmana", "Judía", "Budista", "Hindú", "Atea", "Agnóstica", "Espiritual pero no religiosa", "Otra", "Prefiero no contestar"];
export const SEXUAL_ORIENTATIONS = ["Heterosexual", "Homosexual", "Bisexual", "Pansexual", "Asexual", "Queer", "En duda", "Otra", "Prefiero no contestar"];

export const showNotification = (title: string, options: NotificationOptions) => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones de escritorio');
  } else if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
};

/**
 * Sends email data to a configured n8n webhook.
 * @param to The recipient's email address.
 * @param subject The email subject.
 * @param html The HTML body of the email.
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  // NOTE FOR DEPLOYMENT: This localhost URL will not work in production.
  // Replace with your production n8n webhook URL.
  // It is also highly recommended to move this to a serverless function (e.g., Supabase Edge Function)
  // to avoid exposing the webhook URL on the client-side.
  const webhookUrl = 'http://localhost:5678/webhook/9e4fb242-cbdd-47fb-b4d0-4c7053dcc8d6';

  try {
    const params = new URLSearchParams();
    params.append('to', to);
    params.append('subject', subject);
    params.append('html', html);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      console.error('La respuesta del webhook de n8n no fue exitosa:', response.statusText);
      const responseBody = await response.text();
      console.error('Cuerpo de la respuesta:', responseBody);
    } else {
      console.log('Datos del email enviados correctamente al webhook de n8n.');
    }
  } catch (error) {
    console.error('Error al enviar los datos del email a n8n:', error);
  }
};

/**
 * Adds a new contact to Fluent CRM via webhook.
 * @param user The user object containing contact details.
 */
export const addToFluentCRM = async (user: { name: string; last_name?: string; email?: string; role: UserRole }): Promise<void> => {
  // NOTE FOR DEPLOYMENT: This URL uses a raw IP and is likely for a development environment.
  // Replace with your production Fluent CRM webhook URL.
  // It is also highly recommended to move this to a serverless function for security.
  const webhookUrl = 'https://34.18.107.121/?fluentcrm=1&route=contact&hash=9081c320-d431-459a-baca-fbcad56b42d9';

  if (!user.email) {
    console.error('Fluent CRM: Email is required to add a contact.');
    return;
  }

  const payload = {
    first_name: user.name,
    last_name: user.last_name || '',
    email: user.email,
    tags: [user.role], // Use the role as a tag
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('La respuesta del webhook de Fluent CRM no fue exitosa:', response.statusText);
      const responseBody = await response.text();
      console.error('Cuerpo de la respuesta:', responseBody);
    } else {
      console.log('Contacto enviado correctamente al webhook de Fluent CRM.');
    }
  } catch (error) {
    console.error('Error al enviar el contacto a Fluent CRM:', error);
  }
};

// --- MOCK DATA ---
// MOCK_USERS and MOCK_PROPERTIES have been removed.
// The application will now fetch this data directly from Supabase.

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 1, user_id: '8a65e909-7a54-4e81-872f-488f5f1a3ba2', type: NotificationType.NEW_MATCH, message: '¡Tienes un nuevo match con Javier! Compatibilidad del 85%.', timestamp: '2024-07-25T10:30:00Z', read: false, related_entity_id: 2 },
    { id: 2, user_id: '2c9f8a6a-3e4b-4b1a-9f5a-3e1b3a3b3c4c', type: NotificationType.PROPERTY_INQUIRY, message: 'Elena está interesada en tu "Habitación luminosa en Gràcia".', timestamp: '2024-07-25T09:00:00Z', read: true, related_entity_id: 1 },
];

export const MOCK_SAVED_SEARCHES: SavedSearch[] = [
    { id: 1, user_id: '8a65e909-7a54-4e81-872f-488f5f1a3ba2', name: 'Pisos en Malasaña', filters: { city: 'Madrid', locality: 'Malasaña', max_price: 600 } }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        slug: 'guia-mooners-comparte-hogar-con-claridad',
        title: 'Guía MoOners: Cómo compartir hogar con claridad y buena vibra',
        excerpt: 'Checklist profundo para estudiantes y jóvenes profesionales: define tus reglas, protege tu descanso y activa un piso lleno de apoyo mutuo.',
        image_url: BLOG_IMAGE_URLS.mooners[0],
        content: `
            <p>Compartir piso con desconocidos ya no es una lotería: con datos, rituales y acuerdos claros se transforma en la forma más humana y sostenible de vivir en las grandes ciudades españolas.</p>
            <h2>1. Diseña tu hogar ideal antes de publicar un anuncio</h2>
            <p>Empieza por la introspección. Anota tu presupuesto real, los horarios en los que necesitas silencio, si trabajas remoto, si haces videollamadas, si practicas música, qué alergias tienes o qué hábitos alimenticios no quieres negociar.</p>
            <ul>
                <li><strong>Presupuesto consciente:</strong> suma alquiler, suministros, limpieza y un 10% de colchón para imprevistos.</li>
                <li><strong>Mapa emocional:</strong> qué comportamientos te hacen sentir seguro y cuáles son líneas rojas (fiestas improvisadas, mascotas, tabaco).</li>
                <li><strong>Calendario vital:</strong> define qué días visitas familia, recibes amistades o te desconectas.</li>
            </ul>
            <p>Con MoOn este autodiagnóstico forma parte del onboarding para que no dejes nada fuera.</p>
            <h2>2. Primera videollamada = contrato social</h2>
            <p>Los hogares MoOn con un encuentro inicial estructurado tienen un 37% menos de incidencias en los primeros 90 días. Usa la videollamada para co-crear un tablero digital con normas, turnos y protocolos de convivencia.</p>
            <h2>3. Reunión de cinco minutos cada semana</h2>
            <p>La fórmula “Check-in MoOn”: cada domingo, cinco minutos para revisar facturas, agenda común y cómo se siente cada persona. Si surge algo delicado, agendad una reunión aparte.</p>
            <h2>4. Documenta los acuerdos en la app</h2>
            <p>Nuestra herramienta de acuerdos convierte esas reglas en anexos digitales que todos firman. Eso evita malentendidos y te protege si alguien incumple.</p>
            <blockquote>“Compartimos piso tres diseñadoras UX. Con el check-in semanal evitamos acumular tensión y mantenemos el piso impecable.” — Celia, 28 años, Mooner en Valencia</blockquote>
            <h2>5. Plan de bienestar compartido</h2>
            <p>Incluye actividades para reforzar la convivencia: cenas temáticas, rutinas deportivas, limpieza conjunta gamificada. Un piso sano nace de hábitos compartidos.</p>
            <p><a href="#" data-page-target="register" class="inline-block mt-8 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-6 py-3 font-semibold text-slate-900">Crear mi perfil Mooner gratuito</a></p>
        `,
        author: 'María Luna · Head of Community',
        author_image_url: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&h=200&fit=crop',
        publish_date: '2025-02-18T08:30:00Z'
    },
    {
        id: 2,
        slug: 'primeros-30-dias-mooner-plan-de-accion',
        title: 'Los primeros 30 días como Mooner: plan de acción para integrarte sin agobios',
        excerpt: 'Checklist día a día para aterrizar en tu nuevo piso, conectar con tus compañer@s y disfrutar de la ciudad sin perder tus límites.',
        image_url: BLOG_IMAGE_URLS.mooners[1],
        content: `
            <p>El primer mes en un hogar compartido marca el tono de la convivencia. Esta guía te acompaña desde que haces las maletas hasta que firmas el primer balance de gastos.</p>
            <h2>Semana 1 · Aterriza y conoce el espacio</h2>
            <ol>
                <li>Haz una mini auditoría del piso (electrodomésticos, armarios, menaje). Documenta con fotos y súbelas al chat común MoOn.</li>
                <li>Bloquea un rato para personalizar tu habitación con iluminación cálida, estanterías y plantas que absorban ruido.</li>
                <li>Activa el tablero de incidencias. Si algo no funciona, se registra y se asigna responsable.</li>
            </ol>
            <h2>Semana 2 · Conecta personas y ritmos</h2>
            <p>Organizad una cena informal para compartir lo que cada persona necesita para sentirse en casa. Propón un mural con cartas de “cómo apoyarme cuando…”</p>
            <h2>Semana 3 · Finanzas y logística</h2>
            <p>Automatizad pagos en la app de MoOn, definid límites de consumo energético y acordad compras recurrentes (limpieza, básicos de despensa).</p>
            <h2>Semana 4 · Ritualiza bienestar</h2>
            <p>Diseñad un calendario social: día de coworking, noche de peli, limpieza express gamificada. La constancia genera confianza.</p>
            <blockquote>“Con el plan de 30 días nunca nos sentimos perdidos. Todo estaba pautado, hasta la playlist de la primera cena.” — Lucas, 24 años, Mooner en Madrid</blockquote>
            <p><a href="#" data-page-target="register" class="inline-block mt-8 rounded-full border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">Empezar onboarding MoOn</a></p>
        `,
        author: 'Sara Contreras · Coach de Convivencias',
        author_image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-22T09:10:00Z'
    },
    {
        id: 3,
        slug: 'presupuesto-colaborativo-mooners-plantilla',
        title: 'Presupuesto colaborativo para Mooners: plantilla real con números y hacks de ahorro',
        excerpt: 'Un ejemplo real de cómo tres profesionales gestionan 1.250€ de alquiler, servicios y ocio sin sorpresas ni dramas.',
        image_url: BLOG_IMAGE_URLS.mooners[2],
        content: `
            <p>Compartimos el presupuesto real de un piso MoOn en Barcelona (Gràcia) ocupado por una diseñadora UX, un médico residente y un productor musical.</p>
            <h2>1. Números base</h2>
            <ul>
                <li>Alquiler: 1.250€</li>
                <li>Suministros variables: 210€ (luz, agua, gas, internet)</li>
                <li>Limpieza quincenal: 120€</li>
                <li>Fondo de mantenimiento: 60€</li>
            </ul>
            <p>Total mensual compartido: <strong>1.640€</strong>. Con nuestro algoritmo, el reparto se adapta a metros habitables y uso de teletrabajo.</p>
            <h2>2. Reglas de oro</h2>
            <p>Se establece un margen de 5% para subidas de energía, cada gasto se aprueba en el chat y se registra en la app de seguimiento de MoOn.</p>
            <h2>3. Hack de ahorro: suscripciones compartidas</h2>
            <p>Clases de yoga online, streaming premium, compra mensual a granel y car-sharing. Suman 86€ pero fomentan comunidad y salud.</p>
            <h2>4. ¿Qué pasa si alguien se retrasa?</h2>
            <p>Existe un protocolo: recordatorio automático, período de gracia y, si se repite, reunión con mediadora MoOn para redefinir compromisos.</p>
            <p><a href="#" data-page-target="register" class="inline-block mt-8 rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-blue-400 px-6 py-3 font-semibold text-slate-900">Descargar plantilla editable</a></p>
        `,
        author: 'Equipo de Datos MoOn',
        author_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-24T07:45:00Z'
    },
    {
        id: 4,
        slug: 'propietarios-guia-para-enamorar-a-inquilinos-ideales',
        title: 'Propietarios: guía para enamorar a inquilinos ideales y cerrar visitas con decisión',
        excerpt: 'Storytelling, fotografía y experiencia de bienvenida para convertir cada visita en una comunidad dispuesta a cuidar tu piso.',
        image_url: BLOG_IMAGE_URLS.owners[0],
        content: `
            <p>El alquiler compartido es un servicio premium: vendes estabilidad, cuidado y comunidad. Aquí tienes la metodología MoOn Hosts para destacar en 2025.</p>
            <h2>1. Construye una narrativa del espacio</h2>
            <p>Más allá de los metros y la terraza, cuenta qué historias pueden vivirse allí: teletrabajo, cenas en la cocina, atardeceres en el balcón, barrio con cultura vibrante.</p>
            <h2>2. Tour sensorial</h2>
            <ul>
                <li><strong>Vista:</strong> fotografía profesional + vídeo en vertical.</li>
                <li><strong>Olfato:</strong> aroma neutro de hogar recién limpio.</li>
                <li><strong>Gusto:</strong> detalles como té o fruta para la visita.</li>
                <li><strong>Tacto:</strong> textiles suaves, sillas ergonómicas.</li>
            </ul>
            <h2>3. Presenta tu “Manual del Hogar”</h2>
            <p>Incluye calendario de mantenimiento, contactos de confianza, reglas de convivencia y cómo responder ante urgencias. Esto transmite profesionalidad y reduce imprevistos.</p>
            <h2>4. Convierte la visita en pre-onboarding</h2>
            <p>Invita a los candidatos a un tour virtual con los actuales habitantes (si los hay) o presenta perfiles tipo. Los propietarios que integran a MoOn en las visitas cierran hasta un 60% más rápido.</p>
            <p><a href="#" data-page-target="register" class="inline-block mt-8 rounded-full border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">Quiero ser anfitrión MoOn</a></p>
        `,
        author: 'Carla Dávila · Experta en Home Staging',
        author_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-21T11:30:00Z'
    },
    {
        id: 5,
        slug: 'checklist-legal-propietarios-alquiler-compartido-seguro',
        title: 'Checklist legal para propietarios: alquiler compartido seguro sin dolores de cabeza',
        excerpt: 'Documentos imprescindibles, seguros y cláusulas recomendadas para blindar tu patrimonio cuando compartes tu vivienda.',
        image_url: BLOG_IMAGE_URLS.owners[1],
        content: `
            <p>Legal y humano pueden convivir. Este checklist resume los requisitos más relevantes en España para alquilar de forma compartida en 2025.</p>
            <h2>Documentación básica</h2>
            <ul>
                <li>DNI/NIE y escritura o contrato de propiedad.</li>
                <li>Certificado de eficiencia energética actualizado.</li>
                <li>Boletines de instalación eléctrica y gas si aplica.</li>
                <li>Seguro multirriesgo con cobertura de responsabilidad civil.</li>
            </ul>
            <h2>Cláusulas recomendadas en el contrato</h2>
            <p>Define el régimen de uso de zonas comunes, subarriendo, permanencia mínima y penalizaciones razonables. Incluye anexo de convivencia avalado por MoOn.</p>
            <h2>Protección de datos y verificación</h2>
            <p>Utiliza nuestra verificación KYC para gestionar DNI y nóminas cumpliendo RGPD. Los datos se almacenan cifrados y solo se comparten contigo cuando das el “OK”.</p>
            <h2>Impuestos y fiscalidad</h2>
            <p>Recoge todas las rentas, aplica deducciones por rehabilitación y guarda facturas de servicios. Si necesitas asesoramiento te ponemos en contacto con fiscalistas aliados.</p>
            <p><a href="#" data-page-target="register" class="inline-block mt-8 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-6 py-3 font-semibold text-slate-900">Hablar con un advisor MoOn</a></p>
        `,
        author: 'Ignacio Ruiz · Abogado colaborador',
        author_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-23T08:00:00Z'
    },
    {
        id: 6,
        slug: 'caso-exito-anfitriona-moon-transforma-su-piso',
        title: 'Caso de éxito: cómo Ana llenó su piso en 10 días y duplicó ingresos con servicios premium',
        excerpt: 'Aprende del método de una anfitriona MoOn que convirtió un piso vacío en un hogar rentable y bien cuidado.',
        image_url: BLOG_IMAGE_URLS.owners[2],
        content: `
            <p>Ana heredó un piso de 3 habitaciones en Sevilla. Tras meses vacío, decidió probar MoOn y hoy tiene ingresos estables, contratos claros y convivencia feliz.</p>
            <h2>1. Diagnóstico inicial</h2>
            <p>Analizamos el barrio, perfil objetivo (profesionales sanitarios) y precio óptimo según compatibilidad y servicios.</p>
            <h2>2. Home staging con propósito</h2>
            <p>Invertimos 1.200€ en textiles, iluminación cálida y escritorio ergonómico en cada habitación. Resultado: 27 solicitudes cualificadas en 48 horas.</p>
            <h2>3. Selección en tres fases</h2>
            <ol>
                <li>Filtro digital MoOn (identidad, solvencia, hábitos).</li>
                <li>Videollamada grupal con preguntas de convivencia.</li>
                <li>Visita presencial con tour guiado y manual del hogar.</li>
            </ol>
            <h2>4. Servicios extra</h2>
            <p>Ana ofrece limpieza semanal, Netflix compartido y bienvenida gourmet. Coste 110€/mes, ingreso adicional 180€/mes.</p>
            <blockquote>“Ahora siento que gestiono una comunidad, no solo habitaciones. Los inquilinos me envían un parte mensual y todo queda registrado.” — Ana, anfitriona MoOn Sevilla</blockquote>
            <p><a href="#" data-page-target="register" class="inline-block mt-8 rounded-full border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">Quiero replicar este modelo</a></p>
        `,
        author: 'Equipo Customer Success MoOn',
        author_image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-25T12:20:00Z'
    },
    {
        id: 7,
        slug: 'silver-cuidar-comunidad-y-salud',
        title: 'Silver: cómo cuidar tu salud y comunidad al compartir hogar después de los 60',
        excerpt: 'Plan integral de bienestar físico, emocional y financiero para convivencias Silver que desean vivir con tranquilidad.',
        image_url: BLOG_IMAGE_URLS.silver[0],
        content: `
            <p>Compartir hogar a partir de los 60 es una decisión estratégica. Ahorra, disminuye la soledad y mantiene tu autonomía. Este plan te guía paso a paso.</p>
            <h2>1. Mapa de cuidado personal</h2>
            <p>Trabajamos contigo y, si quieres, con tu familia: medicación, rutinas médicas, movilidad, alimentación y apoyo emocional.</p>
            <h2>2. Protocolos de acompañamiento</h2>
            <p>Establecemos números de emergencia, turnos de compra, asistencia vecinal y un circuito rápido con cuidadores profesionales aliados.</p>
            <h2>3. Bienestar emocional</h2>
            <p>Incluye círculos de escucha, actividades semanales y calendario de celebraciones. La felicidad también se planifica.</p>
            <h2>4. Seguridad jurídica</h2>
            <p>Contratos MoOn Silver recogen reparto de gastos, derechos de uso y protocolos ante hospitalizaciones, siempre con asesoría legal especializada.</p>
            <p><a href="#" data-page-target="silver" class="inline-block mt-8 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-6 py-3 font-semibold text-slate-900">Solicitar acompañamiento Silver</a></p>
        `,
        author: 'Elena Morales · Programa Silver',
        author_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-21T15:00:00Z'
    },
    {
        id: 8,
        slug: 'transforma-tu-vivienda-silver-paso-a-paso',
        title: 'Transforma tu vivienda en un hogar Silver acogedor y accesible en 15 días',
        excerpt: 'Checklist de adaptaciones sencillas para compartir tu casa con otras personas Silver manteniendo estilo y seguridad.',
        image_url: BLOG_IMAGE_URLS.silver[1],
        content: `
            <p>Pequeños cambios generan grandes impactos. Estas adaptaciones convierten tu casa en un hogar apto para compartir con tranquilidad.</p>
            <h2>1. Accesibilidad amable</h2>
            <ul>
                <li>Barras de apoyo en baño y ducha antideslizante.</li>
                <li>Iluminación con sensores en pasillos y escaleras.</li>
                <li>Interruptores y enchufes a 90 cm del suelo.</li>
            </ul>
            <h2>2. Zonas comunes que invitan a convivir</h2>
            <p>Mesas redondas para facilitar conversación, sillones con apoyabrazos firmes y textiles cálidos. Añade rincones verdes con plantas de fácil mantenimiento.</p>
            <h2>3. Habitaciones con privacidad garantizada</h2>
            <p>Asegura aislamiento acústico con burletes, cortinas opacas y luz regulable. Cada persona necesita un espacio propio para descansar.</p>
            <h2>4. Tecnología amiga</h2>
            <p>Instala timbres inteligentes, asistentes de voz y sensores de fuga de agua conectados a la app de seguimiento MoOn Silver.</p>
            <p><a href="#" data-page-target="silver" class="inline-block mt-8 rounded-full border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">Pedir diagnóstico de vivienda</a></p>
        `,
        author: 'Núria Pons · Arquitecta colaboradora',
        author_image_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-23T16:25:00Z'
    },
    {
        id: 9,
        slug: 'silver-familias-y-cohabitar-con-tranquilidad',
        title: 'Cómo conversar con tu familia sobre compartir hogar Silver y dar el paso con serenidad',
        excerpt: 'Guía emocional y práctica para explicar a hij@s y seres queridos que compartir casa es una decisión consciente y segura.',
        image_url: BLOG_IMAGE_URLS.silver[2],
        content: `
            <p>Decidir compartir hogar a los 60+ implica a tu círculo cercano. Esta guía te ayuda a comunicarlo con claridad, seguridad y entusiasmo.</p>
            <h2>1. Cuéntales el “por qué”</h2>
            <p>Habla de tu deseo de seguir en tu barrio, mantener tu independencia y ganar compañía. Comparte datos: convivencias Silver reducen la soledad un 68% según nuestros estudios internos.</p>
            <h2>2. Presenta el plan MoOn</h2>
            <p>Muestra el informe de compatibilidad, el contrato, el plan financiero y el seguimiento que hace nuestro equipo. Transparencia genera confianza.</p>
            <h2>3. Involucra a la familia en la visita</h2>
            <p>Pueden asistir a la visita virtual, conocer al equipo Silver y hacer preguntas. Así se sienten parte del proceso.</p>
            <h2>4. Define un canal de comunicación</h2>
            <p>Crea un grupo con familiares y equipo MoOn para compartir novedades y alertas. Mantiene la calma y evita malentendidos.</p>
            <blockquote>“Mis hijas estaban nerviosas, pero al conocer al equipo Silver y ver el plan de cuidados se quedaron tranquilas.” — Carmen, 67 años, Silver en Madrid</blockquote>
            <p><a href="#" data-page-target="silver" class="inline-block mt-8 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-6 py-3 font-semibold text-slate-900">Reservar llamada de escucha</a></p>
        `,
        author: 'Equipo de Mediación Familiar MoOn',
        author_image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        publish_date: '2025-02-26T09:55:00Z'
    },
];

export const MOCK_MATCHES: {[key: string]: string[]} = {
    // Note: These UUIDs should correspond to the demo users inserted via SQL script.
    '8a65e909-7a54-4e81-872f-488f5f1a3ba2': ['1b8e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a3b', '4d4e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a4d'],
    '1b8e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a3b': ['8a65e909-7a54-4e81-872f-488f5f1a3ba2'],
    '4d4e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a4d': ['8a65e909-7a54-4e81-872f-488f5f1a3ba2'],
    '5e5e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a5e': [],
};
