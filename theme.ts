// Backwards-compat shim — all tokens now live in theme/
export { default } from "./theme/index";
export { useAppTheme } from "./theme/index";
export {
  colors,
  spacing,
  radii,
  sizes,
  fontSizes,
  fontWeights,
  lineHeights,
  textPresets,
  shadows,
} from "./theme/index";
export type { ColorToken, SpacingToken, RadiiToken, ShadowToken, AppTheme } from "./theme/index";
