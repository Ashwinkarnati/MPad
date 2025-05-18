"use client";
import { Accordion, Box, Button, Divider, Group, List, Paper, Stack, Text, Title } from '@mantine/core';
import { IconCalculator, IconEraser, IconPhoto, IconPencil, IconArrowBack, IconArrowForward, IconTextSize, IconCircle, IconSquare, IconLine } from '@tabler/icons-react';

export default function HowToUsePage() {
  return (
    <Box p="md" mx="auto" maw={800}>
      <Title order={1} ta="center" mb="xl">
        📝 MPad - How to Use Guide
      </Title>

      <Paper p="lg" shadow="sm" withBorder>
        <Title order={2} mb="sm">Getting Started</Title>
        <Text mb="md">
          Welcome to MPad, your AI-powered math calculator! Follow these instructions to get the most out of the app.
        </Text>

        <Accordion variant="contained">
          <Accordion.Item value="tools">
            <Accordion.Control icon={<IconPencil size={18} />}>Drawing & Writing Tools</Accordion.Control>
            <Accordion.Panel>
              <List spacing="sm">
                <List.Item icon={<IconPencil />}>
                  <Text fw={500}>Pen Tool</Text>
                  <Text size="sm">Draw equations freehand. Adjust brush size and color from the toolbar.</Text>
                </List.Item>
                <List.Item icon={<IconEraser />}>
                  <Text fw={500}>Eraser Tool</Text>
                  <Text size="sm">Remove mistakes by clicking the eraser icon. Adjust size as needed.</Text>
                </List.Item>
                <List.Item icon={<IconTextSize />}>
                  <Text fw={500}>Text Tool</Text>
                  <Text size="sm">Type math expressions by clicking the "T" icon and placing text on canvas.</Text>
                </List.Item>
                <List.Item icon={<IconPhoto />}>
                  <Text fw={500}>Image Upload</Text>
                  <Text size="sm">Upload photos of handwritten math problems for the AI to analyze.</Text>
                </List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>


          <Accordion.Item value="solving">
            <Accordion.Control icon={<IconCalculator size={18} />}>Solving Math Problems</Accordion.Control>
            <Accordion.Panel>
              <List type="ordered" spacing="xs">
                <List.Item>Draw or type your equation (e.g., 2x + 5 = 15)</List.Item>
                <List.Item>Click the "Calculate" button</List.Item>
                <List.Item>View the solution in LaTeX format (e.g., x = 5)</List.Item>
                <List.Item>Drag results to reposition them on canvas</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Divider my="lg" />

        <Title order={3} mb="sm">Tips & Tricks</Title>
        <List spacing="xs">
          <List.Item>✅ Write clearly when using the pen tool</List.Item>
          <List.Item>✅ Use standard math symbols (+, -, ×, ÷, =, √)</List.Item>
          <List.Item>❌ Avoid overlapping drawings that may confuse the AI</List.Item>
          <List.Item>❌ Don't write too small for best recognition</List.Item>
        </List>

        <Divider my="lg" />

        <Group position="center" className='flex'>
          <Button variant="filled" size="md" component="a" href="/">
            Back to MPad Calculator
          </Button>
          <h1><i>Created by <b>Karnati Ashwin</b> with ❤️</i></h1>
        </Group>
      </Paper>
    </Box>
  );
}