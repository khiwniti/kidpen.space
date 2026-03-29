// app/fonts/jetbrains-mono.ts - Kidpen Monospace Font
import { JetBrains_Mono } from "next/font/google";

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});
