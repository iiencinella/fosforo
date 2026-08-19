import { type ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, Text } from "react-native";
import { mobileStyles } from "./mobile-styles";

type MobileScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export const MobileScreen = ({
  title,
  subtitle,
  children,
}: MobileScreenProps) => {
  return (
    <SafeAreaView style={mobileStyles.screenBackground}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={mobileStyles.screenContent}>
        <Text style={mobileStyles.screenTitle}>{title}</Text>
        <Text style={mobileStyles.screenSubtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};
