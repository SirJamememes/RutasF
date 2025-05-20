import * as XLSX from 'xlsx';
import { useState } from 'react';
import { validarFrecuencia, cargarLocalesPendientes } from '../api/rutasApi';

function UploadExcel({ onLocalesCargados }) {
  const [fechaCarga, setFechaCarga] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0]; // formato yyyy-mm-dd
  });

  const [localesEnFrecuencia, setLocalesEnFrecuencia] = useState([]);
  const [fueraFrecuencia, setFueraFrecuencia] = useState([]);
  const [fechaEntrega, setFechaEntrega] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet);
      if (json.length === 0) return;

      // Detecta la primera columna como código
      const primerCampo = Object.keys(json[0])[0];
      const codigos = json
        .map(row => row[primerCampo]?.toString().trim())
        .filter(Boolean);

      // Fecha de entrega = fechaCarga + 2 días
      const entrega = new Date(fechaCarga);
      entrega.setDate(entrega.getDate() + 2);
      setFechaEntrega(entrega.toISOString().split("T")[0]);

      const payload = {
        codigosLocales: codigos,
        fechaCarga: fechaCarga,
      };

      validarFrecuencia(payload)
        .then((res) => {
          const enFrecuencia = res.data.enFrecuencia;
          const fueraFrecuencia = res.data.fueraFrecuencia;

          setLocalesEnFrecuencia(enFrecuencia);
          setFueraFrecuencia(fueraFrecuencia);

          const codigosValidos = enFrecuencia.map(l => l.codigo);
          cargarLocalesPendientes(codigosValidos);
          onLocalesCargados(codigosValidos);
        })
        .catch((err) => {
          alert("❌ Error al validar frecuencia.");
          console.error(err);
        });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2>Subir Excel de carga</h2>

      <label>Fecha de carga: </label>
      <input
        type="date"
        value={fechaCarga}
        onChange={(e) => setFechaCarga(e.target.value)}
        style={{ marginBottom: '1rem', display: 'block' }}
      />

      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {fechaEntrega && (
        <p>📦 Fecha estimada de entrega: <strong>{fechaEntrega}</strong></p>
      )}

      {localesEnFrecuencia.length > 0 && (
        <>
          <h3>✅ Locales en frecuencia</h3>
          <ul>
            {localesEnFrecuencia.map((l, i) => (
              <li key={i}>{l.codigo} - {l.nombre}</li>
            ))}
          </ul>
        </>
      )}

      {fueraFrecuencia.length > 0 && (
        <>
          <h3>❌ Locales fuera de frecuencia</h3>
          <ul>
            {fueraFrecuencia.map((l, i) => (
              <li key={i}>{l.codigo} - {l.nombre}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default UploadExcel;
