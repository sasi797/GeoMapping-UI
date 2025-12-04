import { jwtDecrypt } from "jose";

const useDecrypt = () => {
  const decrypt = async (jwt) => {
    try {
      const secret = new TextEncoder().encode(
        process.env.NEXT_PUBLIC_ENCRYPTION_SECRET
      );
      const { payload } = await jwtDecrypt(jwt, secret);
      return payload;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  };

  return { decrypt };
};

export default useDecrypt;
