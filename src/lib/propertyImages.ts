import type { Property } from '../types';

const COZY_PROPERTY_GALLERIES: string[][] = [
    [
        'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1522156373667-4c7234bbd804?auto=format&fit=crop&w=1600&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1505692794403-35fabe6a8e03?auto=format&fit=crop&w=1600&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1600&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1505693539372-01dd77cac1dc?auto=format&fit=crop&w=1600&q=80'
    ]
];

const deriveIndex = (property: Property): number => {
    if (typeof property.id === 'number' && Number.isFinite(property.id)) {
        return Math.abs(property.id);
    }

    if (property.title) {
        return Math.abs(
            Array.from(property.title).reduce((acc, char) => acc + char.charCodeAt(0), 0)
        );
    }

    return 0;
};

export const getCozyGallery = (property: Property): string[] => {
    const index = deriveIndex(property) % COZY_PROPERTY_GALLERIES.length;
    return COZY_PROPERTY_GALLERIES[index];
};

export const getCozyCoverImage = (property: Property): string => {
    const gallery = getCozyGallery(property);
    return gallery[0];
};
