// app/fonts/ibm-plex-sans-thai.ts - Kidpen Thai Body Font
import { IBM_Plex_Sans_Thai } from "next/font/google";

export const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex-thai",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
