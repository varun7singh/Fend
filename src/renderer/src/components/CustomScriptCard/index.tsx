import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core'
import classes from './styles.module.css'
import { useNavigate } from 'react-router-dom'
import { MyScriptItem } from '@renderer/store/useScriptStore'

interface CustomScriptCardProps {
  script: MyScriptItem
}

function Chip({ children }: { children: string }): JSX.Element {
  return (
    <Box bg="#F6F6F6" p="0.125rem 0.5rem" style={{ display: 'inline-block', borderRadius: '1rem' }}>
      <Text fz="0.75rem" fw={500} c="#475467">
        {children}
      </Text>
    </Box>
  )
}
export default function CustomScriptCard({ script }: CustomScriptCardProps): JSX.Element {
  const navigate = useNavigate()
  return (
    <>
      <Paper className={classes.card} p="xl">
        <Stack justify="flex-start" gap="0.75rem">
          <Text c="#101828" fz="1.125rem" fw={600} lh="1.50rem">
            {script.scriptName}
          </Text>
          <Group gap="0.5rem">
            {script.myConfig.map((config) => (
              <Chip key={config.module}>{config.module.toUpperCase()}</Chip>
            ))}
          </Group>
          <Button
            className={classes.btn}
            c="rgba(0, 0, 0, 0.90)"
            variant="outline"
            size="md"
            mt="0.5rem"
            fullWidth
            onClick={() => navigate(`/groups?custom=true&scriptName=${script.scriptName}`)}
          >
            Run Script
          </Button>
        </Stack>
      </Paper>
    </>
  )
}