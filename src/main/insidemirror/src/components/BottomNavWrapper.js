import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

const BottomNavWrapper = () => {
  const location = useLocation();
  return location.pathname !== "/mobile" ? <BottomNav /> : null;
};

export default BottomNavWrapper;
