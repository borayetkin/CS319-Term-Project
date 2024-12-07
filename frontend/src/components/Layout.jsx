import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
};

export default Layout; 