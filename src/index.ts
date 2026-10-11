import './styles.css';

const app = document.getElementById('app');

if (!app) {
  throw new Error('Root element #app not found');
}

const heading = document.createElement('h1');
heading.textContent = 'Hello, World!';
app.appendChild(heading);
