import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/uk.js';
import type { CounterType, Reminder, Repeat } from '../models/counter';
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
  formatLongDay: dateFormatter('en', 'dddd, MMMM D, YYYY'),
  formatPercent: (n: number, digits: number) => `${n.toFixed(digits)}%`,
  days: (n: number) => `${n} ${enPlural(n, 'day', 'days')}`,
  weeks: (n: number) => `${n} ${enPlural(n, 'week', 'weeks')}`,
  weekendsLeft: (n: number) => enPlural(n, 'weekend left', 'weekends left'),
  daysOfTotal: (passed: number, total: number) => `${passed} of ${total} days`,
  yearTitle: (year: number) => `Year ${year}`,
  dayOfYear: (day: number, total: number) => `Day ${day} of ${total}`,
  sections: { upcoming: 'Upcoming', since: 'Since', goals: 'Goals', past: 'Past' },
  repeat: 'Repeat',
  repeats: { none: 'Never', monthly: 'Every month', yearly: 'Every year' } as Record<Repeat, string>,
  quickDates: { tomorrow: 'Tomorrow', week: 'In a week', month: 'In a month', year: 'In a year' },
  reminder: 'Reminder',
  reminders: {
    none: 'Off', on_day: 'On the day', day_before: '1 day before', week_before: '1 week before', custom: 'Choose a date',
  } as Record<Reminder, string>,
  reminderDate: 'Reminder date',
  reminderTime: 'Reminder time',
  formatTime: (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  },
  goalReminder: 'Time to update your progress.',
  errorReminderPast: 'Choose a reminder date and time in the future.',
  reminderBody: (days: number) => (days === 0 ? 'Today is the day! 🎉' : `In ${days} ${enPlural(days, 'day', 'days')}`),
  notificationsOff: 'Notifications are off for Chas. Turn them on in the phone settings to get reminders.',

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
  cardColors: {
    peach: 'Peach', sun: 'Sun', mint: 'Mint', sky: 'Sky', lilac: 'Lilac', rose: 'Pink',
    lime: 'Lime', teal: 'Teal', lavender: 'Lavender', sand: 'Sand', coral: 'Coral', gray: 'Gray',
  } as Record<CardColorKey, string>,
  widgets: 'Widgets',
  widgetsHint: 'Touch and hold the home screen, choose Widgets, then Chas. There are two widgets: the year and one counter of your choice.',
  addYearWidget: 'Add the year widget',
  addCounterWidget: 'Add a counter widget',
  widgetChooseCounter: 'Choose a counter for the widget',
  widgetNoCounters: 'You have no counters yet. Create one in the app first.',
  supportTitle: '☕ Support the app',
  supportText: 'Chas is free, with no ads and no subscriptions. If you like it, buy the author a coffee.',
};

export type Strings = typeof en;

const uk: Strings = {
  pickerLocale: 'uk-UA',
  formatDate: dateFormatter('uk', 'D MMMM YYYY'),
  cancel: 'Скасувати',
  formatLongDay: dateFormatter('uk', 'dddd, D MMMM YYYY'),
  formatPercent: (n, digits) => `${n.toFixed(digits).replace('.', ',')}%`,
  days: (n) => `${n} ${ukPlural(n, ['день', 'дні', 'днів'])}`,
  weeks: (n) => `${n} ${ukPlural(n, ['тиждень', 'тижні', 'тижнів'])}`,
  weekendsLeft: (n) => ukPlural(n, ['вікенд попереду', 'вікенди попереду', 'вікендів попереду']),
  daysOfTotal: (passed, total) => `${passed} з ${total} ${ukPlural(total, ['дня', 'днів', 'днів'])}`,
  yearTitle: (year) => `Рік ${year}`,
  dayOfYear: (day, total) => `День ${day} з ${total}`,
  sections: { upcoming: 'Попереду', since: 'Від події', goals: 'Цілі', past: 'Минулі' },
  repeat: 'Повтор',
  repeats: { none: 'Ніколи', monthly: 'Щомісяця', yearly: 'Щороку' },
  quickDates: { tomorrow: 'Завтра', week: 'Через тиждень', month: 'Через місяць', year: 'Через рік' },
  reminder: 'Нагадування',
  reminders: { none: 'Вимкнено', on_day: 'У день події', day_before: 'За 1 день', week_before: 'За 1 тиждень', custom: 'Вибрати дату' },
  reminderDate: 'Дата нагадування',
  reminderTime: 'Час нагадування',
  formatTime: (time) => time,
  goalReminder: 'Час оновити ваш прогрес.',
  errorReminderPast: 'Виберіть дату і час нагадування в майбутньому.',
  reminderBody: (days) => (days === 0 ? 'Цей день настав! 🎉' : `Через ${days} ${ukPlural(days, ['день', 'дні', 'днів'])}`),
  notificationsOff: 'Сповіщення для Chas вимкнено. Увімкніть їх у налаштуваннях телефона, щоб отримувати нагадування.',

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
  cardColors: {
    peach: 'Персик', sun: 'Сонце', mint: 'М’ята', sky: 'Небо', lilac: 'Бузок', rose: 'Рожевий',
    lime: 'Лайм', teal: 'Бірюза', lavender: 'Лаванда', sand: 'Пісок', coral: 'Корал', gray: 'Сірий',
  },
  widgets: 'Віджети',
  widgetsHint: 'Утримуйте палець на головному екрані, виберіть «Віджети», потім Chas. Є два віджети: рік і один лічильник на ваш вибір.',
  addYearWidget: 'Додати віджет року',
  addCounterWidget: 'Додати віджет лічильника',
  widgetChooseCounter: 'Виберіть лічильник для віджета',
  widgetNoCounters: 'Ще немає лічильників. Спочатку створіть лічильник у застосунку.',
  supportTitle: '☕ Підтримати застосунок',
  supportText: 'Chas безкоштовний, без реклами і підписок. Якщо він вам подобається, пригостіть автора кавою.',
};

