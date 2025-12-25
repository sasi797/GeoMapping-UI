import { useState } from "react";
import { postApi, ApiError } from "../../utils/postApiMethod";

const useLogin = () => {
  const [signInResponse, setSignInResponse] = useState({});
  const [signInLoading, setSignInLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const login = async (url, payload, onSuccess) => {
    setSignInLoading(true);
    try {
      const response = await postApi(url, payload);

      if (response?.statusCode === 200) {
        // console.log("response", response);
        const firstName = response?.first_name;
        const lastName = response?.last_name;

        setSignInResponse(response);
        sessionStorage.setItem("authtoken", response?.token);
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            initial: firstName?.charAt(0)?.toUpperCase(),
          })
        );
        onSuccess?.();

        setSnackbar({
          open: true,
          message: response?.message || "Login successful",
          severity: "success",
        });
      }
    } catch (error) {
      let errorMessage = "Login failed";

      if (error instanceof ApiError) {
        errorMessage = error?.message || "Failed";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSignInLoading(false);
    }
  };

  return {
    login,
    signInLoading,
    signInResponse,
    snackbar,
    closeSnackbar,
  };
};

export default useLogin;
