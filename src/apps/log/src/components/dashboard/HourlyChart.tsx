import { useMemo } from "react";

type HourPoint = {
  label: string;
  count: number;
};

type HourlyChartProps = {
  points: HourPoint[];
};

export function HourlyChart({ points }: HourlyChartProps) {
  const { max, bars } = useMemo(() => {
    const maxCount = Math.max(1, ...points.map((point) => point.count));

    return {
      max: maxCount,
      bars: points.map((point) => ({
        ...point,
        ratio: point.count / maxCount,
      })),
    };
  }, [points]);

  return (
    <section
      className="surface-card"
      aria-label="Grafico de evolucion por hora"
    >
      <p className="surface-card__label">Evolucion 12h</p>
      <div
        className="hourly-chart"
        role="img"
        aria-label="Cantidad de eventos por hora"
      >
        {bars.map((item: (typeof bars)[number]) => (
          <div className="hourly-chart__item" key={item.label}>
            <div
              className="hourly-chart__bar"
              style={{
                height: `${Math.max(10, Math.round(item.ratio * 100))}%`,
              }}
              title={`${item.label} - ${item.count} eventos`}
            >
              <span className="hourly-chart__value">{item.count}</span>
            </div>
            <span className="hourly-chart__label">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="surface-card__meta">
        Maximo de referencia: {max} eventos/hora
      </p>
    </section>
  );
}
