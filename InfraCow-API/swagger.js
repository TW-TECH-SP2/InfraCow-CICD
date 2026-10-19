import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InfraCow API',
      version: '1.0.0',
      description: 'API para gerenciamento de fazendas, animais e medições de temperatura bovina',
      contact: {
        name: 'InfraCow Team',
      },
    },
    servers: [
      {
        url: 'https://infracow-api-hv24.onrender.com',
        description: 'Servidor de Produção',
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    tags: [
      { name: 'Usuário',      description: 'Cadastro, login e perfil do usuário' },
      { name: 'Fazenda',      description: 'Gerenciamento de fazendas' },
      { name: 'Animal',       description: 'Gerenciamento de animais do rebanho' },
      { name: 'Medição',      description: 'Registro e consulta de medições de temperatura' },
      { name: 'Notificação',  description: 'Notificações geradas por medições de risco' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id_usuario:  { type: 'integer', example: 1 },
            nome:        { type: 'string',  example: 'João Silva' },
            email:       { type: 'string',  example: 'joao@email.com' },
            imagem:      { type: 'string',  nullable: true, example: 'uploads/foto.jpg' },
          },
        },
        Fazenda: {
          type: 'object',
          properties: {
            id_fazenda:   { type: 'integer', example: 1 },
            nome_fazenda: { type: 'string',  example: 'Fazenda Santa Maria' },
            rua:          { type: 'string',  example: 'Estrada Rural' },
            bairro:       { type: 'string',  example: 'Zona Rural' },
            cidade:       { type: 'string',  example: 'Registro' },
            CEP:          { type: 'string',  example: '11900-000' },
            numero:       { type: 'string',  example: 'S/N' },
            imagem:       { type: 'string',  nullable: true, example: 'uploads/fazenda.jpg' },
          },
        },
        Animal: {
          type: 'object',
          properties: {
            id_animal:   { type: 'integer', example: 1 },
            nome_animal: { type: 'string',  example: 'Mimosa' },
            codigo:      { type: 'string',  example: 'BR001' },
            genero:      { type: 'string',  example: 'Fêmea' },
            tipo:        { type: 'string',  example: 'Bovino' },
            raca:        { type: 'string',  example: 'Nelore' },
            peso:        { type: 'number',  example: 450.5 },
            idade:       { type: 'integer', example: 3 },
            id_fazenda:  { type: 'integer', example: 1 },
            imagem:      { type: 'string',  nullable: true, example: 'uploads/animal.jpg' },
          },
        },
        Medicao: {
          type: 'object',
          properties: {
            id_medicao: { type: 'integer', example: 1 },
            temp:       { type: 'number',  example: 38.5 },
            datahora:   { type: 'string',  format: 'date-time', example: '2025-05-01T10:30:00Z' },
            id_animal:  { type: 'integer', example: 1 },
          },
        },
        Notificacao: {
          type: 'object',
          properties: {
            id_notificacao: { type: 'integer', example: 1 },
            id_animal:      { type: 'integer', example: 1 },
            id_medicao:     { type: 'integer', example: 1 },
            perigo:         { type: 'boolean', example: true },
          },
        },
        Erro: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Mensagem de erro' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);