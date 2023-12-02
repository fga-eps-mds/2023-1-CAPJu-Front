import { useState, useEffect, useCallback } from "react";
import moment from "moment";

interface useChartDataReturn {
  months: string[];
  archived: number[];
  finished: number[];
}

const useChartData = (
  processes: Process[],
  start: string,
  end: string
): useChartDataReturn => {
  console.log({ processes, start, end });

  const [months, setMonths] = useState([] as string[]);
  const [archived, setArchived] = useState([] as number[]);
  const [finished, setFinished] = useState([] as number[]);

  const getMonthRange = useCallback(() => {
    // // eslint-disable-next-line
    const now = new Date();
    const startDateISO = start
      ? new Date(start)
      : new Date(now.setFullYear(now.getFullYear() - 2));
    const endDateISO = end ? new Date(end) : new Date();

    const startDate = moment(startDateISO.toISOString());
    const endDate = moment(endDateISO.toISOString());
    const betweenMonths = [];

    if (startDate < endDate) {
      const date = startDate.startOf("month");

      while (date < endDate.endOf("month")) {
        betweenMonths.push(date.format("MM/YYYY"));
        date.add(1, "month");
      }
    }

    setMonths(betweenMonths);
  }, [start, end]);

  useEffect(() => {
    getMonthRange();
  }, [start, end]);

  useEffect(() => {
    if (months.length > 0 && processes.length > 0) {
      setArchived(getStatusMonthly(processes, months, "finished"));
      setFinished(getStatusMonthly(processes, months, "archived"));
    } else {
      setArchived([]);
      setFinished([]);
    }
  }, [months, processes]);

  return { months, archived, finished };
};

const getStatusMonthly = (
  processes: Process[],
  months: string[],
  status: string
) => {
  return months.map((date) => {
    const [month, year] = date.split("/");
    return processes.filter((process) => {
      const pDate = new Date(process.effectiveDate);
      return (
        pDate.getMonth() + 1 === parseInt(month, 10) &&
        pDate.getFullYear() === parseInt(year, 10) &&
        process.status === status
      );
    }).length;
  });
};

export default useChartData;
