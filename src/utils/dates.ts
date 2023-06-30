const handleDateFormating = (date: Date | string) => {
  const currentDate = new Date(date);
  return currentDate.toLocaleString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default handleDateFormating;
