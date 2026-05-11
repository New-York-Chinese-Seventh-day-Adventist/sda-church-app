import { Text, TextProps } from "./ThemedComponents";

export function MonoText(props: TextProps) {
  return (
    <Text {...props} style={[props.style, { fontFamily: "AdventSans" }]} />
  );
}
