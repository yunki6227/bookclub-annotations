export type CreateClubState = {
  message: string | null;
  status: "error" | "idle" | "success";
};

export const initialCreateClubState: CreateClubState = {
  message: null,
  status: "idle",
};
