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
    backgroundColor: '#3478f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomBtn;
