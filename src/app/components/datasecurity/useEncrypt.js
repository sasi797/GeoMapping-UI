import { EncryptJWT } from "jose";

const useEncrypt = () => {
  const encrypt = async (payload) => {
    try {
      const secret = new TextEncoder().encode(
        process.env.NEXT_PUBLIC_ENCRYPTION_SECRET
      );
      return await new EncryptJWT(payload)
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .encrypt(secret);
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  };

  return { encrypt };
};

export default useEncrypt;
