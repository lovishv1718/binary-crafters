// Default photography from Unsplash (free for commercial use, no attribution required).
// Each one can be replaced from Admin → Site settings → Photos.
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=75`

export const stockPhotos = {
  hero: { src: u('1582005450386-52b25f82d9bb'), alt: 'Team working together on laptops in a bright office' },
  about: { src: u('1758873272540-439a105db676'), alt: 'Two strategists planning a campaign on a chalkboard wall' },
  meeting: { src: u('1571826945830-5423b80a986c'), alt: 'Client meeting around a table with laptops' },
}
