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
  // eslint-disable-next-line
  let startData, endData;

  if (start === "" || end === "") {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    startData = {
      month: twoYearsAgo.getMonth() + 1,
      year: twoYearsAgo.getFullYear(),
    };

    const currentDate = new Date();
    endData = {
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    };
  } else {
    startData = {
      // eslint-disable-next-line
      month: new Date(start + " 00:00:01").getMonth() + 1,
      year: new Date(start).getFullYear(),
    };
    endData = {
      month: new Date(end).getMonth() + 1,
      year: new Date(end).getFullYear(),
    };
  }

  const months = [];

  let fromMonth = startData.month;
  let fromYear = startData.year;

  while (fromMonth !== endData.month + 1 || fromYear !== endData.year) {
    months.push({ month: fromMonth, year: fromYear });

    fromMonth += 1;
    if (fromMonth === 13) {
      fromMonth = 1;
      fromYear += 1;
    }
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

export default useChartData;
