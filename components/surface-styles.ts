/**
 * Shared glassmorphism surface tokens so every section card, floating pill,
 * inset panel, and modal uses identical translucency across Light and Dark modes.
 */

const PILL_BASE =
  "bg-white/45 dark:bg-zinc-900/45 backdrop-blur-xl border border-black/10 dark:border-white/15";

const INSET_BASE =
  "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10";

export const SURFACE = {
  /** Shared sizing-agnostic glass framing & blur for primary section cards. */
  cardFrame:
    "backdrop-blur-md md:backdrop-blur-xl border transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out",
  /** Primary section card resting state (45% fill -> 65% hover in both Light & Dark). */
  cardRest:
    "bg-white/45 dark:bg-zinc-900/45 border-black/10 dark:border-white/10 hover:bg-white/65 dark:hover:bg-zinc-900/65",
  /** Primary section card mobile-scroll focus state (75% fill in both Light & Dark). */
  cardFocus: "bg-white/75 dark:bg-zinc-900/75",
  /** Primary section card cross-highlighted state (85% fill in both Light & Dark). */
  cardHighlight: "bg-white/85 dark:bg-zinc-900/85",

  /** Floating navigation container shell (45% fill in both Light & Dark). */
  pillBase: PILL_BASE,
  /** Interactive floating buttons, social circles, and chips (45% -> 65% hover). */
  pillInteractive: `${PILL_BASE} hover:bg-white/65 dark:hover:bg-zinc-900/65`,

  /** Nested panels inside cards (chat preview, vault panel, form fields, tag chips). */
  inset: INSET_BASE,
  /** Interactive nested rows, pipeline steps, and icon buttons (5% -> 10% hover). */
  insetInteractive: `${INSET_BASE} hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20`,

  /** Modals, drawers, and compact overlaid badges (85% fill in both Light & Dark). */
  modal:
    "bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-black/10 dark:border-white/15",
  /** Fullscreen modal backdrop scrim. */
  backdrop: "bg-black/40 dark:bg-black/65 backdrop-blur-md",
} as const;

/** Matching RGBA values for inline-styled components (Experience timeline cards & icons). */
export const SURFACE_RGBA = {
  cardRest: {
    light: "rgba(255, 255, 255, 0.45)",
    dark: "rgba(24, 24, 27, 0.45)",
  },
  cardHover: {
    light: "rgba(255, 255, 255, 0.65)",
    dark: "rgba(24, 24, 27, 0.65)",
  },
  cardFocus: {
    light: "rgba(255, 255, 255, 0.75)",
    dark: "rgba(24, 24, 27, 0.75)",
  },
  iconCircle: {
    light: "rgba(255, 255, 255, 0.85)",
    dark: "rgba(24, 24, 27, 0.85)",
  },
} as const;