// French puts a non-breaking space before ? and inside « ».
const fr: Strings = {
  pickerLocale: 'fr-FR',
  formatDate: dateFormatter('fr', 'D MMMM YYYY'),
  cancel: 'Annuler',
  formatLongDay: dateFormatter('fr', 'dddd D MMMM YYYY'),
  formatPercent: (n, digits) => `${n.toFixed(digits).replace('.', ',')}\u00A0%`,
  days: (n) => `${n} ${frPlural(n, 'jour', 'jours')}`,
  weeks: (n) => `${n} ${frPlural(n, 'semaine', 'semaines')}`,
  weekendsLeft: (n) => frPlural(n, 'week-end restant', 'week-ends restants'),
  daysOfTotal: (passed, total) => `${passed} sur ${total} jours`,
  yearTitle: (year) => `Année ${year}`,
  dayOfYear: (day, total) => `Jour ${day} sur ${total}`,
  sections: { upcoming: 'À venir', since: 'Depuis', goals: 'Objectifs', past: 'Passés' },
  repeat: 'Répétition',
  repeats: { none: 'Jamais', monthly: 'Chaque mois', yearly: 'Chaque année' },
  quickDates: { tomorrow: 'Demain', week: 'Dans une semaine', month: 'Dans un mois', year: 'Dans un an' },
  reminder: 'Rappel',
  reminders: {
    none: 'Désactivé', on_day: 'Le jour même', day_before: '1 jour avant', week_before: '1 semaine avant', custom: 'Choisir une date',
  },
  reminderDate: 'Date du rappel',
  reminderTime: 'Heure du rappel',
  formatTime: (time) => time,
  goalReminder: 'C’est le moment de mettre à jour vos progrès.',
  errorReminderPast: 'Choisissez une date et une heure de rappel dans le futur.',
  reminderBody: (days) => (days === 0 ? 'C’est le jour\u00A0! 🎉' : `Dans ${days} ${frPlural(days, 'jour', 'jours')}`),
  notificationsOff: 'Les notifications de Chas sont désactivées. Activez-les dans les réglages du téléphone pour recevoir les rappels.',

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
  cardColors: {
    peach: 'Pêche', sun: 'Soleil', mint: 'Menthe', sky: 'Ciel', lilac: 'Lilas', rose: 'Rose',
    lime: 'Citron vert', teal: 'Sarcelle', lavender: 'Lavande', sand: 'Sable', coral: 'Corail', gray: 'Gris',
  },
  widgets: 'Widgets',
  widgetsHint: 'Appuyez longuement sur l’écran d’accueil, choisissez Widgets, puis Chas. Il y a deux widgets\u00A0: l’année et un compteur de votre choix.',
  addYearWidget: 'Ajouter le widget de l’année',
  addCounterWidget: 'Ajouter un widget de compteur',
  widgetChooseCounter: 'Choisissez un compteur pour le widget',
  widgetNoCounters: 'Vous n’avez pas encore de compteur. Créez-en un dans l’application.',
  supportTitle: '☕ Soutenir l’application',
  supportText: 'Chas est gratuit, sans publicité ni abonnement. Si vous l’aimez, offrez un café à l’auteur.',
};

export const STRINGS: Record<Language, Strings> = { en, uk, fr };

/** The language setting wins. With 'system', use the device language if the app supports it. */
export function resolveLanguage(setting: Language | 'system', deviceLanguage: string | null | undefined): Language {
  if (setting !== 'system') return setting;
  return isLanguage(deviceLanguage) ? deviceLanguage : 'en';
}
