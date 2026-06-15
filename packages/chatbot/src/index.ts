// Expose the widget and the store to your main app
export { AssistantWidget } from './components/AssistantWidget';
export { useWidgetStore } from './store/useWidgetStore';
// Re‑export the API utilities so other packages can import them via the workspace alias
export { ChatbotAPI } from './lib/api';