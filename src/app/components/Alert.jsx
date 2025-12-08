import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiXCircle,
  FiX,
} from "react-icons/fi";

const typeStyles = {
  success: {
    icon: <FiCheckCircle className="text-green-600 text-xl" />,
    border: "border-green-500",
    title: "Success!",
  },
  error: {
    icon: <FiXCircle className="text-red-600 text-xl" />,
    border: "border-red-500",
    title: "Error!",
  },
  warning: {
    icon: <FiAlertTriangle className="text-yellow-600 text-xl" />,
    border: "border-yellow-500",
    title: "Alert!",
  },
  info: {
    icon: <FiInfo className="text-blue-600 text-xl" />,
    border: "border-blue-500",
    title: "Info!",
  },
};

export default function Alert({
  type = "info",
  message,
  onClose,
  autoClose = true,
  delay = 3000,
}) {
  useEffect(() => {
    if (autoClose) {
      const timeout = setTimeout(() => onClose(), delay);
      return () => clearTimeout(timeout);
    }
  }, [autoClose, delay, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div
            className={`bg-white shadow-md rounded-lg min-w-[320px] max-w-[450px] p-4 border-l-4 flex items-start gap-3 ${typeStyles[type].border}`}
          >
            {typeStyles[type].icon}

            <div className="flex flex-col -mt-1 text-sm text-gray-700">
              <span className="font-semibold">{typeStyles[type].title}</span>
              <span className="opacity-90">{message}</span>
            </div>

            <button
              className="ml-auto text-gray-400 hover:text-gray-600 transition"
              onClick={onClose}
            >
              <FiX />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
