import { StyleSheet } from "react-native";

export const mobileStyles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },
  screenContent: {
    padding: 20,
    gap: 12,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#10233d",
  },
  screenSubtitle: {
    color: "#4f6177",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbe3f0",
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#153b75",
  },
  infoTitle: {
    fontWeight: "700",
    color: "#1a4f9c",
  },
  bodyText: {
    color: "#2f4664",
  },
  mutedText: {
    color: "#5f7086",
  },
  itemText: {
    color: "#4d6079",
  },
  itemTitle: {
    fontWeight: "700",
    color: "#1b3153",
  },
  input: {
    borderWidth: 1,
    borderColor: "#c8d3e4",
    borderRadius: 8,
    padding: 10,
  },
  multilineInput: {
    minHeight: 74,
    textAlignVertical: "top",
  },
  multilineInputTall: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#153b75",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  successButton: {
    backgroundColor: "#1d7d46",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  errorText: {
    color: "#b52b27",
  },
  successText: {
    color: "#1d7d46",
  },
  listItemCard: {
    borderWidth: 1,
    borderColor: "#e4eaf4",
    borderRadius: 8,
    padding: 10,
  },
});
