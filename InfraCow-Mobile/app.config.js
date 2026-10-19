// Configuração dinâmica do Expo — COMPLEMENTA o app.json (que continua sendo a fonte).
//
// Única função: permitir trocar a URL da API por variável de ambiente (Docker,
// GitHub Actions, EAS) sem editar o app.json. O app já lê `extra.API_URL`.
//
//   API_URL definida  -> sobrescreve extra.API_URL
//   API_URL ausente   -> devolve o app.json exatamente como está (comportamento original)
module.exports = ({ config }) => {
  const apiUrl = (process.env.API_URL || '').trim().replace(/\/+$/, '');
  if (!apiUrl) return config;

  return {
    ...config,
    extra: {
      ...config.extra,
      API_URL: apiUrl,
    },
  };
};
