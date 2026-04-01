import { create } from 'zustand';

interface PricingModalStore {
  isOpen: boolean;
  creditsExhausted: boolean;
  returnUrl?: string;
  openPricingModal: (options?: { creditsExhausted?: boolean; returnUrl?: string }) => void;
  openModal: () => void;
  closePricingModal: () => void;
}

export const usePricingModalStore = create<PricingModalStore>((set) => ({
  isOpen: false,
  creditsExhausted: false,
  returnUrl: undefined,
  openPricingModal: (_options?) => {},
  openModal: () => {},
  closePricingModal: () => set({ isOpen: false }),
}));
