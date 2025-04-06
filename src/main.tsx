
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Failed to find the root element");
} else {
  try {
    document.title = "HUkie - Dating App";
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Error rendering the app:", error);
  }
}

