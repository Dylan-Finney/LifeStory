import {createContext, useState, useContext} from 'react';

const ModalContext = createContext();

export const ModalProvider = ({children}) => {
  const [modalState, setModalState] = useState({
    isVisible: false,
    type: null,
  });

  return (
    <ModalContext.Provider value={{modalState, setModalState}}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
