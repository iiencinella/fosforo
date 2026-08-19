import { Text, View } from "react-native";
import { mobileStyles } from "./mobile-styles";

type ApiInfoCardProps = {
  endpointLabel: string;
  endpointValue: string;
  activeUserId: string;
};

export const ApiInfoCard = ({
  endpointLabel,
  endpointValue,
  activeUserId,
}: ApiInfoCardProps) => {
  return (
    <View style={mobileStyles.card}>
      <Text style={mobileStyles.infoTitle}>{endpointLabel}</Text>
      <Text style={mobileStyles.bodyText}>{endpointValue}</Text>
      <Text style={mobileStyles.mutedText}>Usuario activo: {activeUserId}</Text>
    </View>
  );
};
