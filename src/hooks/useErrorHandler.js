import { useState, useCallback } from "react";

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((errorObj, customMessage = null) => {
    let message = customMessage;

    if (!message) {
      if (typeof errorObj === "string") {
        message = errorObj;
      } else if (errorObj?.message) {
        message = errorObj.message;
      } else if (errorObj?.error_description) {
        message = errorObj.error_description;
      } else {
        message = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      }
    }

    setError(message);
    console.error("Error:", errorObj, message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error,
  };
};
