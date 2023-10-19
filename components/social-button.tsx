import {
	ButtonProps,
  chakra,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react'

type SocialButtonProps = ButtonProps & {
	href: string;
	label: string;
}

export const SocialButton = ({ label, href, ...props}: SocialButtonProps) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
			{...props}
			>
      <VisuallyHidden>{label}</VisuallyHidden>
      {props.children}
    </chakra.button>
  )
}