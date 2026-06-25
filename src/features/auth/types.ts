export type AuthFormState = {
  message: string | null;
  status: "error" | "idle" | "success";
};

export const initialAuthFormState: AuthFormState = {
  message: null,
  status: "idle",
};
