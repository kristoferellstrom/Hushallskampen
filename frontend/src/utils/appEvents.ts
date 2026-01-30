const EVENT_NAME = "app:data-updated";

export const emitDataUpdated = () => {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
};

export const onDataUpdated = (handler: () => void) => {
  const listener = () => handler();
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
};
