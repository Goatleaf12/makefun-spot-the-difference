// Twin Skies — layout and rule constants. Everything the other files need to agree on
// (canvas size, where the two picture panels sit, how scoring and the clock behave)
// lives here and nowhere else, so the frame the player sees is the frame the
// screenshots were taken from.

/** The fixed logical size of the whole game frame, in pixels. */
export const VIEW = { width: 1280, height: 800 };

/** Height of the header band that carries the title, the counter and the clock. */
export const HEADER_HEIGHT = 68;

/**
 * The two picture panels: squares of PANEL.size, side by side, centred as a pair.
 * Panel 0 is the original picture, panel 1 the changed copy.
 */
export const PANEL = { size: 600, gap: 24, top: 92 };
export const PANEL_X = [
  (VIEW.width - (PANEL.size * 2 + PANEL.gap)) / 2,
  (VIEW.width - (PANEL.size * 2 + PANEL.gap)) / 2 + PANEL.size + PANEL.gap,
];

/** The footer band under the panels: hints, the message line and the key help. */
export const FOOTER_TOP = PANEL.top + PANEL.size + 14;

/** Scoring and clock rules, in one place so a balance change touches one file. */
export const RULES = {
  findPoints: 100, // a found difference
  streakStep: 10, // extra points per consecutive find without a miss
  missPenaltySeconds: 6, // a wrong click costs this much clock
  hintCost: 30, // points a hint costs, on top of spending the hint itself
  hintsPerScene: 2,
  clearBonusPerSecond: 2, // leftover seconds turn into points when a scene is cleared
  lowTimeSeconds: 30, // the clock turns red below this
};

/** How long the player gets on each scene, in seconds, in scene order. */
export const SCENE_SECONDS = [150, 150, 180];

/** The magnifier's zoom and radius, in frame pixels. */
export const LOUPE = { zoom: 2, radius: 84 };
