import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from "react";

type StatiticsFiltersContextType = {
    isMinDate?: string | undefined;
    setContextMinDate: Dispatch<SetStateAction<string | undefined>>;
    isMaxDate?: string | undefined;
    setContextMaxDate: Dispatch<SetStateAction<string | undefined>>;
    ContinuePage: boolean
    setContinuePage: Dispatch<SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
};

const StatisticsFiltersContext = createContext({} as StatiticsFiltersContextType);

export const StatiticsFiltersProvider = ({ children }: { children: ReactNode }) => {
  const [isMinDate, setContextMinDate] = useState<string>();
  const [isMaxDate, setContextMaxDate] = useState<string>();
  const [ContinuePage, setContinuePage] = useState<boolean>(false);


  return (
    <StatisticsFiltersContext.Provider
      value={{
        isMinDate,
        isMaxDate,
        ContinuePage,
        setContextMinDate,
        setContextMaxDate,
        setContinuePage,
      }}
    >
      {children}
    </StatisticsFiltersContext.Provider>
  );
};

export function useStatisticsFilters() {
  const context = useContext(StatisticsFiltersContext);

  return context;
}