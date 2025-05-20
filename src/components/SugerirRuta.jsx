import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function SugerirRuta({ onRutaConfirmada }) {
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [sugerencias, setSugerencias] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [rutasConfirmadas, setRutasConfirmadas] = useState([]);
  const fechaCarga = "2025-05-20"; // Puedes recibirla como prop si lo deseas

  // Exportar Excel automáticamente cuando ya no hay locales
  useEffect(() => {
    if (!cargando && sugerencias.length === 0 && rutasConfirmadas.length > 0) {
      exportarExcel(rutasConfirmadas, fechaCarga);
    }
  }, [cargando, sugerencias]);

  const exportarExcel = (rutas, fechaCarga) => {
    const fechaEntrega = new Date(fechaCarga);
    fechaEntrega.setDate(fechaEntrega.getDate() + 2);

    const formatoFecha = (fecha) =>
      fecha.toISOString().split("T")[0].split("-").reverse().join("/");

    const hoja = [
      ["FECHA CARGA:", formatoFecha(new Date(fechaCarga))],
      ["FECHA ENTREGA:", formatoFecha(fechaEntrega)],
      ["", ""],
      ["LOCALES"],
      ...rutas.map((ruta) => [ruta.map((local) => local.codInterno).join("-")])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(hoja);
    XLSX.utils.book_append_sheet(wb, ws, "Programación");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const archivo = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(archivo, "RutasProgramadas.xlsx");
  };

  // Cargar sugerencias iniciales
  useEffect(() => {
    obtenerSugerencias();
  }, []);

  const obtenerSugerencias = async () => {
    setCargando(true);
    try {
      const res = await axios.get("http://localhost:8080/api/propuesta/sugerencias");
      setSugerencias(res.data || []);
      setIndiceActual(0);
      setMensaje("");
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al obtener sugerencias.");
    } finally {
      setCargando(false);
    }
  };

  const siguienteRuta = async () => {
    try {
      const rutaActual = sugerencias[indiceActual];
      const soloCodigos = rutaActual.map((local) => local.codigo);
      await axios.post("http://localhost:8080/api/propuesta/confirmar", soloCodigos);
      setRutasConfirmadas((prev) => [...prev, rutaActual]);
      setMensaje("✅ Ruta guardada. Mostrando siguiente...");

      // Obtener nuevas sugerencias tras guardar
      const nuevas = await axios.get("http://localhost:8080/api/propuesta/sugerencias");
      setSugerencias(nuevas.data || []);
      setIndiceActual(0);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar y continuar.");
    }
  };

  const regenerarRuta = () => {
    if (indiceActual < sugerencias.length - 1) {
      setIndiceActual(indiceActual + 1);
      setMensaje("↪ Mostrando otra coincidencia.");
    } else {
      setMensaje("⚠️ No hay más coincidencias para regenerar.");
    }
  };

  const rutaActual = sugerencias[indiceActual] || [];

  return (
    <div>
      <h2>Ruta sugerida</h2>
      {cargando ? (
        <p>Cargando ruta...</p>
      ) : rutaActual.length > 0 ? (
        <>
          <ul>
            {rutaActual.map((local, i) => (
              <li key={i}>
                {i + 1}. {local.codigo} - {local.codInterno}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={regenerarRuta}>Regenerar Ruta</button>
            <button onClick={siguienteRuta} style={{ marginLeft: "1rem" }}>
              Siguiente Ruta
            </button>
          </div>
        </>
      ) : (
        <p>✅ No hay más locales pendientes.</p>
      )}

      {mensaje && <p style={{ marginTop: "0.5rem" }}>{mensaje}</p>}
    </div>
  );
}

export default SugerirRuta;
