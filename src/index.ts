import './styles.css';
import { App } from './ui/App';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Root element #app not found');
}

const app = new App();
app.init();
root.appendChild(app.root);
