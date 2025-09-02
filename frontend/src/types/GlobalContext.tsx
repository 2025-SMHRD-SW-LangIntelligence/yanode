import React, { createContext, useState, ReactNode, useContext } from "react";

interface GlobalContextType {
  globalValue: string;
  setGlobalValue: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [globalValue, setGlobalValue] = useState("http://localhost:8090");

  return (
    <GlobalContext.Provider value={{ globalValue, setGlobalValue }}>
      {children}
    </GlobalContext.Provider>
  );
};

// ✅ 커스텀 훅으로 편하게 가져다 쓰기
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within a GlobalProvider");
  return context;
};
