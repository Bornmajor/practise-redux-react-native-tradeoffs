import { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { useTheme } from "@/hooks/use-theme";

interface InputTextProps extends TextInputProps {
    value: string;
    setValue: (text: string) => void;
}

const InputText = ({
    value,
    setValue,
    style,
    ...rest
}: InputTextProps) => {
    const theme = useTheme();
    const [focused, setFocused] = useState(false);

    return (
        <TextInput
            value={value}
            onChangeText={setValue}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholderTextColor={theme.textSecondary}
            style={[
                styles.input,
                {
                    color: theme.text,
                    borderColor: focused ? "#3c87f7" : theme.textSecondary,
                },
                style,
            ]}
            {...rest}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 48,
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 16,
    },
});

export default InputText;