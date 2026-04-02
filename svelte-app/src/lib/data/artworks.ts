import allArtworks from './artworks/index';

export const artworks = allArtworks;
export const countries = [...new Set(artworks.map((a) => a.country))];
