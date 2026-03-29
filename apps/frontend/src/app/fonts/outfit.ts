// app/fonts/outfit.ts - Kidpen Display Font
import { Outfit } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});
