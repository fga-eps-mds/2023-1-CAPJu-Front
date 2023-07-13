const defaultEmails = ["email@emaill.com", "email@email.com"];

export const handleVerifyInDefaultEmail = (email: string) => {
  return defaultEmails.includes(email);
};
