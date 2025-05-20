import { useState } from 'react';
import UploadExcel from './components/UploadExcel';
import SugerirRuta from './components/SugerirRuta';

function App() {
  const [localesCargados, setLocalesCargados] = useState([]);
  const [mostrarSugerencia, setMostrarSugerencia] = useState(false);

  const handleLocalesCargados = (codigos) => {
    setLocalesCargados(codigos);
    setMostrarSugerencia(true);
  };

  return (
    <div>
      <h1>Generador de Rutas</h1>
      <UploadExcel onLocalesCargados={handleLocalesCargados} />
      {mostrarSugerencia && <SugerirRuta onRutaConfirmada={() => setMostrarSugerencia(false)} />}
    </div>
  );
}

export default App;