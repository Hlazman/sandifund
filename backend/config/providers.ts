export default ({ env }) => ({
  'google': {
    enabled: true,
    provider: 'google',
    icon: 'google',
    key: env('GOOGLE_CLIENT_ID'),
    secret: env('GOOGLE_CLIENT_SECRET'),
    redirectUri: env('HOST') + ':' + env('PORT') + '/connect/google/callback',
    callback: '/connect/google/callback',
    scope: ['email', 'profile'],
  },
});
