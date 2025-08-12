'use client';

import { Series } from '@/lib/definitions';
import { ColorType, createChart, LineSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

export default function Chart({
  data,
  colors = {
    backgroundColor: 'transparent',
    lineColor: '#2962FF',
    textColor: 'white',
    areaTopColor: '#2962FF',
    areaBottomColor: 'rgba(41, 98, 255, 0.28)',
  }
}: {
  data: Series[], colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  }
}) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    () => {
      if (!chartContainerRef.current) {
        return;
      }

      const handleResize = () => {
        if (!chartContainerRef.current) {
          return;
        }

        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: colors.backgroundColor },
          textColor: colors.textColor,
          attributionLogo: false,
          colorSpace: 'srgb',
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,

      });
      chart.timeScale().fitContent();

      const newSeries = chart.addSeries(LineSeries);
      newSeries.setData(data);

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);

        chart.remove();
      };
    },
    [data, colors]
  );

  return (
    <div
      className="transition-opacity opacity-50 hover:opacity-100"
      ref={chartContainerRef}
    />
  );
};
