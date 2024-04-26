import { AppsConfig } from '@scalprum/core';
import ScalprumProvider, { ScalprumComponent } from '@scalprum/react-core';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const config: AppsConfig = {
  landing: {
    name: 'landing',
    manifestLocation: 'http://localhost:8003/apps/landing/fed-mods.json',
  }
}

const App = () => {
  return (
    <BrowserRouter>
      <ScalprumProvider pluginSDKOptions={{
        // pluginLoaderOptions: {
        //   transformPluginManifest: (manifest) => {
        //     return {
        //       ...manifest,
        //       baseURL: 'http://localhost:8003' + manifest.baseURL
        //     }
        //   },
        // }
      }} config={config}>
        <div>
          <h1>Hello World</h1>
        </div>
        <ScalprumComponent scope="landing" module="./EdgeWidget" />
      </ScalprumProvider>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if(!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);
