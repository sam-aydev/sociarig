import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resetPassword, updatePassword } from "@/app/lib/util/actions/auth";

export function usePasswordRecovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { push } = useRouter();

  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { error, success }: any = await resetPassword(formData);

      if (error) {
        toast.error("Request Failed", { description: error });
      } else if (success) {
        setIsSent(true);
        toast.success("Reset link sent!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error, route, success }: any = await updatePassword(formData);

      if (error) {
        toast.error("Update Failed", { description: error });
      } else if (success && route) {
        toast.success("Password updated successfully!");
        push(route);
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSent,
    setIsSent,
    handleResetRequest,
    handlePasswordUpdate,
  };
}