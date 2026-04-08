import { useState, useRef } from "react";

interface KeystrokeEvent {
  timestamp: number;
  keyDownTime: number;
  keyUpTime: number;
  dwellTime: number;
  interKeyTime: number;
  keyType: "type" | "delete" | "space" | "enter" | "special";
}

export const useKeystroke = () => {
  const [data, setData] = useState<KeystrokeEvent[]>([]);
  const keyPressTimeRef = useRef<number | null>(null);
  const lastKeyReleaseTimeRef = useRef<number | null>(null);

  const getKeyType = (key: string): KeystrokeEvent["keyType"] => {
    if (key === "Backspace" || key === "Delete") return "delete";
    if (key === " ") return "space";
    if (key === "Enter") return "enter";
    if (key.length === 1 || /^[a-zA-Z0-9]$/.test(key)) return "type";
    return "special";
  };

  const handleKeyDown = (e: any) => {
    const keyDownTime = Date.now();
    keyPressTimeRef.current = keyDownTime;
    const interKeyTime = lastKeyReleaseTimeRef.current 
      ? keyDownTime - lastKeyReleaseTimeRef.current 
      : 0;
    const handleKeyUp = () => {
      if (keyPressTimeRef.current === null) return;

      const keyUpTime = Date.now();
      const dwellTime = keyUpTime - keyPressTimeRef.current;
      setData(prev => [...prev, {
        timestamp: keyDownTime,
        keyDownTime,
        keyUpTime,
        dwellTime,
        interKeyTime,
        keyType: getKeyType(e.key)
      }]);
      lastKeyReleaseTimeRef.current = keyUpTime;
      keyPressTimeRef.current = null;

      document.removeEventListener("keyup", handleKeyUp);
    };

    document.addEventListener("keyup", handleKeyUp, { once: true });
  };

  return { data, handleKeyDown };
};