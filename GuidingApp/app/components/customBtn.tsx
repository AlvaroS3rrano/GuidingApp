import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomBtnProps {
  onPress: () => void;
  btnStyle?: ViewStyle;
  btnText: string;
}

const CustomBtn: React.FC<CustomBtnProps> = ({
  onPress,
  btnStyle = {},
  btnText
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ ...styles.button, ...btnStyle}}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>
        {btnText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height:34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderColor: 'lightgrey',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomBtn;
