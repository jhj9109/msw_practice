import { useEffect, useState } from 'react';
import './App.css';
import axios, { AxiosResponse } from 'axios';

type AxiosMethods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

interface UrlObject {
  url: string;
  method: AxiosMethods;
  data: any;
}

interface Result {
  url: string;
  res?: AxiosResponse<any, any>;
}

interface AppBoxProps {
  urls: UrlObject[];
  result: Result;
  requestApi: (urlObj: UrlObject) => Promise<void>;
}

const AppBox = ({urls, result, requestApi}: AppBoxProps) => {
  return (
    <div className="App">
      <div className="top-section">
        <p>요청.</p>
        {
          urls.map((urlObj, i) =>
            <p key={i} onClick={() => requestApi(urlObj)}>{i}: {urlObj.url}</p>
          )
        }
      </div>
      <div className="bottom-section">
        <p>응답</p>
        <p>URL: {result.url}</p>
        <p>Status Code: {result.res?.status ?? ''}</p>
        <p>data: {JSON.stringify(result.res?.data) ?? ''}</p>
      </div>
    </div>
  );
}

const App = () => {
  const [result, setResult] = useState<Result>(() => ({url: ''}))
  const requestApi = async (urlObj: UrlObject) => {
    const { url, method, data } = urlObj
    const res = await axios({ url, method, data })
    setResult(() => ({url, res}))
  }
  const urls: UrlObject[] = [
    { url: "/api/products", method: 'get', data: null },
    { url: "/api/login", method: 'post', data: {username: "jhj"} },
  ]
  useEffect(() => {
    if (result.res) {
      console.log(result.res)
    }
  })
  return (
    <AppBox
      urls={urls}
      result={result}
      requestApi={requestApi}
    />
  );
}

export default App;
