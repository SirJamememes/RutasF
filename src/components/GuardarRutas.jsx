import { useState } from 'react';
import { guardarRutas } from '../api/rutasApi';

function GuardarRutas() {
  const [codigoCarga, setCodigoCarga] = useState('');
  const [comentario, setComentario] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleGuardar = async () => {
    if (!codigoCarga) {
      setMensaje('⚠️ Debes ingresar un código de carga.');
      return;
    }

    try {
      await guardarRutas(codigoCarga, comentario);
      setMensaje('✅ Rutas guardadas correctamente en la base de datos.');
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al guardar las rutas.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Guardar Rutas Confirmadas</h2>
      <input
        type="text"
        placeholder="Código de carga (ej. CG25-001)"
        value={codigoCarga}
        onChange={(e) => setCodigoCarga(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Comentario opcional"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={3}
        cols={40}
        style={{ marginTop: '0.5rem' }}
      />
      <br />
      <button onClick={handleGuardar} style={{ marginTop: '0.5rem' }}>
        Guardar en base de datos
      </button>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default GuardarRutas;
