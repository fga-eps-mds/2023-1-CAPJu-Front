import { useState, useEffect } from "react";

const useChartData = (
  processes: Process[],
  start: string,
  end: string
): [string[], number[], number[], () => void] => {
  const [months, setMonths] = useState([] as { month: number; year: number }[]);
  const [archived, setArchived] = useState([] as number[]);
  const [finished, setFinished] = useState([] as number[]);
  const [trigger, setTrigger] = useState(0);

  const reload = () => {
    setTrigger((current) => current + 1);
  };

  useEffect(() => {
    setMonths(getMonthRange(start, end));
  }, [start, end, trigger]);

  useEffect(() => {
    if (months.length > 0 && processes.length > 0) {
      setArchived(getStatusMonthly(processes, months, "Concluído"));
      setFinished(getStatusMonthly(processes, months, "Interrompido"));
    } else {
      setArchived([]);
      setFinished([]);
    }
  }, [months, processes]);

  return [
    months.length > 0 ? months.map((item) => `${item.month}/${item.year}`) : [],
    archived,
    finished,
    reload,
  ];
};

const getMonthRange = (start: string, end: string) => {
  if (start === "" || end === "") return [];

  const dateStart = new Date(start);
  const dateEnd = new Date(end);

  const diff = monthDiff(dateStart, dateEnd);
  const months = [];
  months.push({
    month: dateStart.getMonth() + 1,
    year: dateStart.getFullYear(),
  });
  for (let i = 0; i < diff - 1; i += 1) {
    const date = dateStart;
    date.setMonth(date.getMonth() + 1);
    months.push({ month: date.getMonth() + 1, year: date.getFullYear() });
  }

  return months;
};

const getStatusMonthly = (
  processes: Process[],
  months: { month: number; year: number }[],
  status: string
) => {
  return months.map((date) => {
    return processes.filter((process) => {
      const pDate = new Date(process.effectiveDate);
      return (
        pDate.getMonth() + 1 === date.month &&
        pDate.getFullYear() === date.year &&
        process.status === status
      );
    }).length;
  });
};

const monthDiff = (d1: Date, d2: Date) => {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months + 1;
};

export default useChartData;
