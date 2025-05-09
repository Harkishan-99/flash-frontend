"use client"

import { useTheme } from "next-themes"

interface MonthlyReturnsHeatmapProps {
  data: Array<{ month: string; return: number }>
}

export function MonthlyReturnsHeatmap({ data }: MonthlyReturnsHeatmapProps) {
  const { theme } = useTheme()

  // Process data to create a year/month matrix
  const processData = () => {
    const monthsMap: Record<string, Record<string, number>> = {}

    data.forEach((item) => {
      const [year, month] = item.month.split("-")
      if (!monthsMap[year]) {
        monthsMap[year] = {}
      }
      monthsMap[year][month] = item.return
    })

    return monthsMap
  }

  const monthsMap = processData()
  const years = Object.keys(monthsMap).sort()
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Color scale for returns
  const getColor = (value: number) => {
    if (value === undefined) return theme === "dark" ? "#1e293b" : "#f1f5f9"

    if (value > 0) {
      const intensity = Math.min(value / 10, 1) // Scale to max at 10% return
      return theme === "dark"
        ? `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`
        : `rgba(5, 150, 105, ${0.1 + intensity * 0.9})`
    } else {
      const intensity = Math.min(Math.abs(value) / 10, 1) // Scale to max at -10% return
      return theme === "dark"
        ? `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`
        : `rgba(220, 38, 38, ${0.1 + intensity * 0.9})`
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex mb-2">
        <div className="w-16"></div>
        {monthNames.map((month) => (
          <div key={month} className="flex-1 text-center text-xs font-medium">
            {month}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {years.map((year) => (
          <div key={year} className="flex mb-1 h-10">
            <div className="w-16 flex items-center justify-center text-xs font-medium">{year}</div>
            {months.map((month) => {
              const value = monthsMap[year][month]
              return (
                <div
                  key={`${year}-${month}`}
                  className="flex-1 flex items-center justify-center text-xs font-medium rounded mx-0.5"
                  style={{ backgroundColor: getColor(value) }}
                >
                  {value !== undefined ? `${value.toFixed(1)}%` : ""}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(-10) }}></div>
          <span className="text-xs ml-1 mr-2">Loss</span>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme === "dark" ? "#1e293b" : "#f1f5f9" }}></div>
          <span className="text-xs mx-1">No Data</span>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(10) }}></div>
          <span className="text-xs ml-1">Gain</span>
        </div>
      </div>
    </div>
  )
}
