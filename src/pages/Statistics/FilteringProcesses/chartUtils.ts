export default (processes: Process[], start: Date, end: Date) => {
  const diff = monthDiff(start, end);

  const months = [];
  months.push({ month: start.getMonth() + 1, year: start.getFullYear() });
  for (let i = 0; i < diff - 1; i += 1) {
    const date = start;
    date.setMonth(date.getMonth() + 1);
    months.push({ month: date.getMonth() + 1, year: date.getFullYear() });
  }

  const archived = getStatusMonthly(processes, months, "archived");
  const finished = getStatusMonthly(processes, months, "finished");

  return [months, archived, finished];
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
