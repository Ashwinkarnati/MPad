
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './globals.css';

export const metadata = {
  title: '🧮 MPad - AI Math Solver',
  description: 'Solve any math problem with AI-powered calculator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}