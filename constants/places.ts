const kosovoCities = ['Prishtina', 'Prizren', 'Ferizaj', 'Peja', 'Gjakova', 'Gjilan', 'Mitrovica', 'Vushtrri', 'Podujeva', 'Drenas', 'Other'] as const;
const albaniaCities = ['Tirana', 'Durres', 'Vlore', 'Shkoder', 'Elbasan', 'Fier', 'Korce', 'Berat'] as const;
const macedoniaCities = ['Skopje', 'Tetovo', 'Gostivar', 'Kumanovo', 'Bitola', 'Ohrid', 'Prilep', 'Struga'] as const;
const montenegroCities = ['Podgorica', 'Ulcinj', 'Bar', 'Budva', 'Niksic', 'Herceg Novi'] as const;

export const countries = [
  { id: 'xk', names: { sq: 'Kosovë', en: 'Kosovo', de: 'Kosovo' }, cities: kosovoCities },
  { id: 'al', names: { sq: 'Shqipëri', en: 'Albania', de: 'Albanien' }, cities: albaniaCities },
  { id: 'mk', names: { sq: 'Maqedonia e Veriut', en: 'North Macedonia', de: 'Nordmazedonien' }, cities: macedoniaCities },
  { id: 'me', names: { sq: 'Mali i Zi', en: 'Montenegro', de: 'Montenegro' }, cities: montenegroCities },
] as const;

export function countryById(id?: string) {
  return countries.find((country) => country.id === id);
}
