import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* Wrap the children in a div with a unique key */}
      <div key={location.key}>
        {children}
      </div>
    </AnimatePresence>
  );
};

export default Layout;
