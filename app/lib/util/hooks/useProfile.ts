import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/app/lib/util/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface UserProfile {
  email: string;
  fullName: string;
  title: string;
  location: string;
  socialName: string;
}

export function useProfile() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    staleTime: 1000 * 60 * 5, // Keep profile fresh for 5 mins
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error("Not logged in");

      return {
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "",
        title: user.user_metadata?.title || "",
        location: user.user_metadata?.location || "",
        socialName: user.user_metadata?.social_display_name || "John Doe",
      } as UserProfile;
    },
  });

  // Optimistic Profile Update
  const updateProfile = useMutation({
    mutationFn: async (newData: Partial<UserProfile>) => {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: newData.fullName,
          title: newData.title,
          location: newData.location,
          social_display_name: newData.socialName,
        },
      });
      if (error) throw error;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["user-profile"] });

      const previousProfile = queryClient.getQueryData<UserProfile>([
        "user-profile",
      ]);

      if (previousProfile) {
        queryClient.setQueryData(["user-profile"], {
          ...previousProfile,
          ...newData,
        });
      }
      return { previousProfile };
    },
    onError: (err: any, newProfile, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["user-profile"], context.previousProfile);
      }
      toast.error("Update failed", { description: err.message });
    },
    onSettled: () => {
      // Re-fetch to guarantee sync, including the layout data that depends on the name
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["layout-data"] });
    },
    onSuccess: () => {
      toast.success("Profile saved successfully");
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // queryClient.clear();
      toast.success("Logged out successfully");
      // router.replace("/auth/login");
      window.location.href = "/auth/login";
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: (data: Partial<UserProfile>) => updateProfile.mutate(data),
    isSaving: updateProfile.isPending,
    logout: () => logout.mutate(),
    isLoggingOut: logout.isPending,
  };
}
