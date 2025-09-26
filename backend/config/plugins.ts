export default ({ env }) => ({
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      landingPage: true,
      depthLimit: 10,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
        introspection: true,
      },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'mail.smtp2go.com'),
        port: env.int('SMTP_PORT', 2525),
        auth: {
          user: env('SMTP2GO_USER'),
          pass: env('SMTP2GO_PASS'),
        },
        secure: false, // use TLS
        tls: {
          rejectUnauthorized: false,
        },
      },
      settings: {
        defaultFrom: env('SMTP2GO_FROM', 'Sandifund <support@sandifund.com>'),
        defaultReplyTo: env('SMTP2GO_REPLYTO', 'support@sandifund.com'),
      },
    },  
  },
});
