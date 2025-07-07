import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Toast } from "../components/Toast.tsx";
interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string }
  | { type: "UPDATE_TOAST"; payload: { id: string; updates: Partial<Toast> } }
  | { type: "CLEAR_ALL" };

const initialState: ToastState = {
  toasts: [],
};

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === action.payload.id
            ? { ...toast, ...action.payload.updates }
            : toast
        ),
      };

    case "CLEAR_ALL":
      return {
        ...state,
        toasts: [],
      };

    default:
      return state;
  }
};

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  clearAll: () => void;
  // Convenience methods
  success: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;
  error: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;
  warning: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;
  info: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;
  loading: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const addToast = (toast: Omit<Toast, "id">): string => {
    const id = generateId();
    const newToast: Toast = { ...toast, id };
    dispatch({ type: "ADD_TOAST", payload: newToast });
    return id;
  };

  const removeToast = (id: string): void => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  };

  const updateToast = (id: string, updates: Partial<Toast>): void => {
    dispatch({ type: "UPDATE_TOAST", payload: { id, updates } });
  };

  const clearAll = (): void => {
    dispatch({ type: "CLEAR_ALL" });
  };

  // Convenience methods
  const success = (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ): string => {
    return addToast({ type: "success", message, ...options });
  };

  const error = (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ): string => {
    return addToast({ type: "error", message, ...options });
  };

  const warning = (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ): string => {
    return addToast({ type: "warning", message, ...options });
  };

  const info = (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ): string => {
    return addToast({ type: "info", message, ...options });
  };

  const loading = (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ): string => {
    return addToast({ type: "loading", message, persistent: true, ...options });
  };

  const promise = async <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    const loadingId = loading(options.loading);

    try {
      const result = await promise;
      removeToast(loadingId);

      const successMessage =
        typeof options.success === "function"
          ? options.success(result)
          : options.success;
      success(successMessage);

      return result;
    } catch (err) {
      removeToast(loadingId);

      const errorMessage =
        typeof options.error === "function"
          ? options.error(err)
          : options.error;
      error(errorMessage);

      throw err;
    }
  };

  const value: ToastContextType = {
    toasts: state.toasts,
    addToast,
    removeToast,
    updateToast,
    clearAll,
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

// Export the context for useToast hook
export { ToastContext };
