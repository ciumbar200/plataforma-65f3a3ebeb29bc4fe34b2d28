import {
  UserRole, RentalGoal, PropertyType, NotificationType
} from './types';
import type {
  User, Property, OwnerStats, Notification, SavedSearch, BlogPost
} from './types';

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
    { id: 1, slug: '5-consejos-para-una-convivencia-exitosa', title: '5 Consejos para una Convivencia Exitosa', excerpt: 'Descubre las claves para mantener la armonía en tu piso compartido. Desde la comunicación hasta la limpieza, te lo contamos todo.', image_url: getSupabaseUrl('property-media', 'blog01.webp'), content: '<h2>1. Comunicación Abierta y Honesta</h2><p>La base de cualquier buena relación, incluida la de compañeros de piso, es la comunicación...</p>', author: 'Laura Sánchez', author_image_url: getSupabaseUrl('avatars', 'author01.webp'), publish_date: '2024-07-15T12:00:00Z' },
];

export const MOCK_MATCHES: {[key: string]: string[]} = {
    // Note: These UUIDs should correspond to the demo users inserted via SQL script.
    '8a65e909-7a54-4e81-872f-488f5f1a3ba2': ['1b8e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a3b', '4d4e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a4d'],
    '1b8e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a3b': ['8a65e909-7a54-4e81-872f-488f5f1a3ba2'],
    '4d4e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a4d': ['8a65e909-7a54-4e81-872f-488f5f1a3ba2'],
    '5e5e8a6a-3e4b-4b1a-9f5a-3e1b3a3b3a5e': [],
};