import { User, UserRole, Property, RentalGoal } from '../types';

const API_BASE = import.meta.env.VITE_FLUENTCRM_BASE_URL?.replace(/\/$/, '') ?? '';
const API_KEY = import.meta.env.VITE_FLUENTCRM_API_KEY;
const API_SECRET = import.meta.env.VITE_FLUENTCRM_API_SECRET;
const HASHED_WEBHOOK_URL = import.meta.env.VITE_FLUENTCRM_WEBHOOK_URL?.trim() ?? '';

const isRestConfigured = Boolean(API_BASE && API_KEY && API_SECRET);
const isHashedConfigured = Boolean(HASHED_WEBHOOK_URL);
const isConfigured = isRestConfigured || isHashedConfigured;

const buildUrl = (path: string, query: Record<string, string | number | undefined> = {}) => {
    const hasQuery = path.includes('?');
    const sep = hasQuery ? '&' : '?';
    const url = `${API_BASE}${path}${sep}api_key=${API_KEY}&api_secret=${API_SECRET}`;
    const extra = Object.entries(query).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
    return extra ? `${url}&${extra}` : url;
};

type FluentContactPayload = {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    address_line_1?: string;
    address_line_2?: string;
    postal_code?: string;
    status?: 'subscribed' | 'pending' | 'unsubscribed';
    tags?: string[];
    lists?: number[];
    custom_fields?: Record<string, string | number | undefined>;
    custom_values?: Record<string, string | number | undefined>;
    notes?: Array<{ title?: string; description: string }>;
};

const safeFetch = async (path: string, payload: FluentContactPayload) => {
    if (!isConfigured) {
        console.warn('[FluentCRM] Variables de entorno no configuradas. Omitiendo sincronización.');
        return;
    }

    const sendHashed = async () => {
        if (!isHashedConfigured) return;
        const basePayload: Record<string, unknown> = {
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
            status: payload.status ?? 'subscribed',
            phone: payload.phone,
            city: payload.city,
            state: payload.state,
            address_line_1: payload.address_line_1,
            address_line_2: payload.address_line_2,
            country: payload.country,
            postal_code: payload.postal_code,
        };

        if (payload.custom_fields) {
            const fieldsArray = Object.entries(payload.custom_fields)
                .filter(([, value]) => value !== undefined && value !== null)
                .map(([slug, value]) => ({ slug, value }));
            if (fieldsArray.length) {
                basePayload.custom_fields = fieldsArray;
            }
        }

        const hashedBody = {
            ...basePayload,
            tags: payload.tags ?? [],
            lists: payload.lists ?? [],
            notes: payload.notes ?? [],
        };

        try {
            const response = await fetch(HASHED_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(hashedBody),
            });
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('[FluentCRM] Error en webhook hash:', response.status, errorBody);
            }
        } catch (error) {
            console.error('[FluentCRM] Error de red (webhook hash):', (error as Error).message);
        }
    };

    const sendRest = async () => {
        if (!isRestConfigured) return;
        try {
            const response = await fetch(buildUrl(path), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('[FluentCRM] Error en la petición REST:', response.status, errorBody);
            }
        } catch (error) {
            console.error('[FluentCRM] Error de red (REST):', (error as Error).message);
        }
    };

    await Promise.all([sendHashed(), sendRest()]);
};

const parseName = (fullName?: string) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ');
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ');
    return { firstName, lastName };
};

const envOverride = (key: string, fallback: string) => {
    const raw = (import.meta.env as Record<string, string | undefined>)[key];
    return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : fallback;
};

const CUSTOM_FIELD_SLUGS = {
    city: envOverride('VITE_FLUENTCRM_FIELD_CITY', 'city'),
    locality: envOverride('VITE_FLUENTCRM_FIELD_LOCALITY', 'locality'),
    phone: envOverride('VITE_FLUENTCRM_FIELD_PHONE', 'phone'),
    birthCountry: envOverride('VITE_FLUENTCRM_FIELD_BIRTH_COUNTRY', 'birth_country'),
    budget: envOverride('VITE_FLUENTCRM_FIELD_BUDGET', 'budget'),
    rentalGoal: envOverride('VITE_FLUENTCRM_FIELD_RENTAL_GOAL', 'rental_goal'),
    lifestyle: envOverride('VITE_FLUENTCRM_FIELD_LIFESTYLE', 'lifestyle'),
    interests: envOverride('VITE_FLUENTCRM_FIELD_INTERESTS', 'interests'),
    religion: envOverride('VITE_FLUENTCRM_FIELD_RELIGION', 'religion'),
    sexualOrientation: envOverride('VITE_FLUENTCRM_FIELD_SEXUAL_ORIENTATION', 'sexual_orientation'),
    noiseLevel: envOverride('VITE_FLUENTCRM_FIELD_NOISE_LEVEL', 'noise_level'),
    role: envOverride('VITE_FLUENTCRM_FIELD_ROLE', 'role'),
    age: envOverride('VITE_FLUENTCRM_FIELD_AGE', 'age'),
    birthDate: envOverride('VITE_FLUENTCRM_FIELD_BIRTH_DATE', 'birth_date'),
};

const RENTAL_GOAL_HUMAN_LABEL: Record<RentalGoal, string> = {
    [RentalGoal.FIND_ROOMMATES_AND_APARTMENT]: 'Encontrar compañeros y piso',
    [RentalGoal.FIND_ROOM_WITH_ROOMMATES]: 'Encontrar habitación compartida',
    [RentalGoal.BOTH]: 'Ambas opciones',
};

