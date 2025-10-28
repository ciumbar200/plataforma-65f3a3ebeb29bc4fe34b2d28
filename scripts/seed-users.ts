import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvFiles() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = resolve(process.cwd(), file);
    if (!existsSync(fullPath)) continue;
    const contents = readFileSync(fullPath, 'utf8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFiles();

type RentalGoal =
  | 'FIND_ROOMMATES_AND_APARTMENT'
  | 'FIND_ROOM_WITH_ROOMMATES'
  | 'BOTH';

type NoiseLevel = 'Bajo' | 'Medio' | 'Alto';

type VerificationStatus = 'none' | 'pending' | 'approved';
type VerificationType = 'identity' | 'property' | null;

type SeedUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  age: number;
  role: 'INQUILINO' | 'PROPIETARIO';
  avatar_url: string;
  rental_goal: RentalGoal;
  city: string;
  locality: string;
  bio: string;
  interests: string[];
  lifestyle: string[];
  noise_level: NoiseLevel;
  budget: number;
  phone: string;
  birth_country: string;
  sexual_orientation: string;
  religion: string;
  video_url: string;
  verification_status: VerificationStatus;
  verification_type: VerificationType;
  is_verified: boolean;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const DEFAULT_PASSWORD = 'MoonDemo123!';

const seedUsers: SeedUser[] = [
  {
    id: '037af234-0b92-424a-be75-38e1a3210448',
    email: 'laura.gomez@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Laura Gómez',
    age: 29,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/36.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Madrid',
    locality: 'Lavapiés',
    bio: 'Investigadora en energías renovables, amante del cine alternativo y del urbanismo sostenible.',
    interests: ['cine independiente', 'ciclismo urbano', 'yoga'],
    lifestyle: ['Veggie', 'Madrugadora'],
    noise_level: 'Bajo',
    budget: 760,
    phone: '+34 611 234 567',
    birth_country: 'España',
    sexual_orientation: 'Bisexual',
    religion: 'Agnóstica',
    video_url: 'https://youtu.be/oq1Rcb3QfQ0',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: 'e2dcb62e-471a-4b80-bc14-f7579ad43963',
    email: 'mateo.aguilar@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Mateo Aguilar',
    age: 33,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/men/37.jpg',
    rental_goal: 'FIND_ROOMMATES_AND_APARTMENT',
    city: 'Barcelona',
    locality: 'Gràcia',
    bio: 'Product designer que disfruta cocinar con ingredientes locales y organizar cenas temáticas.',
    interests: ['cocina creativa', 'escapadas de montaña', 'diseño'],
    lifestyle: ['Teletrabajo', 'Noctámbulo'],
    noise_level: 'Medio',
    budget: 910,
    phone: '+34 622 987 654',
    birth_country: 'España',
    sexual_orientation: 'Heterosexual',
    religion: 'Católica',
    video_url: 'https://youtu.be/V6y1X3T0F80',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: '72f57df9-b872-4fd0-8e08-9b865f5e2c8b',
    email: 'sofia.villalba@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Sofía Villalba',
    age: 27,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/12.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Valencia',
    locality: 'Ruzafa',
    bio: 'Periodista cultural que escribe sobre arte urbano y festivales mediterráneos.',
    interests: ['fotografía', 'arte urbano', 'running'],
    lifestyle: ['Pet-friendly', 'Minimalista'],
    noise_level: 'Bajo',
    budget: 740,
    phone: '+34 633 765 432',
    birth_country: 'España',
    sexual_orientation: 'Lesbiana',
    religion: 'Atea',
    video_url: 'https://youtu.be/jy0mVkl6iOE',
    verification_status: 'pending',
    verification_type: 'identity',
    is_verified: false,
  },
  {
    id: '2b56e621-717b-4789-b644-bb6f99086d6c',
    email: 'andres.cortes@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Andrés Cortés',
    age: 35,
    role: 'PROPIETARIO',
    avatar_url: 'https://randomuser.me/api/portraits/men/15.jpg',
    rental_goal: 'BOTH',
    city: 'Sevilla',
    locality: 'Triana',
    bio: 'Propietario que busca inquilinos responsables para un dúplex con terraza comunitaria.',
    interests: ['flamenco', 'gastronomía', 'senderismo'],
    lifestyle: ['No fumador', 'Flexible'],
    noise_level: 'Medio',
    budget: 1450,
    phone: '+34 644 556 778',
    birth_country: 'España',
    sexual_orientation: 'Heterosexual',
    religion: 'Católica',
    video_url: 'https://youtu.be/qMEY0S8mGoc',
    verification_status: 'approved',
    verification_type: 'property',
    is_verified: true,
  },
  {
    id: 'a2ad3e79-79ba-48bf-97e9-0b2238d62a8a',
    email: 'camila.freire@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Camila Freire',
    age: 31,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/68.jpg',
    rental_goal: 'FIND_ROOMMATES_AND_APARTMENT',
    city: 'Bilbao',
    locality: 'Indautxu',
    bio: 'Ingeniera ambiental brasileña afincada en Euskadi, fan de la escalada y el pintxo-pote.',
    interests: ['escalada', 'cerveza artesana', 'jardinería'],
    lifestyle: ['Zero waste', 'Madrugadora'],
    noise_level: 'Medio',
    budget: 880,
    phone: '+34 655 112 908',
    birth_country: 'Brasil',
    sexual_orientation: 'Pansexual',
    religion: 'Espiritual',
    video_url: 'https://youtu.be/2W2n9nWdDqY',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: '700b0164-b99e-4f25-a9dd-68e9d1b15563',
    email: 'diego.herrera@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Diego Herrera',
    age: 28,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/men/41.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Zaragoza',
    locality: 'Casco Viejo',
    bio: 'Desarrollador backend que colecciona vinilos y organiza torneos de ajedrez en cafeterías locales.',
    interests: ['tecnología', 'vinilos', 'ajedrez'],
    lifestyle: ['Gamer', 'Cocina en casa'],
    noise_level: 'Bajo',
    budget: 660,
    phone: '+34 666 908 712',
    birth_country: 'España',
    sexual_orientation: 'Heterosexual',
    religion: 'Atea',
    video_url: 'https://youtu.be/J2Bwz0Z3xZ8',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: 'fab105a8-1fa0-4b44-8e38-924f4f1812ff',
    email: 'irene.narvaez@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Irene Narváez',
    age: 30,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/22.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Málaga',
    locality: 'Soho',
    bio: 'Community manager para marcas de moda sostenible. Busca compartir piso con gente creativa.',
    interests: ['moda sostenible', 'pilates', 'fotografía analógica'],
    lifestyle: ['Flexitariana', 'No fumadora'],
    noise_level: 'Medio',
    budget: 705,
    phone: '+34 677 321 444',
    birth_country: 'España',
    sexual_orientation: 'Bisexual',
    religion: 'Espiritual',
    video_url: 'https://youtu.be/8qUeQ6XuZ_s',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: 'ad5c6e16-a967-474b-9855-9682403fd553',
    email: 'hector.lamas@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Héctor Lamas',
    age: 41,
    role: 'PROPIETARIO',
    avatar_url: 'https://randomuser.me/api/portraits/men/26.jpg',
    rental_goal: 'BOTH',
    city: 'Palma',
    locality: 'Santa Catalina',
    bio: 'Arquitecto con ático reformado cerca del mercado. Busca inquilinos que valoren la convivencia responsable.',
    interests: ['vela', 'arquitectura', 'cocina mediterránea'],
    lifestyle: ['Pet-friendly', 'Ordenado'],
    noise_level: 'Bajo',
    budget: 1320,
    phone: '+34 688 990 221',
    birth_country: 'España',
    sexual_orientation: 'Heterosexual',
    religion: 'Católica',
    video_url: 'https://youtu.be/8r2yQvZ1VOg',
    verification_status: 'approved',
    verification_type: 'property',
    is_verified: true,
  },
  {
    id: 'b7b01edf-4212-415f-83a2-1ecef25b74e7',
    email: 'nerea.salvat@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Nerea Salvat',
    age: 26,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/33.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Granada',
    locality: 'Albaicín',
    bio: 'Estudiante de máster en musicología. Comparte playlists infinitas y hace repostería sin gluten.',
    interests: ['música clásica', 'repostería', 'senderismo'],
    lifestyle: ['Sin gluten', 'Estudia en casa'],
    noise_level: 'Bajo',
    budget: 540,
    phone: '+34 699 210 345',
    birth_country: 'España',
    sexual_orientation: 'Bisexual',
    religion: 'Católica',
    video_url: 'https://youtu.be/3S07oB9S6G4',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: '20fa5dfc-9d4b-4bf7-a9d3-514bad9f807a',
    email: 'javier.ochoa@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Javier Ochoa',
    age: 37,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/men/55.jpg',
    rental_goal: 'FIND_ROOMMATES_AND_APARTMENT',
    city: 'Donostia',
    locality: 'Gros',
    bio: 'Surfista y UX researcher que teletrabaja desde coworkings frente a la Zurriola.',
    interests: ['surf', 'analítica', 'cafés de especialidad'],
    lifestyle: ['Teletrabajo', 'Deportista'],
    noise_level: 'Medio',
    budget: 965,
    phone: '+34 612 445 908',
    birth_country: 'España',
    sexual_orientation: 'Gay',
    religion: 'Atea',
    video_url: 'https://youtu.be/9qk1X6APmFM',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: '7130d95a-f094-4aec-8b3f-a93cc0fe7fe4',
    email: 'elena.pastor@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Elena Pastor',
    age: 32,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/48.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Alicante',
    locality: 'Centro',
    bio: 'Enfermera que rota entre turnos hospitalarios, busca un hogar tranquilo y organizado.',
    interests: ['senderismo costero', 'podcasts de salud', 'cerámica'],
    lifestyle: ['Madrugadora', 'Ordenada'],
    noise_level: 'Bajo',
    budget: 630,
    phone: '+34 688 110 904',
    birth_country: 'España',
    sexual_orientation: 'Heterosexual',
    religion: 'Agnóstica',
    video_url: 'https://youtu.be/1gw6N42fh3Q',
    verification_status: 'pending',
    verification_type: 'identity',
    is_verified: false,
  },
  {
    id: 'dae1158f-5b1d-4f7a-8ba3-1dd133467af5',
    email: 'luis.ferreyra@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Luis Ferreyra',
    age: 29,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/men/29.jpg',
    rental_goal: 'FIND_ROOMMATES_AND_APARTMENT',
    city: 'Murcia',
    locality: 'Santa Eulalia',
    bio: 'Chef argentino especializado en cocina nikkei. Quiere compartir piso con amantes del buen comer.',
    interests: ['cocina fusión', 'running', 'videojuegos cooperativos'],
    lifestyle: ['Noctámbulo', 'Cocina en casa'],
    noise_level: 'Alto',
    budget: 690,
    phone: '+34 697 330 118',
    birth_country: 'Argentina',
    sexual_orientation: 'Heterosexual',
    religion: 'Atea',
    video_url: 'https://youtu.be/kAY4L-acTrU',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: 'e6c7752e-2709-4266-892c-82d91eec9fc2',
    email: 'claudia.barreiro@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Claudia Barreiro',
    age: 34,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/15.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'A Coruña',
    locality: 'Orzán',
    bio: 'Ilustradora freelance que da talleres de acuarela en su estudio compartido.',
    interests: ['acuarela', 'patinaje', 'series nórdicas'],
    lifestyle: ['Teletrabajo', 'Pet-friendly'],
    noise_level: 'Medio',
    budget: 675,
    phone: '+34 671 220 934',
    birth_country: 'España',
    sexual_orientation: 'Bisexual',
    religion: 'Agnóstica',
    video_url: 'https://youtu.be/cB78dWEiFoI',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: 'c97b5c78-b074-440d-a74f-f8f02259f1d5',
    email: 'gael.dupont@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Gaël Dupont',
    age: 36,
    role: 'PROPIETARIO',
    avatar_url: 'https://randomuser.me/api/portraits/men/54.jpg',
    rental_goal: 'BOTH',
    city: 'Oviedo',
    locality: 'Teatinos',
    bio: 'Profesor de francés con vivienda amplia cerca de la universidad. Prefiere perfiles internacionales.',
    interests: ['literatura', 'ciclismo', 'quesos artesanos'],
    lifestyle: ['Pet-friendly', 'No fumador'],
    noise_level: 'Bajo',
    budget: 1280,
    phone: '+34 690 887 332',
    birth_country: 'Francia',
    sexual_orientation: 'Gay',
    religion: 'Católica',
    video_url: 'https://youtu.be/2mfYg4iAfD0',
    verification_status: 'approved',
    verification_type: 'property',
    is_verified: true,
  },
  {
    id: '18230f82-955a-4632-92fb-1d8af09d4616',
    email: 'patricia.leon@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Patricia León',
    age: 38,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/61.jpg',
    rental_goal: 'FIND_ROOMMATES_AND_APARTMENT',
    city: 'Salamanca',
    locality: 'Centro',
    bio: 'Consultora de innovación social, suele viajar por proyectos pero quiere base estable.',
    interests: ['voluntariado', 'podcasts', 'teatro contemporáneo'],
    lifestyle: ['Madrugadora', 'Plant-based'],
    noise_level: 'Medio',
    budget: 845,
    phone: '+34 693 221 118',
    birth_country: 'España',
    sexual_orientation: 'Pansexual',
    religion: 'Budista',
    video_url: 'https://youtu.be/lEYV3na43Eo',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: 'd7932201-29c5-4e1f-98a2-2896b00bebf1',
    email: 'hassan.abidi@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Hassan Abidi',
    age: 42,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/men/62.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Cádiz',
    locality: 'La Viña',
    bio: 'Traductor árabe-español, amante de la gastronomía gaditana y del flamenco fusión.',
    interests: ['idiomas', 'gastronomía', 'fotografía callejera'],
    lifestyle: ['Halal', 'No fumador'],
    noise_level: 'Medio',
    budget: 575,
    phone: '+34 671 440 908',
    birth_country: 'Marruecos',
    sexual_orientation: 'Heterosexual',
    religion: 'Musulmana',
    video_url: 'https://youtu.be/5b3QO2ic4t0',
    verification_status: 'pending',
    verification_type: 'identity',
    is_verified: false,
  },
  {
    id: '25536923-4439-4258-9527-8c9a404ad107',
    email: 'mireia.vidal@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Mireia Vidal',
    age: 25,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/26.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Valladolid',
    locality: 'Parquesol',
    bio: 'Desarrolladora de videojuegos indie. Busca un piso luminoso donde pueda grabar streams ocasionales.',
    interests: ['videojuegos', 'streaming', 'cosplay'],
    lifestyle: ['Gamer', 'Noctámbula'],
    noise_level: 'Alto',
    budget: 595,
    phone: '+34 699 334 211',
    birth_country: 'España',
    sexual_orientation: 'Bisexual',
    religion: 'Atea',
    video_url: 'https://youtu.be/QiAlRDW2L6Q',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: '025595c7-1f9f-443b-a98a-880f759af8a8',
    email: 'oscar.figueroa@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Óscar Figueroa',
    age: 39,
    role: 'PROPIETARIO',
    avatar_url: 'https://randomuser.me/api/portraits/men/11.jpg',
    rental_goal: 'BOTH',
    city: 'Córdoba',
    locality: 'Judería',
    bio: 'Propietario de un edificio histórico renovado, ideal para perfiles profesionales que valoren el patrimonio.',
    interests: ['historia', 'vino', 'jardinería'],
    lifestyle: ['No fumador', 'Ordenado'],
    noise_level: 'Bajo',
    budget: 1390,
    phone: '+34 688 775 101',
    birth_country: 'España',
    sexual_orientation: 'Heterosexual',
    religion: 'Católica',
    video_url: 'https://youtu.be/IGYQj9zp1TM',
    verification_status: 'approved',
    verification_type: 'property',
    is_verified: true,
  },
  {
    id: 'bf2c6329-d0bc-48ed-9628-68811e7a12d6',
    email: 'ariadna.costa@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Ariadna Costa',
    age: 28,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/women/72.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Madrid',
    locality: 'Chamberí',
    bio: 'Analista de datos en fintech. Practica escalada indoor y busca ambiente tranquilo pero social.',
    interests: ['datos', 'escalada', 'club de lectura'],
    lifestyle: ['Teletrabajo parcial', 'Comida casera'],
    noise_level: 'Medio',
    budget: 865,
    phone: '+34 612 880 443',
    birth_country: 'Portugal',
    sexual_orientation: 'Pansexual',
    religion: 'Agnóstica',
    video_url: 'https://youtu.be/U4-9PnCizE8',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
  {
    id: '8dab9152-08a7-4147-ba8e-61f99848c2a9',
    email: 'ricardo.mendez@example.com',
    password: DEFAULT_PASSWORD,
    name: 'Ricardo Méndez',
    age: 44,
    role: 'INQUILINO',
    avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    rental_goal: 'FIND_ROOM_WITH_ROOMMATES',
    city: 'Barcelona',
    locality: 'Poblenou',
    bio: 'Coach de bienestar y meditador. Facilita sesiones de mindfulness para sus compis de piso.',
    interests: ['meditación', 'cocina vegana', 'bike to work'],
    lifestyle: ['Vegano', 'Madrugador'],
    noise_level: 'Bajo',
    budget: 920,
    phone: '+34 699 008 765',
    birth_country: 'México',
    sexual_orientation: 'Gay',
    religion: 'Budista',
    video_url: 'https://youtu.be/0O1OrTcfqBI',
    verification_status: 'none',
    verification_type: null,
    is_verified: false,
  },
];

async function upsertUser(user: SeedUser) {
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error(`Error comprobando perfil ${user.email}:`, profileError);
    return;
  }

  if (!existingProfile) {
    const { error: createError } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        age: user.age,
        role: user.role,
        avatar_url: user.avatar_url,
        rental_goal: user.rental_goal,
        city: user.city,
        locality: user.locality,
      },
    });

    if (createError) {
      if ('status' in createError && createError.status === 422) {
        console.warn(`El usuario ${user.email} ya existía en auth.`);
      } else {
        console.error(`Error creando usuario auth ${user.email}:`, createError);
        return;
      }
    } else {
      console.log(`Usuario auth creado: ${user.email}`);
    }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role,
      avatar_url: user.avatar_url,
      rental_goal: user.rental_goal,
      city: user.city,
      locality: user.locality,
      bio: user.bio,
      interests: user.interests,
      lifestyle: user.lifestyle,
      noise_level: user.noise_level,
      budget: user.budget,
      phone: user.phone,
      birth_country: user.birth_country,
      sexual_orientation: user.sexual_orientation,
      religion: user.religion,
      video_url: user.video_url,
      is_profile_complete: true,
      verification_status: user.verification_status,
      verification_type: user.verification_type,
      is_verified: user.is_verified,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error(`Error actualizando perfil ${user.email}:`, updateError);
  } else {
    console.log(`Perfil listo: ${user.email}`);
  }
}

async function main() {
  for (const user of seedUsers) {
    await upsertUser(user);
  }
  console.log('Seed completado.');
}

main()
  .catch((error) => {
    console.error('Error general durante el seed:', error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
