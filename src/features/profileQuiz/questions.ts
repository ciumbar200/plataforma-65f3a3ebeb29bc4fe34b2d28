export type QuizOption = {
  id: string;
  label: string;
  helper?: string;
  personaTags: string[];
};

export type QuizQuestion = {
  id: string;
  title: string;
  description: string;
  image: string;
  options: QuizOption[];
};

export const QUIZ_VERSION = 'v1';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'wake-up',
    title: '¿Cómo empieza tu mañana perfecta?',
    description: 'Tu ritmo matutino marca la armonía con tus compis.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'sunrise-yoga', label: 'Despierto pronto, me gusta sentir la casa tranquila', helper: '6:30-7:00, café y silencio', personaTags: ['madrugador', 'calma'] },
      { id: 'breakfast-chat', label: 'Me gusta desayunar charlando con quien coincida', personaTags: ['social', 'madrugador'] },
      { id: 'just-in-time', label: 'Me levanto lo justo para salir, necesito agilidad', personaTags: ['practico', 'independiente'] },
      { id: 'night-owl', label: 'Prefiero dormir hasta tarde, rindo más de noche', personaTags: ['nocturno', 'creativo'] },
    ],
  },
  {
    id: 'work-style',
    title: '¿Cuál describe mejor tu forma de trabajar o estudiar?',
    description: 'Así sabremos cómo equilibrar espacios y ruidos.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'remote-focus', label: 'Teletrabajo a diario desde casa', personaTags: ['teletrabajo', 'estructura'] },
      { id: 'hybrid', label: 'Combino oficina y casa según el día', personaTags: ['equilibrio', 'flexible'] },
      { id: 'outdoor', label: 'Paso casi todo el día fuera', personaTags: ['callejero', 'social'] },
      { id: 'creative-projects', label: 'Proyectos creativos con horarios variables', personaTags: ['creativo', 'nocturno'] },
    ],
  },
  {
    id: 'cleaning',
    title: '¿Cómo organizas las tareas de casa?',
    description: 'Pequeños hábitos hacen una convivencia redonda.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'schedule', label: 'Prefiero un calendario fijo para limpiar', personaTags: ['organizado', 'calma'] },
      { id: 'rotation', label: 'Alternamos según disponemos y hablamos', personaTags: ['dialogo', 'equilibrio'] },
      { id: 'professional', label: 'Pago limpieza externa y lo dividimos', personaTags: ['practico', 'premium'] },
      { id: 'spontaneous', label: 'Cada cual se ocupa cuando hace falta', personaTags: ['relajado', 'flexible'] },
    ],
  },
  {
    id: 'guests',
    title: 'Cuando vienen visitas…',
    description: 'Define límites claros sin perder la chispa social.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'planned-dinners', label: 'Me encanta organizar cenas y avisar con tiempo', personaTags: ['social', 'anfitrion'] },
      { id: 'spontaneous', label: 'No me importa improvisar visitas puntuales', personaTags: ['espontaneo', 'flexible'] },
      { id: 'limited-weekends', label: 'Solo fines de semana y cortas', personaTags: ['estructura', 'calma'] },
      { id: 'intimate', label: 'Prefiero la casa tranquila, sin visitas', personaTags: ['introvertido', 'calma'] },
    ],
  },
  {
    id: 'shared-meals',
    title: '¿Cómo te relacionas con la cocina compartida?',
    description: 'Cenar juntos une, pero también suma orden.',
    image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'cook-together', label: 'Me gusta cocinar en equipo varias veces por semana', personaTags: ['social', 'foodie'] },
      { id: 'share-basics', label: 'Compartimos básicos, cada quien su menú', personaTags: ['equilibrio', 'practico'] },
      { id: 'meal-prep', label: 'Cocino en bloque, necesito espacio y horario', personaTags: ['organizado', 'estructura'] },
      { id: 'minimalist', label: 'Uso la cocina poco, prefiero sencillez', personaTags: ['minimalista', 'calma'] },
    ],
  },
  {
    id: 'noise',
    title: '¿Qué nivel de ruido te hace sentir en casa?',
    description: 'Ajustemos la energía para que todos sumen.',
    image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'whisper', label: 'Muy tranquilo, casi silencio', personaTags: ['calma', 'lectura'] },
      { id: 'soft-music', label: 'Música suave y voces bajas', personaTags: ['equilibrio', 'creativo'] },
      { id: 'buzz', label: 'Conversaciones, playlists y movimiento', personaTags: ['social', 'vibrante'] },
      { id: 'party', label: 'Me va la energía alta y eventos frecuentes', personaTags: ['fiestero', 'extrovertido'] },
    ],
  },
  {
    id: 'weekend',
    title: 'Tu plan ideal de fin de semana en casa…',
    description: 'Así equilibramos descanso y movimiento.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'slow-brunch', label: 'Brunch casero y peli en el sofá', personaTags: ['calma', 'foodie'] },
      { id: 'city-out', label: 'Uso la casa poco, vivo la ciudad', personaTags: ['callejero', 'extrovertido'] },
      { id: 'creative-projects', label: 'Proyectos DIY, música, arte', personaTags: ['creativo', 'maker'] },
      { id: 'hosting', label: 'Me encanta recibir amigos', personaTags: ['anfitrion', 'social'] },
    ],
  },
  {
    id: 'budget',
    title: 'Con los gastos comunes…',
    description: 'Justicia y claridad para evitar sorpresas.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'split-equally', label: 'Todo a partes iguales, sin líos', personaTags: ['equilibrio', 'estructura'] },
      { id: 'pay-as-you-go', label: 'Cada quien paga lo que consume', personaTags: ['practico', 'detallista'] },
      { id: 'shared-pot', label: 'Creamos una cuenta común y la revisamos', personaTags: ['organizado', 'colaborativo'] },
      { id: 'outsourcing', label: 'Prefiero apps o servicios que lo gestionen', personaTags: ['tecnologico', 'premium'] },
    ],
  },
  {
    id: 'hygge',
    title: '¿Qué ambiente quieres sentir al volver a casa?',
    description: 'La vibra lo es todo para sentirse en tribu.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'peaceful', label: 'Sereno, ordenado, con espacios personales', personaTags: ['calma', 'organizado'] },
      { id: 'lively', label: 'Animado, gente entrando y saliendo', personaTags: ['social', 'extrovertido'] },
      { id: 'creative-hub', label: 'Inspirador, con arte y música', personaTags: ['creativo', 'maker'] },
      { id: 'eco', label: 'Natural, plantas, sostenibilidad', personaTags: ['eco', 'conciencia'] },
    ],
  },
  {
    id: 'conflict',
    title: 'Si hay un roce en la convivencia…',
    description: 'La forma de gestionar conflictos define la armonía.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'talk-now', label: 'Prefiero hablarlo enseguida con calma', personaTags: ['dialogo', 'calma'] },
      { id: 'schedule-chat', label: 'Agendamos un momento para revisarlo', personaTags: ['estructura', 'equilibrio'] },
      { id: 'mediator', label: 'Busco un tercero neutral si hace falta', personaTags: ['colaborativo', 'empatico'] },
      { id: 'space-first', label: 'Necesito mi espacio antes de hablar', personaTags: ['introvertido', 'reflexivo'] },
    ],
  },
  {
    id: 'sharing',
    title: '¿Qué tan abierto estás a compartir?',
    description: 'Define tus límites sin perder la cohesión.',
    image: 'https://images.unsplash.com/photo-1453169889337-8d8b176d9fa0?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'all-in', label: 'Compartimos desde libros a utensilios', personaTags: ['colaborativo', 'social'] },
      { id: 'case-by-case', label: 'Depende, prefiero preguntar antes', personaTags: ['equilibrio', 'dialogo'] },
      { id: 'personal', label: 'Cada quien sus cosas, prefiero orden', personaTags: ['organizado', 'limite'] },
      { id: 'minimal-share', label: 'Uso lo mío y no pido prestado', personaTags: ['independiente', 'calma'] },
    ],
  },
  {
    id: 'pets',
    title: '¿Cómo te llevas con las mascotas en casa?',
    description: 'Los peludos también son parte de la convivencia.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'pet-lover', label: '¡Me encantan! Felices convivimos', personaTags: ['petfriendly', 'empatico'] },
      { id: 'open-to-cats', label: 'Ok con gatos, soy alérgic@ a perros', personaTags: ['equilibrio', 'salud'] },
      { id: 'one-pet', label: 'Solo una mascota, con reglas claras', personaTags: ['estructura', 'orden'] },
      { id: 'no-pets', label: 'Prefiero un hogar sin mascotas', personaTags: ['calma', 'minimalista'] },
    ],
  },
  {
    id: 'wellbeing',
    title: 'Tu manera de cuidar tu bienestar…',
    description: 'Hábitos compatibles sostienen el ritmo.',
    image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'active', label: 'Entreno en casa o al aire libre varias veces', personaTags: ['deportista', 'salud'] },
      { id: 'mindful', label: 'Meditación, yoga, espacios tranquilos', personaTags: ['calma', 'mindful'] },
      { id: 'balanced', label: 'Algo de deporte, algo de ocio social', personaTags: ['equilibrio', 'social'] },
      { id: 'slow', label: 'Disfruto descansar sin grandes rutinas', personaTags: ['relajado', 'calma'] },
    ],
  },
  {
    id: 'community',
    title: '¿Qué quieres aportar a tu tribu MoOn?',
    description: 'Más que convivir, construiréis hogar.',
    image: 'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'mentor', label: 'Mentoría y apoyo emocional', personaTags: ['empatico', 'mentor'] },
      { id: 'connector', label: 'Conecto planes y amistades', personaTags: ['conector', 'social'] },
      { id: 'caretaker', label: 'Cuido detalles del hogar', personaTags: ['organizado', 'anfitrion'] },
      { id: 'explorer', label: 'Traigo experiencias nuevas y cultura', personaTags: ['explorador', 'creativo'] },
    ],
  },
  {
    id: 'future',
    title: 'En un año te gustaría decir…',
    description: 'Define tu meta para que la casa te acompañe.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    options: [
      { id: 'stable-home', label: 'Encontré un hogar estable y armonioso', personaTags: ['calma', 'estructura'] },
      { id: 'new-family', label: 'Tengo una pequeña familia elegida', personaTags: ['social', 'empatico'] },
      { id: 'growth', label: 'Impulsé mis proyectos personales', personaTags: ['creativo', 'emprendedor'] },
      { id: 'adventure', label: 'Viví experiencias nuevas e inolvidables', personaTags: ['explorador', 'extrovertido'] },
    ],
  },
];
