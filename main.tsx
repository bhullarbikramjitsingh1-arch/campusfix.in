import {createRoot} from 'react-dom/client';
import CampusApp from './components/campus/app';
import {AppearanceProvider} from './components/campus/appearance';
import './style.css';
createRoot(document.getElementById('root')!).render(<AppearanceProvider><CampusApp/></AppearanceProvider>);
