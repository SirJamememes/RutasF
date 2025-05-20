import axios from 'axios';

const BASE_URL = "http://localhost:8080/api";

export const validarFrecuencia = (carga) =>
  axios.post(`${BASE_URL}/locales/validar-frecuencia`, carga);

export const cargarLocalesPendientes = (codigos) =>
  axios.post(`${BASE_URL}/propuesta/cargar`, codigos);

export const sugerirRuta = () =>
  axios.get(`${BASE_URL}/propuesta/sugerir`);

export const confirmarRuta = (ruta) =>
  axios.post(`${BASE_URL}/propuesta/confirmar`, ruta);

export const guardarRutas = (codigoCarga, comentario) =>
  axios.post(`${BASE_URL}/propuesta/guardar`, null, {
    params: { codigoCarga, comentario }
  });

export const obtenerRutasConfirmadas = () =>
  axios.get(`${BASE_URL}/propuesta/confirmadas`);
