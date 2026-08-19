import { Pressable, Text, TextInput, View } from "react-native";
import { mobileStyles } from "./mobile-styles";

type SessionLoginCardProps = {
  email: string;
  password: string;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
};

export const SessionLoginCard = ({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  onSubmit,
}: SessionLoginCardProps) => {
  return (
    <View style={mobileStyles.card}>
      <Text style={mobileStyles.sectionTitle}>Sesion</Text>
      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={mobileStyles.input}
      />
      <TextInput
        value={password}
        onChangeText={onChangePassword}
        placeholder="Password"
        secureTextEntry
        style={mobileStyles.input}
      />
      <Pressable onPress={onSubmit} style={mobileStyles.primaryButton}>
        <Text style={mobileStyles.buttonText}>Iniciar sesion</Text>
      </Pressable>
    </View>
  );
};
