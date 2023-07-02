export const handleDateFormating = (date: Date | string) => {
  const currentDate = new Date(date);
  return currentDate.toLocaleString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const handleExpiration = (vencimento: Date) => {
  const currentDate = new Date();
  const processDate = new Date(vencimento);
  currentDate.setDate(currentDate.getDate());
  if (processDate < currentDate) return true;
  return false;
};
