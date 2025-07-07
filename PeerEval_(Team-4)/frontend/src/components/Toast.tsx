import React, { useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.type !== "loading") {
      const duration = toast.duration || getDefaultDuration(toast.type);
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Animation duration
  };

  const getDefaultDuration = (type: ToastType): number => {
    switch (type) {
      case "success":
        return 4000;
      case "error":
        return 6000;
      case "warning":
        return 5000;
      case "info":
        return 4000;
      case "loading":
        return 0; // No auto-dismiss for loading
      default:
        return 4000;
    }
  };

  const getToastConfig = (type: ToastType) => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        titleColor: "text-emerald-800 dark:text-emerald-200",
        messageColor: "text-emerald-700 dark:text-emerald-300",
      },
      error: {
        icon: AlertCircle,
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        iconColor: "text-red-600 dark:text-red-400",
        titleColor: "text-red-800 dark:text-red-200",
        messageColor: "text-red-700 dark:text-red-300",
      },
      warning: {
        icon: AlertTriangle,
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
        iconColor: "text-amber-600 dark:text-amber-400",
        titleColor: "text-amber-800 dark:text-amber-200",
        messageColor: "text-amber-700 dark:text-amber-300",
      },
      info: {
        icon: Info,
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        titleColor: "text-blue-800 dark:text-blue-200",
        messageColor: "text-blue-700 dark:text-blue-300",
      },
      loading: {
        icon: Loader,
        bgColor: "bg-gray-50 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
        iconColor: "text-gray-600 dark:text-gray-400",
        titleColor: "text-gray-800 dark:text-gray-200",
        messageColor: "text-gray-700 dark:text-gray-300",
      },
    };
    return configs[type];
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isRemoving
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
        max-w-md w-full ${config.bgColor} border ${
        config.borderColor
      } rounded-lg shadow-lg
        p-4 pointer-events-auto flex items-start space-x-3
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon
          className={`w-5 h-5 ${config.iconColor} ${
            toast.type === "loading" ? "animate-spin" : ""
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold ${config.titleColor} mb-1`}>
            {toast.title}
          </p>
        )}
        <p className={`text-sm ${config.messageColor} leading-relaxed`}>
          {toast.message}
        </p>

        {/* Action Button */}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={`mt-2 text-xs font-medium ${config.iconColor} hover:underline focus:outline-none`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      {!toast.persistent && toast.type !== "loading" && (
        <button
          onClick={handleRemove}
          className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 focus:outline-none transition-opacity duration-200`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ToastComponent;