const normaliseValue = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
        const filtered = value.map((item) => (item == null ? '' : String(item).trim())).filter(Boolean);
        return filtered.length ? filtered.join(' | ') : undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toString();
    }
    const stringValue = String(value).trim();
    return stringValue.length ? stringValue : undefined;
};

const buildCustomValues = (values: Record<string, unknown>) => {
    const entries = Object.entries(values)
        .map(([key, value]) => {
            const normalised = normaliseValue(value);
            if (normalised === undefined) return undefined;
            return [key, normalised] as [string, string];
        })
        .filter(Boolean) as Array<[string, string]>;

    return entries.length ? Object.fromEntries(entries) : undefined;
};

export const syncFluentContact = async (user: User) => {
    if (!user.email) return;

    const { firstName, lastName } = parseName(user.name);
    const defaultTags =
        user.role === UserRole.PROPIETARIO
            ? ['moon-propietario']
            : user.role === UserRole.INQUILINO
            ? ['moon-inquilino']
            : user.role === UserRole.ANFITRION
            ? ['moon-anfitrion']
            : [];

    const readableRentalGoal = user.rental_goal ? RENTAL_GOAL_HUMAN_LABEL[user.rental_goal] ?? user.rental_goal : undefined;

    const customValues = buildCustomValues({
        [CUSTOM_FIELD_SLUGS.city]: user.city,
        [CUSTOM_FIELD_SLUGS.locality]: user.locality,
        [CUSTOM_FIELD_SLUGS.phone]: user.phone,
        [CUSTOM_FIELD_SLUGS.birthCountry]: user.birth_country,
        [CUSTOM_FIELD_SLUGS.budget]: user.budget,
        [CUSTOM_FIELD_SLUGS.rentalGoal]: readableRentalGoal,
        [CUSTOM_FIELD_SLUGS.role]: user.role,
        [CUSTOM_FIELD_SLUGS.lifestyle]: user.lifestyle,
        [CUSTOM_FIELD_SLUGS.interests]: user.interests,
        [CUSTOM_FIELD_SLUGS.religion]: user.religion,
        [CUSTOM_FIELD_SLUGS.sexualOrientation]: user.sexual_orientation,
        [CUSTOM_FIELD_SLUGS.noiseLevel]: user.noise_level,
        [CUSTOM_FIELD_SLUGS.age]: user.age,
        [CUSTOM_FIELD_SLUGS.birthDate]: user.birth_date,
    });

    await safeFetch('/wp-json/fluent-crm/v2/contacts', {
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        phone: normaliseValue(user.phone),
        city: normaliseValue(user.city),
        state: normaliseValue(user.locality),
        status: 'subscribed',
        tags: defaultTags,
        custom_fields: customValues,
        custom_values: customValues,
    });
};

const buildPropertyUrl = (property: Property) => {
    if (typeof window === 'undefined') return property.id ? `/owners?property=${property.id}` : undefined;
    const url = new URL('/owners', window.location.origin);
    if (property.id) {
        url.searchParams.set('property', String(property.id));
    }
    return url.toString();
};

export const notifyFluentCrmNewProperty = async (
    user: User,
    property: Property,
    isFirstPublication: boolean
) => {
    if (!user.email) return;

    const customValues = buildCustomValues({
        propietario: user.name,
        last_listing_neighborhood: property.locality || property.city,
        last_listing_address: property.address || property.title,
        last_listing_price: property.price,
        last_listing_url: buildPropertyUrl(property),
        first_listing_published_at: isFirstPublication ? new Date().toISOString() : undefined,
    });

    await safeFetch('/wp-json/fluent-crm/v2/contacts', {
        email: user.email,
        tags: ['moon-propietario-activo'],
        custom_fields: customValues,
        custom_values: customValues,
        notes: [
            {
                title: 'Nueva propiedad publicada',
                description: [
                    property.title || property.address || 'Publicación sin título',
                    [property.city, property.locality].filter(Boolean).join(' · '),
                    property.price ? `Precio: ${property.price} €/mes` : undefined,
                ]
                    .filter(Boolean)
                    .join('\n'),
            },
        ],
    });
};

// Expose status so UIs can check configuration
export const fluentCrmStatus = { isRestConfigured, isHashedConfigured, isConfigured, API_BASE };

// Lightweight REST getters for admin UI
export async function fetchFluentTags() {
    if (!isRestConfigured) return [] as any[];
    try {
        const res = await fetch(buildUrl('/wp-json/fluent-crm/v2/tags'));
        if (!res.ok) return [] as any[];
        return await res.json();
    } catch { return [] as any[]; }
}

export async function fetchFluentLists() {
    if (!isRestConfigured) return [] as any[];
    try {
        const res = await fetch(buildUrl('/wp-json/fluent-crm/v2/lists'));
        if (!res.ok) return [] as any[];
        return await res.json();
    } catch { return [] as any[]; }
}

export async function fetchFluentSegments() {
    if (!isRestConfigured) return [] as any[];
    try {
        const res = await fetch(buildUrl('/wp-json/fluent-crm/v2/segments'));
        if (!res.ok) return [] as any[];
        return await res.json();
    } catch { return [] as any[]; }
}

export async function searchFluentContacts(query: string, page = 1, perPage = 20) {
    if (!isRestConfigured) return { data: [], total: 0 };
    try {
        const res = await fetch(buildUrl('/wp-json/fluent-crm/v2/contacts', { search: query, page, per_page: perPage }));
        if (!res.ok) return { data: [], total: 0 };
        const json = await res.json();
        // Some installs return { data, total, pagination }, others return array
        if (Array.isArray(json)) return { data: json, total: json.length };
        return { data: json.data || [], total: json.total || (json.pagination?.total || 0) };
    } catch { return { data: [], total: 0 }; }
}
