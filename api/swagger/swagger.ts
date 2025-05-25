import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PAX API",
      version: "1.0.0",
      description:
        "API-dokumentation för det automatiska rumsbokningssystemet PAX",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.ts"], // Här scannar den efter Swagger-kommentarer i alla filer i routes-mappen
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
