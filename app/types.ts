export type GroceryItem = {
  _id: string;
  name: string;
  image_url: string;
  size?: string;
  price?: number | string;
  source?: string;
  category?: string;
};

export type GroceryDocument = Omit<GroceryItem, "_id">;

export type AppUser = {
  id?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile?: string;
};

export type ModalAction = "login" | "signup";

export type ToggleModal = (action: ModalAction) => void;
