export const handleDateFormating = (date: Date | string) => {
  const currentDate = new Date(date);
  const adjustedDate = new Date(
    currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000
  );
  return adjustedDate.toLocaleString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function formatDateTimeToBrazilian(date: Date | string) {

  const datePart = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const timePart = new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `${datePart} ${timePart}`;

}

export const handleExpiration = (vencimento: Date) => {
  const currentDate = new Date();
  const processDate = new Date(vencimento);
  currentDate.setDate(currentDate.getDate());
  if (processDate < currentDate) return true;
  return false;
};
