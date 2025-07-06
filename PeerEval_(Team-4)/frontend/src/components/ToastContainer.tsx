// import React from "react";
// import { createPortal } from "react-dom";
// import ToastComponent from "./Toast";
// import { useToast } from "../hooks/useToast";

// const ToastContainer: React.FC = () => {
//   const { toasts, removeToast } = useToast();

//   // Create portal to render toasts at document body level
//   return createPortal(
//     <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
//       {toasts.map((toast) => (
//         <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
//       ))}
//     </div>,
//     document.body
//   );
// };

// export default ToastContainer;

import React from "react";
import { createPortal } from "react-dom";
import ToastComponent from "./Toast";
import { useToast } from "../hooks/useToast";

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Create portal to render toasts at document body level
  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
