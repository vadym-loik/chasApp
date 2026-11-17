import { FlexWidget, OverlapWidget, SvgWidget, TextWidget, type ColorProp } from 'react-native-android-widget';
import type { Strings } from '../i18n/strings';
import type { CounterItem } from '../models/counter';
import type { ThemeColors } from '../theme/colors';
import { getCounterStats, getYearProgress } from '../utils/counter';

// Widget colors must be hex strings. Our theme colors already are.
const c = (color: string) => color as ColorProp;

interface WidgetTheme {
  colors: ThemeColors;
  t: Strings;
  width: number; // widget size in dp
  height: number;
}

/** The same ring as the app logo and the year card, as an SVG string. */
function ringSvg(progress: number, accent: string): string {
  const r = 42;
  const length = 2 * Math.PI * r;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="${r}" fill="none" stroke="${accent}" stroke-opacity="0.18" stroke-width="12"/>
<circle cx="50" cy="50" r="${r}" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round"
  stroke-dasharray="${length} ${length}" stroke-dashoffset="${length * (1 - progress)}" transform="rotate(-90 50 50)"/>
</svg>`;
}

export function YearWidget({ colors, t, width, height, now }: WidgetTheme & { now: string }) {
  const year = getYearProgress(now);
  const ring = Math.max(56, Math.min(width - 24, height - 56));
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`${t.yearTitle(year.year)}: ${year.daysLeft} ${t.daysLeft(year.daysLeft)}`}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: c(colors.surface),
        borderRadius: 24,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <OverlapWidget style={{ width: ring, height: ring }}>
        <SvgWidget svg={ringSvg(year.progress, colors.accent)} style={{ width: ring, height: ring }} />
        <FlexWidget style={{ width: ring, height: ring, alignItems: 'center', justifyContent: 'center' }}>
          <TextWidget
            text={t.formatPercent(year.progress * 100, 1)}
            style={{ fontSize: Math.round(ring * 0.19), fontWeight: '700', color: c(colors.text) }}
          />
        </FlexWidget>
      </OverlapWidget>
      <TextWidget
        text={`${year.daysLeft} ${t.daysLeft(year.daysLeft)}`}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 13, fontWeight: '600', color: c(colors.text), marginTop: 8 }}
      />
      <TextWidget text={String(year.year)} style={{ fontSize: 11, color: c(colors.muted) }} />
    </FlexWidget>
  );
}

interface CounterWidgetProps extends WidgetTheme {
  item: CounterItem | undefined; // undefined when the counter was deleted
  background: string;
  link: string;
  now: string;
}

export function CounterWidget({ item, colors, t, background, link, now }: CounterWidgetProps) {
  const box = {
    height: 'match_parent',
    width: 'match_parent',
    backgroundColor: c(background),
    borderRadius: 24,
    padding: 14,
  } as const;

  if (!item) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={{ ...box, alignItems: 'center', justifyContent: 'center' }}>
        <TextWidget text={t.widgetNoCounters} style={{ fontSize: 13, color: c(colors.muted), textAlign: 'center' }} />
      </FlexWidget>
    );
  }

  const stats = getCounterStats(item, t, now);
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: link }}
      accessibilityLabel={`${item.title}: ${stats.value} ${stats.label}`}
      style={{ ...box, justifyContent: 'space-between' }}
    >
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent' }}>
        <TextWidget text={item.emoji} style={{ fontSize: 20 }} />
        <TextWidget
          text={item.title}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 14, fontWeight: '600', color: c(colors.text), marginLeft: 8 }}
        />
      </FlexWidget>
      <FlexWidget>
        <TextWidget
          text={stats.value}
          style={{ fontSize: 40, fontWeight: '800', color: c(colors.text), adjustsFontSizeToFit: true }}
        />
        <TextWidget text={stats.label} maxLines={1} truncate="END" style={{ fontSize: 12, color: c(colors.muted) }} />
      </FlexWidget>
      {stats.progress !== undefined ? (
        <FlexWidget
          style={{ flexDirection: 'row', width: 'match_parent', height: 6, borderRadius: 3, backgroundColor: c(colors.track) }}
        >
          <FlexWidget style={{ flex: Math.max(stats.progress, 0.001), height: 6, borderRadius: 3, backgroundColor: c(colors.accent) }} />
          <FlexWidget style={{ flex: Math.max(1 - stats.progress, 0.001), height: 6 }} />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ height: 6 }} />
      )}
    </FlexWidget>
  );
}
