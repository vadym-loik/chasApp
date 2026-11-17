import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/uk.js';
import type { CounterType } from '../models/counter';
import type { AccentKey, CardColorKey } from '../theme/colors';

export type Language = 'en' | 'uk' | 'fr';

export const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'uk', label: 'Українська', flag: '🇺🇦' },
  { key: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function isLanguage(code: string | null | undefined): code is Language {
  return LANGUAGES.some((l) => l.key === code);
}

/** Ukrainian plural form: ukPlural(n, ['день', 'дні', 'днів']). */
export function ukPlural(n: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

const enPlural = (n: number, one: string, other: string) => (n === 1 ? one : other);
// In French, 0 and 1 use the singular form.
const frPlural = (n: number, one: string, other: string) => (n < 2 ? one : other);

function dateFormatter(locale: string, format: string) {
  return (value: string) => dayjs(value).locale(locale).format(format);
}

const en = {
  pickerLocale: 'en-US',
  formatDate: dateFormatter('en', 'MMMM D, YYYY'),
  cancel: 'Cancel',

  types: {
    days_left: { label: 'Countdown', description: 'Days left until a date', placeholder: 'Vacation' },
    days_passed: { label: 'Days since', description: 'Days since a date. For habits', placeholder: 'No sugar' },
    goal_progress: { label: 'Goal', description: 'Progress from start to target', placeholder: 'Weight' },
  } as Record<CounterType, { label: string; description: string; placeholder: string }>,
  daysLeft: (n: number) => enPlural(n, 'day left', 'days left'),
  daysAgo: (n: number) => enPlural(n, 'day ago', 'days ago'),
  daysPassed: (n: number) => enPlural(n, 'day passed', 'days passed'),
  today: 'today',
  done: 'complete',
  goalReached: 'goal reached',
  until: (date: string) => `until ${date}`,
  since: (date: string) => `since ${date}`,
  goalDetails: (start: number, target: number, current: number) => `${start} → ${target} · now ${current}`,

  emptyTitle: 'Start counting',
  emptyText: 'Count days to an important event, days without a bad habit, or progress to your goal.',
  createCounter: 'Create a counter',
  newCounter: 'New counter',

  editCounter: 'Edit',
  whatToCount: 'What do you count?',
  name: 'Name',
  icon: 'Icon',
  eventDate: 'Event date',
  startDate: 'Start date',
  startValue: 'Start',
  currentShort: 'Now',
  targetValue: 'Target',
  cardColor: 'Card color',
  save: 'Save',
  create: 'Create',
  errorName: 'Enter a name.',
  errorValues: 'Enter the start and target values.',
  errorSameValues: 'The target must be different from the start value.',
  errorCurrent: 'Enter the current value.',

  notFound: 'Counter not found.',
  currentValue: 'Current value',
  update: 'Update',
  startOver: 'Start over',
  startOverTitle: 'Start over?',
  startOverMessage: 'The count starts again from today.',
  delete: 'Delete',
  deleteTitle: 'Delete counter?',
  deleteMessage: (title: string) => `“${title}” will be deleted forever.`,

  settings: 'Settings',
  version: (v: string) => `Version ${v}`,
  theme: 'Theme',
  themeModes: { system: 'System', light: 'Light', dark: 'Dark' },
  language: 'Language',
  systemLanguage: 'System language',
  accent: 'Accent color',
  accents: { coral: 'Coral', indigo: 'Indigo', teal: 'Teal', amber: 'Amber', rose: 'Rose', violet: 'Violet' } as Record<AccentKey, string>,
  cardColors: { peach: 'Peach', sun: 'Sun', mint: 'Mint', sky: 'Sky', lilac: 'Lilac', rose: 'Pink' } as Record<CardColorKey, string>,
  supportTitle: '☕ Support the app',
  supportText: 'Chas is free, with no ads and no subscriptions. If you like it, buy the author a coffee.',
};

export type Strings = typeof en;

const uk: Strings = {
  pickerLocale: 'uk-UA',
  formatDate: dateFormatter('uk', 'D MMMM YYYY'),
  cancel: 'Скасувати',

  types: {
    days_left: { label: 'До події', description: 'Скільки днів залишилося до дати', placeholder: 'Відпустка' },
    days_passed: { label: 'Від події', description: 'Скільки днів минуло. Для звичок', placeholder: 'Без цукру' },
    goal_progress: { label: 'Ціль', description: 'Прогрес від старту до мети', placeholder: 'Вага' },
  },
  daysLeft: (n) => ukPlural(n, ['день залишився', 'дні залишилося', 'днів залишилося']),
  daysAgo: (n) => ukPlural(n, ['день тому', 'дні тому', 'днів тому']),
  daysPassed: (n) => ukPlural(n, ['день минув', 'дні минуло', 'днів минуло']),
  today: 'сьогодні',
  done: 'виконано',
  goalReached: 'ціль досягнута',
  until: (date) => `до ${date}`,
  since: (date) => `з ${date}`,
  goalDetails: (start, target, current) => `${start} → ${target} · зараз ${current}`,

  emptyTitle: 'Почнімо відлік',
  emptyText: 'Рахуйте дні до важливої події, дні без шкідливої звички або прогрес до вашої цілі.',
  createCounter: 'Створити лічильник',
  newCounter: 'Новий лічильник',

  editCounter: 'Редагувати',
  whatToCount: 'Що рахуємо?',
  name: 'Назва',
  icon: 'Іконка',
  eventDate: 'Дата події',
  startDate: 'Дата початку',
  startValue: 'Старт',
  currentShort: 'Зараз',
  targetValue: 'Мета',
  cardColor: 'Колір картки',
  save: 'Зберегти',
  create: 'Створити',
  errorName: 'Введіть назву.',
  errorValues: 'Введіть початкове і цільове значення.',
  errorSameValues: 'Цільове значення має відрізнятися від початкового.',
  errorCurrent: 'Введіть поточне значення.',

  notFound: 'Лічильник не знайдено.',
  currentValue: 'Поточне значення',
  update: 'Оновити',
  startOver: 'Почати спочатку',
  startOverTitle: 'Почати спочатку?',
  startOverMessage: 'Відлік почнеться з сьогоднішнього дня.',
  delete: 'Видалити',
  deleteTitle: 'Видалити лічильник?',
  deleteMessage: (title) => `«${title}» буде видалено назавжди.`,

  settings: 'Налаштування',
  version: (v) => `Версія ${v}`,
  theme: 'Тема',
  themeModes: { system: 'Системна', light: 'Світла', dark: 'Темна' },
  language: 'Мова',
  systemLanguage: 'Мова системи',
  accent: 'Колір акценту',
  accents: { coral: 'Корал', indigo: 'Індиго', teal: 'Бірюза', amber: 'Бурштин', rose: 'Троянда', violet: 'Фіалка' },
  cardColors: { peach: 'Персик', sun: 'Сонце', mint: 'М’ята', sky: 'Небо', lilac: 'Бузок', rose: 'Рожевий' },
  supportTitle: '☕ Підтримати застосунок',
  supportText: 'Chas безкоштовний, без реклами і підписок. Якщо він вам подобається, пригостіть автора кавою.',
};

// French puts a non-breaking space before ? and inside « ».
const fr: Strings = {
  pickerLocale: 'fr-FR',
  formatDate: dateFormatter('fr', 'D MMMM YYYY'),
  cancel: 'Annuler',

  types: {
    days_left: { label: 'Compte à rebours', description: 'Jours restants avant une date', placeholder: 'Vacances' },
    days_passed: { label: 'Depuis', description: 'Jours écoulés depuis une date. Pour les habitudes', placeholder: 'Sans sucre' },
    goal_progress: { label: 'Objectif', description: 'Progrès du départ à l’objectif', placeholder: 'Poids' },
  },
  daysLeft: (n) => frPlural(n, 'jour restant', 'jours restants'),
  daysAgo: (n) => frPlural(n, 'jour passé', 'jours passés'),
  daysPassed: (n) => frPlural(n, 'jour écoulé', 'jours écoulés'),
  today: 'aujourd’hui',
  done: 'accompli',
  goalReached: 'objectif atteint',
  until: (date) => `jusqu’au ${date}`,
  since: (date) => `depuis le ${date}`,
  goalDetails: (start, target, current) => `${start} → ${target} · actuel ${current}`,

  emptyTitle: 'Commençons le compte',
  emptyText: 'Comptez les jours avant un événement important, les jours sans mauvaise habitude ou vos progrès vers un objectif.',
  createCounter: 'Créer un compteur',
  newCounter: 'Nouveau compteur',

  editCounter: 'Modifier',
  whatToCount: 'Que compter\u00A0?',
  name: 'Nom',
  icon: 'Icône',
  eventDate: 'Date de l’événement',
  startDate: 'Date de début',
  startValue: 'Départ',
  currentShort: 'Actuel',
  targetValue: 'Objectif',
  cardColor: 'Couleur de la carte',
  save: 'Enregistrer',
  create: 'Créer',
  errorName: 'Saisissez un nom.',
  errorValues: 'Saisissez la valeur de départ et l’objectif.',
  errorSameValues: 'L’objectif doit être différent de la valeur de départ.',
  errorCurrent: 'Saisissez la valeur actuelle.',

  notFound: 'Compteur introuvable.',
  currentValue: 'Valeur actuelle',
  update: 'Mettre à jour',
  startOver: 'Recommencer',
  startOverTitle: 'Recommencer\u00A0?',
  startOverMessage: 'Le compte reprend à partir d’aujourd’hui.',
  delete: 'Supprimer',
  deleteTitle: 'Supprimer le compteur\u00A0?',
  deleteMessage: (title) => `«\u00A0${title}\u00A0» sera supprimé définitivement.`,

  settings: 'Réglages',
  version: (v) => `Version ${v}`,
  theme: 'Thème',
  themeModes: { system: 'Système', light: 'Clair', dark: 'Sombre' },
  language: 'Langue',
  systemLanguage: 'Langue du système',
  accent: 'Couleur d’accent',
  accents: { coral: 'Corail', indigo: 'Indigo', teal: 'Turquoise', amber: 'Ambre', rose: 'Rose', violet: 'Violette' },
  cardColors: { peach: 'Pêche', sun: 'Soleil', mint: 'Menthe', sky: 'Ciel', lilac: 'Lilas', rose: 'Rose' },
  supportTitle: '☕ Soutenir l’application',
  supportText: 'Chas est gratuit, sans publicité ni abonnement. Si vous l’aimez, offrez un café à l’auteur.',
};

export const STRINGS: Record<Language, Strings> = { en, uk, fr };

/** The language setting wins. With 'system', use the device language if the app supports it. */
export function resolveLanguage(setting: Language | 'system', deviceLanguage: string | null | undefined): Language {
  if (setting !== 'system') return setting;
  return isLanguage(deviceLanguage) ? deviceLanguage : 'en';
}
