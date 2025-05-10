"use client"

import React, { useEffect, useState } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ChartData,
    ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { useTheme } from "../../../components/theme-provider"
import useFetch from "../../../hooks/use-fetch"
import { Response, UserArtistStatistics } from "../../../types"
import {Skeleton} from "../../../components/ui/skeleton.tsx";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
)

type Option = { value: string; label: string }

// Generate last 4 years of Month-Year options
const generateMonthYearOptions = (): Option[] => {
    const now = new Date()
    const opts: Option[] = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
        const maxM = y === now.getFullYear() ? now.getMonth() : 11
        for (let m = maxM; m >= 0; m--) {
            const label = new Date(y, m).toLocaleString("en-US", { month: "short", year: "numeric" })
            opts.push({ value: `${m + 1}-${y}`, label })
        }
    }
    return opts
}

export const OverviewChart: React.FC = () => {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const monthYearOptions = generateMonthYearOptions()

    const [selected, setSelected] = useState<string>(monthYearOptions[0]?.value || "1-2025")
    const [chartData, setChartData] = useState<ChartData<'line', number[], string>>({ labels: [], datasets: [] })

    // parse month & year
    const [month, year] = selected.split("-").map(Number)

    const { data, loading, error } = useFetch<Response<UserArtistStatistics[]>>(
        `api/Statistics/user-top-artists?Month=${month}&Year=${year}`
    )

    // update chart when fetched data arrives or theme toggles
    useEffect(() => {
        if (!data?.data || data.data.length === 0) return
        const points = data.data

        const primary = isDark ? "#0ea5e9" : "#0284c7"
        const secondary = isDark ? "#94a3b8" : "#64748b"

        setChartData({
            labels: points.map((p) => p.name),
            datasets: [
                { label: "Users", data: points.map((p) => p.users), borderColor: primary, backgroundColor: "transparent", tension: 0.3, pointRadius: 3 },
                { label: "Artists", data: points.map((p) => p.artists), borderColor: secondary, backgroundColor: "transparent", tension: 0.3, pointRadius: 3 },
            ],
        })
    }, [data, isDark])

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { labels: { color: isDark ? "#f8fafc" : "#0f172a", boxWidth: 12, usePointStyle: true } },
            tooltip: { backgroundColor: isDark ? "#1e293b" : "#ffffff", titleColor: isDark ? "#f8fafc" : "#0f172a", bodyColor: isDark ? "#f8fafc" : "#0f172a", borderColor: isDark ? "rgba(30,41,59,0.2)" : "rgba(203,213,225,0.5)", borderWidth: 1 }
        },
        scales: { x: { grid: { display: false }, ticks: { color: isDark ? "#f8fafc" : "#0f172a" } }, y: { grid: { color: isDark ? "rgba(30,41,59,0.2)" : "rgba(203,213,225,0.5)" }, ticks: { color: isDark ? "#f8fafc" : "#0f172a" } } },
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">User & Artist Statistics</h3>
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {monthYearOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {loading &&
                <div className="flex justify-center items-center h-64">
                    <Skeleton className="h-full w-full" />
                </div>
            }
            {error && <div className="flex justify-center items-center h-64 text-red-500">Error loading chart data</div>}
            {!loading && !error && (
                <div className="h-64 w-full">
                    <Line data={chartData} options={options} />
                </div>
            )}
        </div>
    )
}