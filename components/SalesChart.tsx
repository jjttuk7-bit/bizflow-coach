import React, { useEffect, useRef } from 'react';
import { ChartData } from '../types';
import Chart from 'chart.js/auto';

interface SalesChartProps {
    chartData: ChartData;
}

const CHART_COLORS = {
    backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(99, 255, 132, 0.6)'
    ],
    borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(99, 255, 132, 1)'
    ],
};


const SalesChart: React.FC<SalesChartProps> = ({ chartData }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            // Destroy previous chart instance if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: chartData.type,
                    data: {
                        labels: chartData.labels,
                        datasets: chartData.datasets.map(dataset => ({
                            ...dataset,
                            backgroundColor: CHART_COLORS.backgroundColor,
                            borderColor: CHART_COLORS.borderColor,
                            borderWidth: 1,
                        })),
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: chartData.title,
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                }
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    },
                });
            }
        }

        // Cleanup function to destroy chart on component unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [chartData]);

    return <canvas ref={chartRef} />;
};

export default SalesChart;
