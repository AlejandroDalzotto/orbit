import { ColorType, type IPrimitivePaneRenderer, type IPrimitivePaneView, type ISeriesPrimitive, type SeriesAttachedParameter, type Time } from "lightweight-charts";

export function colorWithAlpha(color: string, alpha: number): string {
  const hex = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? [...hex].map((digit) => digit + digit).join("") : hex;
    const channels = [0, 2, 4].map((offset) => parseInt(expanded.slice(offset, offset + 2), 16));
    return `rgba(${channels.join(",")},${alpha})`;
  }
  const rgb = color.trim().match(/^rgba?\(([^)]+)\)$/i)?.[1];
  if (rgb) {
    const channels = rgb.split(/[\s,/]+/).slice(0, 3).map((value) => value.endsWith("%") ? Number(value.slice(0, -1)) * 255 / 100 : Number(value));
    if (channels.length === 3 && channels.every(Number.isFinite)) return `rgba(${channels.join(",")},${alpha})`;
  }
  throw new Error(`El color del gráfico debe ser hexadecimal o RGB: ${color}`);
}

export function chartColors(styles: Pick<CSSStyleDeclaration, "getPropertyValue"> | undefined = typeof document === "undefined" ? undefined : getComputedStyle(document.documentElement)) {
  const token = (name: string, fallback: string) => styles?.getPropertyValue(`--color-${name}`).trim() || fallback;
  const primary = token("primary", "#f1f0ec");
  return {
    primary,
    background: token("bg", "#090909"),
    surface: token("surface", "#101010"),
    muted: token("muted", "#949491"),
    hairline: token("hairline", colorWithAlpha(primary, 0.14)),
    grid: colorWithAlpha(primary, 0.07),
    crosshair: colorWithAlpha(primary, 0.3),
    income: token("chart-income", primary),
    expenses: token("chart-expenses", "#b5b8ff"),
    net: token("chart-net", "#ffc77a"),
  };
}

export function chartThemeOptions(colors: ReturnType<typeof chartColors>) {
  const crosshairLine = { color: colors.crosshair, labelBackgroundColor: colors.surface };
  return {
    layout: { background: { type: ColorType.Solid, color: colors.background }, textColor: colors.muted },
    grid: { vertLines: { color: colors.grid }, horzLines: { color: colors.grid } },
    rightPriceScale: { borderColor: colors.hairline },
    timeScale: { borderColor: colors.hairline },
    crosshair: { vertLine: crosshairLine, horzLine: crosshairLine },
  };
}

export type ChartValue = { time: Time; value: number };
type CanvasTarget = Parameters<IPrimitivePaneRenderer["draw"]>[0];
type PlotPoint = { x: number; y: number; index: number };

// Primitives share the chart's pane, coordinate transforms and redraw lifecycle.
// No independent canvas or scroll/resize synchronization loop is needed.
abstract class SeriesVisual implements ISeriesPrimitive<Time>, IPrimitivePaneView, IPrimitivePaneRenderer {
  protected attachment?: SeriesAttachedParameter<Time>;
  protected points: PlotPoint[] = [];
  protected spacing = 8;
  protected originX = 0;
  protected zero: number | null = null;
  private readonly views: readonly IPrimitivePaneView[] = [this];

  constructor(protected readonly data: readonly ChartValue[]) {}

  attached(attachment: SeriesAttachedParameter<Time>) {
    this.attachment = attachment;
    attachment.requestUpdate();
  }

  detached() { this.attachment = undefined; this.points = []; }
  paneViews() { return this.views; }
  renderer() { return this; }

  updateAllViews() {
    const attachment = this.attachment;
    if (!attachment) return;
    const scale = attachment.chart.timeScale();
    const range = scale.getVisibleLogicalRange();
    this.spacing = scale.options().barSpacing;
    this.originX = this.data.length ? scale.timeToCoordinate(this.data[0].time) ?? 0 : 0;
    this.zero = attachment.series.priceToCoordinate(0);
    this.points = [];
    if (!range) return;
    const first = Math.max(0, Math.floor(range.from) - 1);
    const last = Math.min(this.data.length - 1, Math.ceil(range.to) + 1);
    for (let index = first; index <= last; index++) {
      const row = this.data[index];
      const x = scale.timeToCoordinate(row.time);
      const y = attachment.series.priceToCoordinate(row.value);
      if (x !== null && y !== null) this.points.push({ x, y, index });
    }
  }

  abstract draw(target: CanvasTarget): void;
}

