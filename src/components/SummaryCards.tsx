import type { Summary } from "../types";

interface SummaryCardsProps {
  summary: Summary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: "Запросов",
      value: summary.totalRequests.toLocaleString("ru-RU"),
      icon: "📊",
    },
    {
      title: "Доля ошибок",
      value: `${(summary.errorRate * 100).toFixed(1)}%`,
      icon: "⚠️",
      alert: summary.errorRate > 0.1,
    },
    {
      title: "Ср. задержка",
      value: `${Math.round(summary.avgLatency)} мс`,
      icon: "⏱️",
    },
    {
      title: "Сумма",
      value: `$${summary.totalCost.toFixed(2)}`,
      icon: "💰",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>{card.icon}</span>
            <span>{card.title}</span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-semibold ${
              card.alert
                ? "text-red-600 dark:text-red-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
