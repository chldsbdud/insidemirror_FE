import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

function BottomNavWrapper() {
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 디버깅용 콘솔

  if (location.pathname.startsWith("/mobile") || windowWidth <= 400) {
    return null;
  }

  return <BottomNav />;
}

export default BottomNavWrapper;
