/** Lesson illustrations: one SVG per picture in src/assets/art, named by id. A card shows one with `art: '<id>'`. */
const files = import.meta.glob('../assets/art/*.svg', { query: '?url', import: 'default', eager: true });

export const artUrl = (id) => (id ? files[`../assets/art/${id}.svg`] ?? null : null);
