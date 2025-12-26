import { colors } from "@/constants/theme";
import { TypoProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

const Typo: React.FC<TypoProps> = ({
  children,
  fontWeight = "400",
  color = colors.text,
  size = 16,
  style,
  textProps = {},
}) => {
  const textStyle: TextStyle = {
    fontSize: verticalScale(size),
    color,
    fontWeight,
  };

  return (
    <Text style={[textStyle, style]} {...textProps}>
      {children}
    </Text>
  );
};

export default Typo;

const styles = StyleSheet.create({});
