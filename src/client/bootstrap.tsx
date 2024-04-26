import { AppsConfig, getModule } from '@scalprum/core';
import ScalprumProvider, { ScalprumComponent, ScalprumComponentProps, useLoadModule, useModule } from '@scalprum/react-core';
import axios from 'axios';
import { PropsWithChildren, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const config: AppsConfig = {
  landing: {
    name: 'landing',
    manifestLocation: 'http://localhost:8003/apps/landing/fed-mods.json',
  }
}

type Service = {
  host: string;
}

type FetchConfig = {
  service: object;
  pathname: string;
};

type ResponseProcessor = (response: unknown) => any;

type FetchDataReturn = {
  request: FetchConfig | FetchConfig[];
  responseProcessor: ResponseProcessor;
};


type FetchData = (services: {[key: string]: Service}) => FetchDataReturn;

async function getTemplateData(configs: FetchConfig[], responseProcessor: ResponseProcessor) {
  console.log({ configs })
  const tasks = configs.map(async (config) => {
    return axios.get(config.pathname).then(({ data }) => data)
  })
  const results = await Promise.all(tasks);
  return responseProcessor(results);
}

// clowder should populate this
const servicesMock: {[key: string]: Service} = {
  foo: {
    host: 'bar'
  },
  'chrome-service': {
    host: 'chrome-service'
  }
}

type AsyncState = {
  loading: boolean;
  error: unknown;
  data: any;
}

const MetadataWrapper = () => {
  const [asyncState, setAsyncState] = useState<AsyncState>({ loading: true, error: null, data: null });
  async function getFetchMetadata() {
    try {
      const fn = await getModule<FetchData | undefined>('landing', './EdgeWidget', 'fetchData')
      if(!fn) {
        setAsyncState({ loading: false, error: null, data: null });
        return;
      }
      const { request, responseProcessor } = fn(servicesMock);
      let configs: FetchConfig[] = Array.isArray(request) ? request : [request];
      const data = await getTemplateData(configs, responseProcessor);

      setAsyncState({ loading: false, error: null, data });
    } catch (error) {
      setAsyncState({ loading: false, error, data: null });
    }
  }
  useEffect(() => {    
      getFetchMetadata();
  }, [])
  const props: ScalprumComponentProps<{}, {asyncData: AsyncState}> = {
    asyncData: asyncState,
    scope: 'landing',
    module: './EdgeWidget'
  }
  return (
    <ScalprumComponent {...props} />
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <ScalprumProvider pluginSDKOptions={{
      }} config={config}>
        <div>
          <h1>Hello World</h1>
        </div>
        <MetadataWrapper/>
      </ScalprumProvider>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if(!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);
