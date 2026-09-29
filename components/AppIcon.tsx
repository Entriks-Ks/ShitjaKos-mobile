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
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron.left' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more', web: 'chevron.down' },
  store: { ios: 'storefront.fill', android: 'storefront', web: 'storefront' },
  menu: { ios: 'line.3.horizontal', android: 'menu', web: 'menu' },
  cart: { ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' },
  grid: { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' },
  sort: { ios: 'arrow.up.arrow.down', android: 'swap_vert', web: 'swap_vert' },
  phone: { ios: 'iphone', android: 'smartphone', web: 'smartphone' },
  shirt: { ios: 'tshirt.fill', android: 'checkroom', web: 'checkroom' },
  basketball: { ios: 'basketball.fill', android: 'sports_basketball', web: 'sports_basketball' },
  bag: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
  tv: { ios: 'tv.fill', android: 'tv', web: 'tv' },
  shield: { ios: 'checkmark.shield', android: 'verified_user', web: 'checkmark.shield' },
  mail: { ios: 'envelope', android: 'mail', web: 'envelope' },
  clock: { ios: 'clock', android: 'schedule', web: 'clock' },
  share: { ios: 'square.and.arrow.up', android: 'share', web: 'square.and.arrow.up' },
  flag: { ios: 'flag', android: 'flag', web: 'flag' },
  tag: { ios: 'tag', android: 'sell', web: 'tag' },
  users: { ios: 'person.2', android: 'group', web: 'person.2' },
  pencil: { ios: 'pencil', android: 'edit', web: 'pencil' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron.right' },
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'camera.fill' },
  photo: { ios: 'photo', android: 'image', web: 'photo' },
  check: { ios: 'checkmark', android: 'check', web: 'checkmark' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'rectangle.portrait.and.arrow.right' },
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
