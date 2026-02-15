export type TipStatus = "pending" | "paid" | "failed";

export type TipInput = {
  userId: string;
  targetType: "dm" | "board";
  targetId: string;
  amount: number;
  currency: string;
};

export type TipRecord = {
  id: string;
  userId: string;
  targetType: "dm" | "board";
  targetId: string;
  amount: number;
  currency: string;
  status: TipStatus;
};