export class IncomeParticles extends SeriesVisual {
  constructor(data: readonly ChartValue[], private color = chartColors().income) { super(data); }

  setColor(color: string) {
    this.color = color;
    this.attachment?.requestUpdate();
  }

  zOrder() { return "bottom" as const; }

  draw(target: CanvasTarget) {
    if (this.points.length === 0) return;
    target.useMediaCoordinateSpace(({ context, mediaSize }) => {
      const { width, height } = mediaSize;
      const points = this.points.length === 1
        ? [{ ...this.points[0], x: this.points[0].x - this.spacing / 2 }, { ...this.points[0], x: this.points[0].x + this.spacing / 2 }]
        : this.points;
      context.save();
      context.beginPath();
      context.moveTo(points[0].x, height);
      for (const point of points) context.lineTo(point.x, point.y);
      context.lineTo(points[points.length - 1].x, height);
      context.closePath();
      context.clip();
      const pitch = 5;
      // Anchor the lattice to a data coordinate so the texture moves with the line.
      const origin = ((this.originX % pitch) + pitch) % pitch;
      let segment = 0;
      for (let x = origin; x < width; x += pitch) {
        if (x < points[0].x || x > points[points.length - 1].x) continue;
        while (segment < points.length - 2 && points[segment + 1].x < x) segment++;
        const left = points[segment];
        const right = points[segment + 1];
        const mix = right.x === left.x ? 0 : (x - left.x) / (right.x - left.x);
        const lineY = left.y + (right.y - left.y) * mix;
        if (lineY >= height) continue;
        const fade = context.createLinearGradient(0, lineY, 0, height);
        fade.addColorStop(0, colorWithAlpha(this.color, 0.38));
        fade.addColorStop(0.55, colorWithAlpha(this.color, 0.1));
        fade.addColorStop(1, colorWithAlpha(this.color, 0));
        context.fillStyle = fade;
        context.beginPath();
        for (let y = Math.ceil(Math.max(0, lineY) / pitch) * pitch; y < height; y += pitch) {
          context.moveTo(x + 0.55, y);
          context.arc(x, y, 0.55, 0, Math.PI * 2);
        }
        context.fill();
      }
      context.restore();
      context.save();
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (const point of points.slice(1)) context.lineTo(point.x, point.y);
      context.strokeStyle = colorWithAlpha(this.color, 0.55);
      context.lineWidth = 1;
      context.lineJoin = "round";
      context.shadowColor = colorWithAlpha(this.color, 0.45);
      context.shadowBlur = 5;
      context.stroke();
      context.restore();
    });
  }
}

export function columnReveal(elapsed: number, index: number, count: number): number {
  const delay = count > 1 ? index / (count - 1) * 240 : 0;
  const progress = Math.max(0, Math.min(1, (elapsed - delay) / 600));
  return 1 - (1 - progress) ** 3;
}

export class NetColumns extends SeriesVisual {
  private elapsed = Infinity;
  private started = 0;
  private frame?: number;

  constructor(data: readonly ChartValue[], private color: string, private readonly reducedMotion: boolean) { super(data); }

    setColor(color: string) {
      this.color = color;
      this.attachment?.requestUpdate();
    }

  attached(attachment: SeriesAttachedParameter<Time>) {
    super.attached(attachment);
    if (!this.reducedMotion) {
      this.elapsed = 0;
      this.started = performance.now();
      this.frame = requestAnimationFrame(this.animate);
    }
  }

  private animate = (now: number) => {
    this.frame = undefined;
    if (!this.attachment) return;
    this.elapsed = now - this.started;
    this.attachment.requestUpdate();
    if (this.elapsed < 840) this.frame = requestAnimationFrame(this.animate);
  };

  finish() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.elapsed = Infinity;
    this.attachment?.requestUpdate();
  }

  detached() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    super.detached();
  }

  draw(target: CanvasTarget) {
    const zero = this.zero;
    if (zero === null || this.points.length === 0) return;
    target.useMediaCoordinateSpace(({ context }) => {
      const width = Math.max(1, Math.min(44, this.spacing * 0.72));
      context.save();
      context.fillStyle = this.color;
      for (const point of this.points) {
        const progress = columnReveal(this.elapsed, point.index, this.data.length);
        const y = zero + (point.y - zero) * progress;
        context.globalAlpha = progress;
        context.fillRect(point.x - width / 2, Math.min(zero, y), width, Math.abs(y - zero));
      }
      context.restore();
    });
  }
}
