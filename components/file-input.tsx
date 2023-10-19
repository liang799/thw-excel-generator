import { InputProps, useMultiStyleConfig, Input } from "@chakra-ui/react";

export const FileUpload = (props: InputProps) => {

  const styles = useMultiStyleConfig("Button", { colorScheme: 'teal', variant: "outline" });

  return (
    <Input
      type="file"
      sx={{
        "::file-selector-button": {
          mr: 2,
          ...styles,
        },
      }}
      {...props}
    />
  );
};