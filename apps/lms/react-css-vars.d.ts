/**
 * Allow CSS custom properties (e.g. --custom-bg) in React style prop.
 * React.CSSProperties does not include them by default.
 */
import "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
