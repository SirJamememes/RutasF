import * as XLSX from 'xlsx';
import { useState } from 'react';
import { validarFrecuencia, cargarLocalesPendientes } from '../api/rutasApi';

function UploadExcel({ onLocalesCargados }) {
  const [localesEnFrecuencia, setLocalesEnFrecuencia] = useState([]);
  const [fueraFrecuencia, setFueraFrecuencia] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet);
      const codigos = json.map(row => row.codigo_local?.toString());

      // Aquí puedes definir la fecha de carga (ej. hoy)
      const payload = {
        codigosLocales: codigos,
        fechaCarga: new Date().toISOString().split("T")[0], // yyyy-mm-dd
      };

      validarFrecuencia(payload)
        .then((res) => {
          setLocalesEnFrecuencia(res.data.enFrecuencia);
          setFueraFrecuencia(res.data.fueraFrecuencia);
          const codigosValidos = res.data.enFrecuencia.map(l => l.codigo);
          cargarLocalesPendientes(codigosValidos);
          onLocalesCargados(codigosValidos);
        })
        .catch((err) => {
          alert("Error al validar frecuencia.");
          console.error(err);
        });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2>Subir Excel de carga</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {localesEnFrecuencia.length > 0 && (
        <>
          <h3>Locales en frecuencia</h3>
          <ul>
            {localesEnFrecuencia.map((l, i) => (
              <li key={i}>{l.codigo} - {l.nombre}</li>
            ))}
          </ul>
        </>
      )}

      {fueraFrecuencia.length > 0 && (
        <>
          <h3>Locales fuera de frecuencia</h3>
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
