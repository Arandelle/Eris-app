import { Linking } from "react-native";

const openLink = (value, type) => {
  if (type === "phone") {
    Linking.openURL(`tel:${value}`);
  } else if (type === "email") {
    Linking.openURL(`mailto:${value}`);
  } else if (type === "links") {
    Linking.openURL(value);
  }
};

export default openLink;
