import { useCallback, useRef, useState } from "react";

export const useBooleanState = (initialValue: boolean) => {
  const [value, setValue] = useState(initialValue);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return [value, setTrue, setFalse] as [boolean, () => void, () => void];
};

export const useToggleState = (initialValue: boolean) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(!value), [value]);
  return [value, toggle] as [boolean, () => void];
};

export const useRenderVersion = (): [number, () => void] => {
  const [version, setVersion] = useState(0);
  const incrementVersion = useCallback(() => {
    setVersion((prevVersion) => prevVersion + 1);
  }, []);
  return [version, incrementVersion];
};

export const useSyncedRef = <T>(initialValue: T) => {
  const ref = useRef(initialValue);
  ref.current = initialValue;
  return ref;
};
