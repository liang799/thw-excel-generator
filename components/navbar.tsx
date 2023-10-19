import {
	Box,
	Flex,
	Button,
	useDisclosure,
	useColorModeValue,
	Stack,
	useColorMode,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { SocialButton } from './social-button'
import { FaGithub } from 'react-icons/fa'


export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode()

	return (
		<>
			<Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
				<Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
					<Box>Excel Generator</Box>

					<Flex alignItems={'center'}>
						<Stack direction={'row'} spacing={7}>
							<SocialButton label='Github' href='https://github.com/liang799/thw-excel-generator' alignSelf='center'>
								<FaGithub />
							</SocialButton>

							<Button onClick={toggleColorMode}>
								{colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
							</Button>
						</Stack>
					</Flex>
				</Flex>
			</Box>
		</>
	)
}
