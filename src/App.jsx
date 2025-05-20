import { useState } from 'react';
import UploadExcel from './components/UploadExcel';

function App() {
  const [locales, setLocales] = useState([]);

  return (
    <div>
      <h1>Generador de Rutas</h1>
      <UploadExcel onLocalesCargados={setLocales} />
    </div>
  );
}

export default App;
