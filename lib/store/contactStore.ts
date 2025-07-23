import { create } from "zustand";

type ContactForm = {
  email: string;
  name: string;
  message: string;
};

type ContactState = {
  general: ContactForm;
  store: ContactForm;
  subject: string;
  setContact: (tab: "general" | "store", data: ContactForm) => void;
  setSubject: (subject: string) => void;
  resetContact: () => void;
};

export const useContactStore = create<ContactState>((set) => ({
  general: { email: "", name: "", message: "" },
  store: { email: "", name: "", message: "" },
  subject: "",
  setContact: (tab, data) =>
    set((state) => ({ ...state, [tab]: data })),
  setSubject: (subject) =>
    set((state) => ({ ...state, subject })),
  resetContact: () =>
    set({
      general: { email: "", name: "", message: "" },
      store: { email: "", name: "", message: "" },
      subject: "",
    }),
}));