import { SymbolView } from 'expo-symbols';

const names = {
  ticket: { ios: 'ticket.fill', android: 'confirmation_number', web: 'ticket' },
  sofa: { ios: 'sofa.fill', android: 'chair', web: 'sofa' },
  briefcase: { ios: 'briefcase.fill', android: 'work', web: 'briefcase' },
  car: { ios: 'car.fill', android: 'directions_car', web: 'car' },
  bicycle: { ios: 'bicycle', android: 'pedal_bike', web: 'bicycle' },
  plus: { ios: 'plus', android: 'add', web: 'plus' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'magnifyingglass' },
  pin: { ios: 'mappin', android: 'place', web: 'mappin' },
  house: { ios: 'house.fill', android: 'home', web: 'house.fill' },
  houseOutline: { ios: 'house', android: 'home', web: 'house' },
  bubble: { ios: 'bubble.left.fill', android: 'chat_bubble', web: 'bubble.left.fill' },
  bubbleOutline: { ios: 'bubble.left', android: 'chat_bubble_outline', web: 'bubble.left' },
  person: { ios: 'person.fill', android: 'person', web: 'person.fill' },
  personOutline: { ios: 'person', android: 'person_outline', web: 'person' },
  laptop: { ios: 'laptopcomputer', android: 'laptop', web: 'laptopcomputer' },
  sliders: { ios: 'line.3.horizontal.decrease', android: 'tune', web: 'line.3.horizontal.decrease' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'heart.fill' },
  heartOutline: { ios: 'heart', android: 'favorite_border', web: 'heart' },
  arrowUpRight: { ios: 'arrow.up.right', android: 'north_east', web: 'arrow.up.right' },
} as const;

export type AppIconName = keyof typeof names;

export function AppIcon({
  name,
  size = 20,
  color = '#173f35',
}: {
  name: AppIconName;
  size?: number;
  color?: string;
}) {
  return <SymbolView name={names[name]} size={size} tintColor={color} />;
}
